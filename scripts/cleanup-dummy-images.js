/**
 * Cleanup Dummy Images Script
 *
 * This script removes all the dummy Unsplash images that were incorrectly uploaded
 * and resets properties to have no images, so we can start fresh with real Google Drive images.
 */

require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Statistics tracking
const stats = {
  totalProperties: 0,
  cleanedProperties: 0,
  deletedImages: 0,
  errors: 0,
  startTime: Date.now(),
};

/**
 * Get all properties that have images
 */
async function getPropertiesWithImages() {
  const { PrismaClient } = require("../src/generated/prisma");
  const prisma = new PrismaClient();

  try {
    const properties = await prisma.property.findMany({
      where: {
        active: true,
        NOT: {
          images: "[]",
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        images: true,
      },
    });

    await prisma.$disconnect();
    return properties;
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    await prisma.$disconnect();
    return [];
  }
}

/**
 * Clear images from database
 */
async function clearPropertyImages(propertyId) {
  const { PrismaClient } = require("../src/generated/prisma");
  const prisma = new PrismaClient();

  try {
    await prisma.property.update({
      where: { id: propertyId },
      data: { images: "[]" },
    });

    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error(`❌ Failed to clear images for property:`, error);
    await prisma.$disconnect();
    return false;
  }
}

/**
 * Delete images from Cloudinary folder
 */
async function deleteCloudinaryFolder(propertySlug) {
  try {
    // Delete all images in the property folder
    const result = await cloudinary.api.delete_resources_by_prefix(
      `avacasa/properties/${propertySlug}/`
    );

    // Delete the folder itself
    await cloudinary.api.delete_folder(`avacasa/properties/${propertySlug}`);

    return result.deleted ? Object.keys(result.deleted).length : 0;
  } catch (error) {
    if (error.error?.message?.includes("folder not found")) {
      return 0; // Folder doesn't exist, that's fine
    }
    console.error(
      `❌ Failed to delete Cloudinary folder for ${propertySlug}:`,
      error.message
    );
    return 0;
  }
}

/**
 * Process cleanup for a single property
 */
async function cleanupProperty(property, index, total) {
  console.log(
    `\n🧹 [${index + 1}/${total}] Cleaning: "${property.title}" (${
      property.slug
    })`
  );

  const existingImages = property.images ? JSON.parse(property.images) : [];
  console.log(`  📸 Found ${existingImages.length} dummy images to remove`);

  try {
    // Delete from Cloudinary
    const deletedCount = await deleteCloudinaryFolder(property.slug);
    console.log(`  ☁️ Deleted ${deletedCount} images from Cloudinary`);

    // Clear from database
    const dbSuccess = await clearPropertyImages(property.id);
    if (dbSuccess) {
      console.log(`  ✅ Cleared images from database`);
      stats.cleanedProperties++;
      stats.deletedImages += existingImages.length;
    } else {
      console.log(`  ❌ Failed to clear database images`);
      stats.errors++;
    }
  } catch (error) {
    console.error(`  ❌ Error cleaning property:`, error.message);
    stats.errors++;
  }
}

/**
 * Print final statistics
 */
function printStatistics() {
  const duration = Math.round((Date.now() - stats.startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  console.log("\n" + "=".repeat(80));
  console.log("🧹 CLEANUP SUMMARY");
  console.log("=".repeat(80));
  console.log(`⏱️  Duration: ${minutes}m ${seconds}s`);
  console.log(`📂 Total properties with images: ${stats.totalProperties}`);
  console.log(`✅ Properties cleaned: ${stats.cleanedProperties}`);
  console.log(`🗑️  Total dummy images deleted: ${stats.deletedImages}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log("=".repeat(80));
  console.log("✅ Cleanup completed! All dummy images have been removed.");
  console.log("🎯 Ready to migrate real Google Drive images now.");
}

/**
 * Main cleanup function
 */
async function main() {
  console.log("🧹 Starting Cleanup of Dummy Images...\n");
  console.log(
    "⚠️  This will remove all existing property images and prepare for real Google Drive migration\n"
  );

  // Check environment variables
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.error("❌ Missing Cloudinary configuration in .env file");
    process.exit(1);
  }

  try {
    // Get all properties with images
    console.log("📋 Fetching properties with images...");
    const properties = await getPropertiesWithImages();

    if (properties.length === 0) {
      console.log("✅ No properties found with images - nothing to clean up!");
      return;
    }

    stats.totalProperties = properties.length;
    console.log(
      `🎯 Found ${properties.length} properties with images to clean up\n`
    );

    // Process each property
    for (let i = 0; i < properties.length; i++) {
      await cleanupProperty(properties[i], i, properties.length);

      // Small delay to avoid overwhelming APIs
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Print final statistics
    printStatistics();
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

// CLI interface
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };

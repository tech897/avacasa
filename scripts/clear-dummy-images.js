/**
 * Clear Dummy Images Script
 * Removes all dummy/sample images from the database
 */

// Load environment variables
require("dotenv").config();

async function clearAllDummyImages() {
  console.log("🧹 CLEARING ALL DUMMY IMAGES FROM DATABASE");
  console.log("=============================================\n");

  const { PrismaClient } = require("../src/generated/prisma");
  const prisma = new PrismaClient();

  try {
    // Get all properties with images
    const propertiesWithImages = await prisma.property.findMany({
      where: {
        images: {
          not: null,
          not: "",
        },
      },
      select: { id: true, slug: true, title: true, images: true },
    });

    console.log(
      `📊 Found ${propertiesWithImages.length} properties with existing images`
    );

    if (propertiesWithImages.length === 0) {
      console.log("✅ No images to clear - database is already clean!");
      await prisma.$disconnect();
      return;
    }

    // Show which properties have images
    console.log("\n📋 Properties with current images:");
    propertiesWithImages.forEach((prop, i) => {
      const imageCount = prop.images ? JSON.parse(prop.images).length : 0;
      console.log(
        `  ${i + 1}. ${prop.title} (${prop.slug}) - ${imageCount} images`
      );
    });

    console.log("\n🗑️  Clearing all images...");

    // Clear images from all properties
    await prisma.property.updateMany({
      where: {
        images: {
          not: null,
          not: "",
        },
      },
      data: {
        images: "",
      },
    });

    console.log(
      `✅ Successfully cleared images from ${propertiesWithImages.length} properties`
    );
    console.log("🧹 Database is now clean and ready for fresh image migration");

    await prisma.$disconnect();

    return {
      cleared: propertiesWithImages.length,
      properties: propertiesWithImages,
    };
  } catch (error) {
    console.error("❌ Error clearing dummy images:", error);
    await prisma.$disconnect();
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
🧹 CLEAR DUMMY IMAGES

USAGE:
  npm run clear-images         # Clear all dummy images
  node scripts/clear-dummy-images.js

WHAT IT DOES:
• Finds all properties with existing images
• Shows you what will be cleared
• Removes all image URLs from database
• Prepares database for fresh migration

SAFE OPERATION:
✅ Only clears database records (not actual image files)
✅ Cloudinary images remain accessible via their URLs
✅ Can be reversed by re-running migration scripts
    `);
  } else {
    clearAllDummyImages().catch(console.error);
  }
}

module.exports = { clearAllDummyImages };

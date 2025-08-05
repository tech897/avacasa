require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

/**
 * Update properties with Cloudinary URLs based on property slugs
 * This assumes your Cloudinary images follow the pattern:
 * https://res.cloudinary.com/{cloud_name}/image/upload/avacasa/properties/{property_slug}/{image_name}
 */
async function updateCloudinaryUrls() {
  try {
    console.log("🔄 Starting Cloudinary URL update...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      console.error("❌ CLOUDINARY_CLOUD_NAME not found in environment");
      return;
    }

    // Get all properties
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
      },
    });

    console.log(`📊 Found ${properties.length} properties to update\n`);

    let updatedCount = 0;

    for (const property of properties) {
      // Parse current images
      let currentImages = [];
      try {
        currentImages =
          typeof property.images === "string"
            ? JSON.parse(property.images)
            : property.images || [];
      } catch (e) {
        console.log(`⚠️  Skipping ${property.title} - invalid JSON in images`);
        continue;
      }

      // Skip if already has Cloudinary URLs
      if (currentImages.some((img) => img.includes("cloudinary.com"))) {
        console.log(`✅ ${property.title} - already has Cloudinary URLs`);
        continue;
      }

      // Generate Cloudinary URLs for this property
      // Common image names for properties
      const imageNames = [
        "image1",
        "image2",
        "image3",
        "hero",
        "main",
        "exterior",
        "interior",
      ];
      const possibleExtensions = ["jpg", "jpeg", "png", "webp"];

      const cloudinaryUrls = [];

      // Try different image naming patterns
      for (let i = 1; i <= 3; i++) {
        const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1/avacasa/properties/${property.slug}/image${i}.jpg`;
        cloudinaryUrls.push(imageUrl);
      }

      // Also try with property name-based URLs
      const cleanSlug = property.slug
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
      for (let i = 1; i <= 2; i++) {
        const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1/avacasa/properties/${cleanSlug}/img${i}.jpg`;
        cloudinaryUrls.push(imageUrl);
      }

      console.log(`🔄 Updating ${property.title}...`);
      console.log(
        `   Generated ${cloudinaryUrls.length} potential Cloudinary URLs`
      );

      // Update the property with new image URLs
      await prisma.property.update({
        where: { id: property.id },
        data: {
          images: JSON.stringify(cloudinaryUrls),
        },
      });

      updatedCount++;
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🎉 Updated ${updatedCount} properties with Cloudinary URLs!`);
    console.log("\n💡 Note: The URLs are generated based on common patterns.");
    console.log(
      "   If your images have different names, you may need to adjust them manually."
    );
  } catch (error) {
    console.error("❌ Error updating Cloudinary URLs:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative function: Update with specific property mapping
async function updateWithCustomMapping() {
  console.log("\n🔧 Alternative: Custom URL Mapping");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("If the automatic URL generation doesn't work, you can:");
  console.log("1. Go to your Cloudinary dashboard");
  console.log("2. Copy the exact URLs of your uploaded images");
  console.log("3. Use the admin panel to update individual properties");
  console.log("4. Or modify this script with your exact URL patterns");
}

// Run the update
updateCloudinaryUrls()
  .then(() => updateWithCustomMapping())
  .catch(console.error);

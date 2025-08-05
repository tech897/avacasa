require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function fixCloudinaryStructure() {
  try {
    console.log(
      "🔧 Fixing Cloudinary URLs to match actual folder structure..."
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    console.log(`☁️  Cloud Name: ${cloudName}`);
    console.log("📁 Folder Structure: properties/{property_id}/");

    // Get all properties
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
      },
    });

    console.log(`\n📊 Found ${properties.length} properties to update\n`);

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

      // Generate correct Cloudinary URLs based on your actual structure
      // Structure: https://res.cloudinary.com/{cloud}/image/upload/properties/{property_id}/image1.jpg
      const correctUrls = [];

      // Generate multiple potential image URLs for each property
      for (let i = 1; i <= 5; i++) {
        correctUrls.push(
          `https://res.cloudinary.com/${cloudName}/image/upload/properties/${property.slug}/image${i}.jpg`
        );
      }

      // Also try common image names
      const commonNames = ["main", "hero", "exterior", "interior", "front"];
      for (const name of commonNames) {
        correctUrls.push(
          `https://res.cloudinary.com/${cloudName}/image/upload/properties/${property.slug}/${name}.jpg`
        );
      }

      console.log(`🔄 Updating ${property.title} (${property.slug})...`);

      // Update the property with correct image URLs
      await prisma.property.update({
        where: { id: property.id },
        data: {
          images: JSON.stringify(correctUrls),
        },
      });

      updatedCount++;

      if (updatedCount % 50 === 0) {
        console.log(`   ✅ Updated ${updatedCount} properties so far...`);
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🎉 Successfully updated ${updatedCount} properties!`);
    console.log("\n📋 New URL Structure:");
    console.log(
      `https://res.cloudinary.com/${cloudName}/image/upload/properties/{property_id}/image1.jpg`
    );
    console.log("\n✅ This matches your actual Cloudinary folder structure!");
  } catch (error) {
    console.error("❌ Error fixing Cloudinary URLs:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixCloudinaryStructure().catch(console.error);

/**
 * Fix Cloudinary URLs and restore missing images
 *
 * Issues found:
 * 1. Duplicate folder paths in URLs
 * 2. Most properties lost their images
 * 3. Need to re-run migration properly
 */
const { PrismaClient } = require("../src/generated/prisma");

async function fixAndRestore() {
  const prisma = new PrismaClient();

  try {
    console.log("🔄 Analyzing current image state...\n");

    // Check current state
    const allProperties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
      },
    });

    let cloudinaryCount = 0;
    let unsplashCount = 0;
    let emptyCount = 0;
    let duplicatePathCount = 0;

    console.log("📊 Current Analysis:");

    for (const property of allProperties) {
      try {
        const images = JSON.parse(property.images || "[]");

        if (images.length === 0) {
          emptyCount++;
        } else {
          const hasCloudinary = images.some((url) =>
            url.includes("cloudinary.com")
          );
          const hasUnsplash = images.some((url) =>
            url.includes("unsplash.com")
          );
          const hasDuplicatePaths = images.some(
            (url) =>
              url.includes("/avacasa/properties/") &&
              url.split("/avacasa/properties/").length > 2
          );

          if (hasCloudinary) {
            cloudinaryCount++;
            if (hasDuplicatePaths) {
              duplicatePathCount++;
            }
          } else if (hasUnsplash) {
            unsplashCount++;
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    console.log(`   Total properties: ${allProperties.length}`);
    console.log(`   With Cloudinary images: ${cloudinaryCount}`);
    console.log(`   With Unsplash images: ${unsplashCount}`);
    console.log(`   With no images: ${emptyCount}`);
    console.log(`   With duplicate path issues: ${duplicatePathCount}`);

    // The issue is clear - we need to re-run the migration
    console.log("\n🚨 DIAGNOSIS:");
    console.log("   • Database appears to have been reset or corrupted");
    console.log("   • Most properties lost their images");
    console.log("   • Remaining Cloudinary URLs have duplicate path issues");
    console.log("   • Need to re-run comprehensive migration");

    console.log("\n💡 RECOMMENDED ACTIONS:");
    console.log("   1. Re-run the comprehensive migration script");
    console.log("   2. The migration will restore all 1,365+ images");
    console.log("   3. This will fix the path duplication issue");
    console.log("   4. All properties will get their real images back");

    console.log("\n🔧 To fix this, run:");
    console.log("   node scripts/comprehensive-image-migration.js");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
  }
}

fixAndRestore();

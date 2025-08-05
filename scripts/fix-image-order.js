/**
 * Fix image order to prioritize Cloudinary images over placeholder images
 */
const { PrismaClient } = require("../src/generated/prisma");

async function fixImageOrder() {
  const prisma = new PrismaClient();

  try {
    console.log("🔄 Fixing image order to prioritize Cloudinary images...\n");

    // Get all properties with images
    const properties = await prisma.property.findMany({
      where: {
        images: { not: "[]" },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
      },
    });

    console.log(`Found ${properties.length} properties with images`);

    let updated = 0;
    let skipped = 0;

    for (const property of properties) {
      try {
        const images = JSON.parse(property.images || "[]");

        if (images.length === 0) {
          skipped++;
          continue;
        }

        // Separate Cloudinary and non-Cloudinary images
        const cloudinaryImages = images.filter((url) =>
          url.includes("cloudinary.com")
        );
        const otherImages = images.filter(
          (url) => !url.includes("cloudinary.com")
        );

        if (cloudinaryImages.length === 0) {
          // No Cloudinary images, skip
          skipped++;
          continue;
        }

        // Put Cloudinary images first, then other images
        const reorderedImages = [...cloudinaryImages, ...otherImages];

        // Only update if order changed
        if (JSON.stringify(images) !== JSON.stringify(reorderedImages)) {
          await prisma.property.update({
            where: { id: property.id },
            data: {
              images: JSON.stringify(reorderedImages),
            },
          });

          console.log(`✅ Updated: ${property.title}`);
          console.log(
            `   Before: First image was ${
              images[0].includes("cloudinary.com")
                ? "Cloudinary"
                : "placeholder"
            }`
          );
          console.log(
            `   After: First image is ${
              reorderedImages[0].includes("cloudinary.com")
                ? "Cloudinary"
                : "placeholder"
            }`
          );
          console.log(
            `   Total images: ${reorderedImages.length} (${cloudinaryImages.length} Cloudinary, ${otherImages.length} other)`
          );
          console.log("");

          updated++;
        } else {
          // Already in correct order
          skipped++;
        }
      } catch (parseError) {
        console.error(
          `❌ Parse error for ${property.title}:`,
          parseError.message
        );
      }
    }

    console.log("🎯 Summary:");
    console.log(`   Properties updated: ${updated}`);
    console.log(`   Properties skipped: ${skipped}`);
    console.log(`   Total processed: ${properties.length}`);

    if (updated > 0) {
      console.log(
        "\n✅ Image order fixed! Cloudinary images will now appear first."
      );
      console.log("🔄 Please refresh your website to see the changes.");
    } else {
      console.log("\n📋 No changes needed - images already in correct order.");
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
  }
}

fixImageOrder();

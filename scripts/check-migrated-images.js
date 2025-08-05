/**
 * Check specific properties that were mentioned in migration logs
 */
const { PrismaClient } = require("../src/generated/prisma");

async function checkMigratedImages() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Checking specific migrated properties...\n");

    // Properties that we know were processed during migration
    const testProperties = [
      "Acasa",
      "Mango Lakefront",
      "Navrang Farms",
      "Luxe Villas",
      "Waterscape",
      "Vogue",
      "Dapoli Hills",
      "Natadol Hills",
    ];

    for (const propertyName of testProperties) {
      console.log(`🔍 Looking for: ${propertyName}`);

      const property = await prisma.property.findFirst({
        where: {
          OR: [
            { title: { contains: propertyName, mode: "insensitive" } },
            {
              slug: {
                contains: propertyName.toLowerCase().replace(/\s+/g, "-"),
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          images: true,
        },
      });

      if (property) {
        console.log(`   ✅ Found: ${property.title} (${property.slug})`);
        console.log(`   Images field: ${property.images}`);

        try {
          const parsedImages = JSON.parse(property.images || "[]");
          console.log(`   Count: ${parsedImages.length}`);

          if (parsedImages.length > 0) {
            const hasCloudinaryImages = parsedImages.some((url) =>
              url.includes("cloudinary.com")
            );
            console.log(`   Has Cloudinary images: ${hasCloudinaryImages}`);

            if (hasCloudinaryImages) {
              const cloudinaryUrls = parsedImages.filter((url) =>
                url.includes("cloudinary.com")
              );
              console.log(`   Cloudinary URLs (${cloudinaryUrls.length}):`);
              cloudinaryUrls
                .slice(0, 2)
                .forEach((url) => console.log(`     ${url}`));
            } else {
              console.log(`   Sample URLs:`);
              parsedImages
                .slice(0, 2)
                .forEach((url) => console.log(`     ${url}`));
            }
          }
        } catch (parseError) {
          console.log(`   ❌ Parse error: ${parseError.message}`);
        }
      } else {
        console.log(`   ❌ Not found`);
      }

      console.log("");
    }

    // Also check how many properties have Cloudinary images
    const allProperties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    let cloudinaryCount = 0;
    let unsplashCount = 0;
    let emptyCount = 0;

    allProperties.forEach((prop) => {
      try {
        const images = JSON.parse(prop.images || "[]");
        if (images.length === 0) {
          emptyCount++;
        } else if (images.some((url) => url.includes("cloudinary.com"))) {
          cloudinaryCount++;
        } else if (images.some((url) => url.includes("unsplash.com"))) {
          unsplashCount++;
        }
      } catch (e) {
        // ignore parse errors
      }
    });

    console.log("📊 Image URL Analysis:");
    console.log(`   Total properties: ${allProperties.length}`);
    console.log(`   With Cloudinary images: ${cloudinaryCount}`);
    console.log(`   With Unsplash images: ${unsplashCount}`);
    console.log(`   With no images: ${emptyCount}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    await prisma.$disconnect();
  }
}

checkMigratedImages();

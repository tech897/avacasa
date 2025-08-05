require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function checkImageUrls() {
  try {
    console.log("🖼️  Checking property image URLs...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Get first 5 properties with their images
    const properties = await prisma.property.findMany({
      take: 5,
      select: {
        title: true,
        slug: true,
        images: true,
      },
    });

    console.log(
      `\n📊 Found ${properties.length} properties. Checking their images:\n`
    );

    let cloudinaryCount = 0;
    let unsplashCount = 0;
    let otherCount = 0;

    for (const property of properties) {
      console.log(`🏠 ${property.title} (${property.slug}):`);

      let images = [];
      try {
        images =
          typeof property.images === "string"
            ? JSON.parse(property.images)
            : property.images || [];
      } catch (e) {
        console.log("   ⚠️  Invalid JSON in images field");
        continue;
      }

      if (images && images.length > 0) {
        images.forEach((imageUrl, index) => {
          let type = "";
          if (imageUrl.includes("cloudinary.com")) {
            type = "☁️  Cloudinary";
            cloudinaryCount++;
          } else if (imageUrl.includes("unsplash.com")) {
            type = "🖼️  Unsplash (placeholder)";
            unsplashCount++;
          } else {
            type = "❓ Other";
            otherCount++;
          }

          console.log(
            `   ${index + 1}. ${type}: ${imageUrl.substring(0, 80)}...`
          );
        });
      } else {
        console.log("   ⚠️  No images found");
      }
      console.log("");
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📈 Image URL Summary:");
    console.log(`☁️  Cloudinary URLs: ${cloudinaryCount}`);
    console.log(`🖼️  Unsplash (placeholder) URLs: ${unsplashCount}`);
    console.log(`❓ Other URLs: ${otherCount}`);

    if (cloudinaryCount === 0) {
      console.log("\n❌ No Cloudinary URLs found!");
      console.log(
        "💡 Your images might not have been migrated to the database yet."
      );
    } else if (unsplashCount > 0) {
      console.log("\n⚠️  Some images are still using Unsplash placeholders.");
      console.log("💡 Image migration may be incomplete.");
    } else {
      console.log("\n✅ All images are using Cloudinary!");
    }
  } catch (error) {
    console.error("❌ Error checking image URLs:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImageUrls();

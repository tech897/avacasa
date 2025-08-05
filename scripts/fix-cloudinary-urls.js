require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function fixCloudinaryUrls() {
  console.log("🔧 Fixing Cloudinary URLs...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  console.log(`☁️  Cloud Name: ${cloudName}`);

  // Get a few sample properties to test with
  const sampleProperties = await prisma.property.findMany({
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      images: true,
    },
  });

  console.log("\n📋 Sample Properties and Current URLs:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  for (const property of sampleProperties) {
    console.log(`\n🏠 ${property.title}`);
    console.log(`   Slug: ${property.slug}`);

    let images = [];
    try {
      images =
        typeof property.images === "string"
          ? JSON.parse(property.images)
          : property.images || [];
    } catch (e) {
      console.log("   ❌ Invalid JSON in images");
      continue;
    }

    console.log(`   Current Images (${images.length}):`);
    images.forEach((img, i) => {
      console.log(`     ${i + 1}. ${img}`);
    });
  }

  console.log("\n🎯 COMMON CLOUDINARY URL PATTERNS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    "1. https://res.cloudinary.com/{cloud}/image/upload/{folder}/{property_id}/image1.jpg"
  );
  console.log(
    "2. https://res.cloudinary.com/{cloud}/image/upload/v1/{folder}/{property_id}.jpg"
  );
  console.log(
    "3. https://res.cloudinary.com/{cloud}/image/upload/{folder}/property_{id}_1.jpg"
  );
  console.log(
    "4. https://res.cloudinary.com/{cloud}/image/upload/avacasa/{property_slug}/image1.jpg"
  );
  console.log(
    "5. https://res.cloudinary.com/{cloud}/image/upload/properties/{property_id}/main.jpg"
  );

  console.log("\n💡 TO FIX THIS:");
  console.log(
    "1. Check your Cloudinary console for the exact folder structure"
  );
  console.log("2. Copy 1-2 actual image URLs from Cloudinary");
  console.log(
    "3. Tell me the pattern so I can update all 419 properties correctly"
  );

  await prisma.$disconnect();
}

fixCloudinaryUrls().catch(console.error);

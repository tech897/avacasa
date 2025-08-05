require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("🔗 Testing database connection...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection: SUCCESS");

    // Count properties
    const propertyCount = await prisma.property.count();
    console.log(`✅ Properties in database: ${propertyCount}`);

    // Count locations
    const locationCount = await prisma.location.count();
    console.log(`✅ Locations in database: ${locationCount}`);

    // Get a sample property
    const sampleProperty = await prisma.property.findFirst({
      select: {
        title: true,
        slug: true,
        price: true,
        location: {
          select: { name: true },
        },
      },
    });

    if (sampleProperty) {
      console.log(
        `✅ Sample property: "${sampleProperty.title}" in ${sampleProperty.location.name}`
      );
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 Database connection test PASSED!");
  } catch (error) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ Database connection test FAILED:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

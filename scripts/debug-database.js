require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("../src/generated/prisma");

async function debugDatabase() {
  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

  try {
    console.log("🔍 Debug database connection...");
    console.log(
      "DATABASE_URL:",
      process.env.DATABASE_URL.substring(0, 60) + "..."
    );

    // Test basic connection
    console.log("\n1. Testing basic connection...");
    await prisma.$connect();
    console.log("✅ Connected successfully");

    // Count with error handling
    console.log("\n2. Counting properties...");
    try {
      const propertyCount = await prisma.property.count();
      console.log("Properties found:", propertyCount);

      if (propertyCount > 0) {
        console.log("\n3. Getting sample properties...");
        const sampleProperties = await prisma.property.findMany({
          take: 3,
          select: { title: true, slug: true },
        });
        console.log("Sample properties:", sampleProperties);
      }
    } catch (error) {
      console.error("Error with properties:", error.message);
    }

    // Count locations
    console.log("\n4. Counting locations...");
    try {
      const locationCount = await prisma.location.count();
      console.log("Locations found:", locationCount);
    } catch (error) {
      console.error("Error with locations:", error.message);
    }
  } catch (error) {
    console.error("❌ Database debug failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();

/**
 * Property Database Checker
 * Lists all properties in the database to help with migration mapping
 */

async function checkProperties() {
  try {
    const { PrismaClient } = require("../src/generated/prisma");
    const prisma = new PrismaClient();

    console.log("📊 Checking properties in your database...\n");

    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        featured: true,
        active: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (properties.length === 0) {
      console.log("❌ No properties found in database.");
      console.log("💡 Make sure you have run the CSV import first:");
      console.log("   npm run import-csv");
      return;
    }

    console.log(`✅ Found ${properties.length} properties in database:\n`);
    console.log("=".repeat(80));

    properties.forEach((property, index) => {
      const imageCount = property.images
        ? JSON.parse(property.images).length
        : 0;
      const status = property.active ? "✅" : "❌";
      const featured = property.featured ? "⭐" : "  ";

      console.log(
        `${(index + 1).toString().padStart(3)}. ${status}${featured} ${
          property.title
        }`
      );
      console.log(`     Slug: ${property.slug}`);
      console.log(
        `     Images: ${imageCount} | Created: ${new Date(
          property.createdAt
        ).toLocaleDateString()}`
      );
      console.log("");
    });

    console.log("=".repeat(80));
    console.log(`📊 Summary:`);
    console.log(`   Total properties: ${properties.length}`);
    console.log(`   Active: ${properties.filter((p) => p.active).length}`);
    console.log(`   Featured: ${properties.filter((p) => p.featured).length}`);
    console.log(
      `   With images: ${
        properties.filter((p) => {
          const imageCount = p.images ? JSON.parse(p.images).length : 0;
          return imageCount > 0;
        }).length
      }`
    );

    // Check for potential matches with Google Drive folder names
    console.log("\n🔍 Potential Google Drive folder name matches:");
    console.log(
      "   (These are suggestions for property folder names to look for)\n"
    );

    const suggestions = properties.map((property) => {
      // Generate potential folder names
      const potentialNames = [
        property.title,
        property.title.replace(/[^\w\s]/g, ""), // Remove special chars
        property.slug.replace(/-/g, " "), // Convert slug back to words
      ];

      return {
        property: property.title,
        slug: property.slug,
        potentialFolderNames: [...new Set(potentialNames)], // Remove duplicates
      };
    });

    suggestions.forEach((suggestion, index) => {
      console.log(
        `${(index + 1).toString().padStart(3)}. Property: ${
          suggestion.property
        }`
      );
      console.log(`     Slug: ${suggestion.slug}`);
      console.log(`     Look for folders named:`);
      suggestion.potentialFolderNames.forEach((name) => {
        console.log(`       - "${name}"`);
      });
      console.log("");
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error checking properties:", error);
    process.exit(1);
  }
}

// CLI help
function showHelp() {
  console.log(`
📊 Property Database Checker

USAGE:
  npm run check-properties           # List all properties in database
  node scripts/check-properties.js  # Direct execution

DESCRIPTION:
  This script helps you verify what properties are in your database
  and suggests potential Google Drive folder names to look for during migration.

OUTPUT:
  - Lists all properties with titles, slugs, and current image counts
  - Shows database statistics
  - Suggests potential Google Drive folder names for each property

USE BEFORE:
  Running the image migration to understand your property structure
  and identify any properties that might need manual mapping.
  `);
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    showHelp();
  } else {
    checkProperties();
  }
}

module.exports = { checkProperties };

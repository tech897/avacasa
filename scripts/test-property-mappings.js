/**
 * Test Property Mappings - Dry Run
 *
 * This script tests the property mappings without uploading anything
 */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("../src/generated/prisma");

const ZIP_FOLDER = path.join(__dirname, "../PropertyImages3");

/**
 * Get all properties from database
 */
async function getAllProperties() {
  const prisma = new PrismaClient();
  try {
    const properties = await prisma.property.findMany({
      where: { active: true },
      select: {
        id: true,
        slug: true,
        title: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });
    await prisma.$disconnect();
    return properties;
  } catch (error) {
    console.error("❌ Error fetching properties:", error);
    await prisma.$disconnect();
    return [];
  }
}

/**
 * Normalize string for comparison
 */
function normalizeString(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Create mapping between zip files and database properties
 */
function createPropertyMappings(zipFiles, dbProperties) {
  const mappings = [];
  const unmatchedZips = [];

  console.log("🔍 Creating property mappings...\n");

  for (const zipFile of zipFiles) {
    const zipName = path.basename(zipFile, ".zip");
    let matched = false;
    let matchType = "";
    let matchedProperty = null;

    // Try exact title match first
    for (const property of dbProperties) {
      if (normalizeString(property.title) === normalizeString(zipName)) {
        matchedProperty = property;
        matchType = "exact_title";
        matched = true;
        break;
      }
    }

    // Try partial title match
    if (!matched) {
      for (const property of dbProperties) {
        if (
          normalizeString(property.title).includes(normalizeString(zipName)) ||
          normalizeString(zipName).includes(normalizeString(property.title))
        ) {
          matchedProperty = property;
          matchType = "partial_title";
          matched = true;
          break;
        }
      }
    }

    // Try slug match (if zip name looks like AVA00XXX)
    if (!matched && zipName.match(/^AVA\d+$/i)) {
      for (const property of dbProperties) {
        if (property.slug.toLowerCase() === zipName.toLowerCase()) {
          matchedProperty = property;
          matchType = "slug";
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      mappings.push({
        zipFile,
        zipName,
        property: matchedProperty,
        matchType,
      });

      console.log(
        `✅ ${zipName} → ${matchedProperty.title} (${matchedProperty.slug}) [${matchType}]`
      );
    } else {
      unmatchedZips.push({ zipFile, zipName });
      console.log(`❌ ${zipName} → No match found`);
    }
  }

  return { mappings, unmatchedZips };
}

/**
 * Test image count in a zip file
 */
function testZipImageCount(zipFile) {
  try {
    const AdmZip = require("adm-zip");
    const zip = new AdmZip(zipFile);
    const entries = zip.getEntries();
    const SUPPORTED_FORMATS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    let imageCount = 0;
    for (const entry of entries) {
      if (!entry.isDirectory) {
        const ext = path.extname(entry.entryName).toLowerCase();
        if (SUPPORTED_FORMATS.includes(ext)) {
          imageCount++;
        }
      }
    }

    return imageCount;
  } catch (error) {
    return 0;
  }
}

/**
 * Main test function
 */
async function main() {
  try {
    console.log("🧪 Testing Property Mappings");
    console.log("============================\n");

    // Check if PropertyImages3 folder exists
    if (!fs.existsSync(ZIP_FOLDER)) {
      console.log(`❌ PropertyImages3 folder not found at: ${ZIP_FOLDER}`);
      return;
    }

    // Get all zip files
    const allFiles = fs.readdirSync(ZIP_FOLDER);
    const zipFiles = allFiles
      .filter((file) => file.endsWith(".zip"))
      .map((file) => path.join(ZIP_FOLDER, file));

    console.log(`📦 Found ${zipFiles.length} zip files`);

    // Get all properties from database
    console.log(`📊 Fetching properties from database...`);
    const dbProperties = await getAllProperties();
    console.log(`📋 Found ${dbProperties.length} properties in database\n`);

    // Create mappings
    const { mappings, unmatchedZips } = createPropertyMappings(
      zipFiles,
      dbProperties
    );

    console.log(`\n📊 Mapping Results:`);
    console.log(`✅ Matched: ${mappings.length} zip files`);
    console.log(`❌ Unmatched: ${unmatchedZips.length} zip files`);

    // Show detailed results for matched properties
    if (mappings.length > 0) {
      console.log(`\n✅ Successfully Matched Properties:`);
      console.log("=".repeat(80));

      let totalImages = 0;
      for (let i = 0; i < mappings.length; i++) {
        const mapping = mappings[i];
        const imageCount = testZipImageCount(mapping.zipFile);
        totalImages += imageCount;

        console.log(
          `${(i + 1).toString().padStart(3)}. ${mapping.property.title}`
        );
        console.log(`     Slug: ${mapping.property.slug}`);
        console.log(`     ZIP: ${mapping.zipName}`);
        console.log(`     Match Type: ${mapping.matchType}`);
        console.log(`     Images: ${imageCount}`);
        console.log(
          `     Current DB Images: ${
            mapping.property.images
              ? JSON.parse(mapping.property.images).length
              : 0
          }`
        );
        console.log("");
      }

      console.log("=".repeat(80));
      console.log(`📊 Summary for Matched Properties:`);
      console.log(`   Total properties: ${mappings.length}`);
      console.log(`   Total images to process: ${totalImages}`);
      console.log(
        `   Average images per property: ${(
          totalImages / mappings.length
        ).toFixed(1)}`
      );
    }

    // Show unmatched zip files
    if (unmatchedZips.length > 0) {
      console.log(`\n❌ Unmatched ZIP Files:`);
      console.log("=".repeat(80));

      unmatchedZips.forEach((item, index) => {
        const imageCount = testZipImageCount(item.zipFile);
        console.log(
          `${(index + 1).toString().padStart(3)}. ${
            item.zipName
          } (${imageCount} images)`
        );
      });

      console.log(`\n💡 Suggestions for unmatched files:`);
      console.log(
        `   1. Check if property names in database match zip file names`
      );
      console.log(
        `   2. Some properties might be inactive or missing from database`
      );
      console.log(`   3. Consider manual mapping for important properties`);
    }

    // Show next steps
    if (mappings.length > 0) {
      console.log(`\n🚀 Next Steps:`);
      console.log(`   1. Review the mappings above`);
      console.log(`   2. Make sure Cloudinary environment variables are set:`);
      console.log(`      - CLOUDINARY_CLOUD_NAME`);
      console.log(`      - CLOUDINARY_API_KEY`);
      console.log(`      - CLOUDINARY_API_SECRET`);
      console.log(
        `   3. Run the full script: node scripts/process-property-images.js`
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };

/**
 * Process Property Images from ZIP Files
 *
 * This script processes property images from the PropertyImages3 zip files:
 * 1. Extracts zip files
 * 2. Matches them to database properties
 * 3. Uploads images to Cloudinary
 * 4. Updates database with new image URLs
 */

const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { PrismaClient } = require("../src/generated/prisma");
const { v2: cloudinary } = require("cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ZIP_FOLDER = path.join(__dirname, "../PropertyImages3");
const TEMP_EXTRACT_FOLDER = path.join(__dirname, "../temp-extracted-images");
const MAX_IMAGES_PER_PROPERTY = 10;

// Supported image formats
const SUPPORTED_FORMATS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

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
 * Create mapping between zip files and database properties
 */
function createPropertyMappings(zipFiles, dbProperties) {
  const mappings = [];
  const unmatchedZips = [];

  for (const zipFile of zipFiles) {
    const zipName = path.basename(zipFile, ".zip");
    let matched = false;

    // Try exact title match first
    for (const property of dbProperties) {
      if (normalizeString(property.title) === normalizeString(zipName)) {
        mappings.push({
          zipFile,
          zipName,
          property,
          matchType: "exact_title",
        });
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
          mappings.push({
            zipFile,
            zipName,
            property,
            matchType: "partial_title",
          });
          matched = true;
          break;
        }
      }
    }

    // Try slug match (if zip name looks like AVA00XXX)
    if (!matched && zipName.match(/^AVA\d+$/i)) {
      for (const property of dbProperties) {
        if (property.slug.toLowerCase() === zipName.toLowerCase()) {
          mappings.push({
            zipFile,
            zipName,
            property,
            matchType: "slug",
          });
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      unmatchedZips.push({ zipFile, zipName });
    }
  }

  return { mappings, unmatchedZips };
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
 * Extract images from zip file
 */
async function extractImagesFromZip(zipFilePath, extractPath) {
  try {
    const zip = new AdmZip(zipFilePath);
    const entries = zip.getEntries();
    const extractedImages = [];

    // Create extraction directory
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    for (const entry of entries) {
      if (!entry.isDirectory) {
        const ext = path.extname(entry.entryName).toLowerCase();
        if (SUPPORTED_FORMATS.includes(ext)) {
          const fileName = path.basename(entry.entryName);
          const extractedPath = path.join(extractPath, fileName);

          // Extract file
          zip.extractEntryTo(entry, extractPath, false, true);

          if (fs.existsSync(extractedPath)) {
            extractedImages.push(extractedPath);
          }
        }
      }
    }

    return extractedImages.slice(0, MAX_IMAGES_PER_PROPERTY); // Limit images per property
  } catch (error) {
    console.error(`❌ Error extracting ${zipFilePath}:`, error.message);
    return [];
  }
}

/**
 * Upload image to Cloudinary
 */
async function uploadToCloudinary(imagePath, fileName, propertySlug) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: `properties/${propertySlug}`,
      public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
      resource_type: "image",
      format: "webp", // Convert to WebP for optimization
      quality: 85,
      transformation: [
        { width: 1200, height: 800, crop: "limit" },
        { quality: 85 },
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error.message);
    return null;
  }
}

/**
 * Update property images in database
 */
async function updatePropertyImages(propertyId, newImageUrls) {
  const prisma = new PrismaClient();
  try {
    // Get existing images
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { images: true },
    });

    const existingImages = existingProperty?.images
      ? JSON.parse(existingProperty.images)
      : [];
    const allImages = [...existingImages, ...newImageUrls];

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        images: JSON.stringify(allImages),
      },
    });

    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error(`❌ Error updating property ${propertyId}:`, error.message);
    await prisma.$disconnect();
    return false;
  }
}

/**
 * Process a single property mapping
 */
async function processPropertyMapping(mapping, index, total) {
  console.log(`\n🏠 [${index + 1}/${total}] Processing: ${mapping.zipName}`);
  console.log(
    `📍 Property: ${mapping.property.title} (${mapping.property.slug})`
  );
  console.log(`🔗 Match Type: ${mapping.matchType}`);
  console.log("=".repeat(80));

  // Create temp extraction folder for this property
  const tempExtractPath = path.join(TEMP_EXTRACT_FOLDER, mapping.property.slug);

  try {
    // Extract images from zip
    console.log(`📦 Extracting images from zip...`);
    const extractedImages = await extractImagesFromZip(
      mapping.zipFile,
      tempExtractPath
    );

    if (extractedImages.length === 0) {
      console.log(`⚠️  No images found in zip file`);
      return { processed: false, reason: "No images found" };
    }

    console.log(`📸 Found ${extractedImages.length} images`);

    // Upload images to Cloudinary
    const uploadedUrls = [];
    const failed = [];

    for (let i = 0; i < extractedImages.length; i++) {
      const imagePath = extractedImages[i];
      const fileName = `${mapping.property.slug}-image-${i + 1}`;

      console.log(
        `  ☁️  [${i + 1}/${extractedImages.length}] Uploading: ${path.basename(
          imagePath
        )}`
      );

      const uploadedUrl = await uploadToCloudinary(
        imagePath,
        fileName,
        mapping.property.slug
      );

      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl);
        console.log(`    ✅ Success: ${uploadedUrl}`);
      } else {
        failed.push(path.basename(imagePath));
        console.log(`    ❌ Failed: ${path.basename(imagePath)}`);
      }
    }

    // Update database
    if (uploadedUrls.length > 0) {
      console.log(`💾 Updating database...`);
      const success = await updatePropertyImages(
        mapping.property.id,
        uploadedUrls
      );

      if (success) {
        console.log(`✅ Updated property with ${uploadedUrls.length} images`);
      } else {
        console.log(`❌ Failed to update database`);
      }
    }

    // Cleanup temp files
    if (fs.existsSync(tempExtractPath)) {
      fs.rmSync(tempExtractPath, { recursive: true, force: true });
    }

    return {
      processed: true,
      successful: uploadedUrls.length,
      failed: failed.length,
      urls: uploadedUrls,
    };
  } catch (error) {
    console.error(`❌ Error processing ${mapping.zipName}:`, error.message);

    // Cleanup on error
    if (fs.existsSync(tempExtractPath)) {
      fs.rmSync(tempExtractPath, { recursive: true, force: true });
    }

    return { processed: false, reason: error.message };
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log("🚀 Starting Property Images Processing");
    console.log("=====================================\n");

    // Check if required modules are installed
    try {
      require("adm-zip");
    } catch (error) {
      console.log("❌ Missing required module: adm-zip");
      console.log("💡 Please install it by running: npm install adm-zip");
      return;
    }

    // Check Cloudinary configuration
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.log("❌ Cloudinary configuration missing");
      console.log(
        "💡 Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables"
      );
      return;
    }

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
    console.log(`📋 Found ${dbProperties.length} properties in database`);

    // Create mappings
    console.log(`🔗 Creating property mappings...`);
    const { mappings, unmatchedZips } = createPropertyMappings(
      zipFiles,
      dbProperties
    );

    console.log(`\n📊 Mapping Results:`);
    console.log(`✅ Matched: ${mappings.length} zip files`);
    console.log(`❌ Unmatched: ${unmatchedZips.length} zip files`);

    if (unmatchedZips.length > 0) {
      console.log(`\n⚠️  Unmatched zip files:`);
      unmatchedZips.forEach((item) => {
        console.log(`   - ${item.zipName}`);
      });
    }

    if (mappings.length === 0) {
      console.log(`❌ No mappings found. Exiting.`);
      return;
    }

    // Ask for confirmation
    console.log(`\n🤔 Ready to process ${mappings.length} properties.`);
    console.log(`Press Ctrl+C to cancel, or Enter to continue...`);

    // Start processing
    const stats = {
      totalMappings: mappings.length,
      processed: 0,
      successful: 0,
      failed: 0,
      totalImages: 0,
    };

    for (let i = 0; i < mappings.length; i++) {
      const result = await processPropertyMapping(
        mappings[i],
        i,
        mappings.length
      );

      if (result.processed) {
        stats.processed++;
        stats.successful += result.successful || 0;
        stats.failed += result.failed || 0;
        stats.totalImages += (result.successful || 0) + (result.failed || 0);
      }

      // Small delay to avoid overwhelming Cloudinary
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Final cleanup
    if (fs.existsSync(TEMP_EXTRACT_FOLDER)) {
      fs.rmSync(TEMP_EXTRACT_FOLDER, { recursive: true, force: true });
    }

    // Final report
    console.log(`\n🎉 Processing Complete!`);
    console.log("=".repeat(50));
    console.log(`📊 Final Statistics:`);
    console.log(
      `   Properties processed: ${stats.processed}/${stats.totalMappings}`
    );
    console.log(`   Images uploaded successfully: ${stats.successful}`);
    console.log(`   Images failed: ${stats.failed}`);
    console.log(`   Total images processed: ${stats.totalImages}`);
  } catch (error) {
    console.error("❌ Fatal error:", error);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  processPropertyMapping,
  createPropertyMappings,
  getAllProperties,
};

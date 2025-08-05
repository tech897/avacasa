/**
 * Debug Script - Check Property Folder Count
 *
 * This script helps debug why only 77 folders are found instead of 348.
 * It will scan the local "Property Data" folder and provide detailed information.
 */

const fs = require("fs");
const path = require("path");

/**
 * Recursively scan a directory and count all items
 */
function scanDirectory(dirPath, depth = 0, maxDepth = 3) {
  const result = {
    folders: [],
    files: [],
    totalFolders: 0,
    totalFiles: 0,
  };

  try {
    if (!fs.existsSync(dirPath)) {
      console.log(`❌ Directory does not exist: ${dirPath}`);
      return result;
    }

    const items = fs.readdirSync(dirPath);
    console.log(
      `${"  ".repeat(depth)}📁 Scanning: ${path.basename(dirPath)} (${
        items.length
      } items)`
    );

    for (const item of items) {
      const itemPath = path.join(dirPath, item);

      try {
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          result.folders.push({
            name: item,
            path: itemPath,
            depth: depth,
          });
          result.totalFolders++;

          console.log(`${"  ".repeat(depth + 1)}📂 Folder: ${item}`);

          // Recursively scan subdirectories (with depth limit)
          if (depth < maxDepth) {
            const subResult = scanDirectory(itemPath, depth + 1, maxDepth);
            result.totalFolders += subResult.totalFolders;
            result.totalFiles += subResult.totalFiles;
            result.folders.push(...subResult.folders);
            result.files.push(...subResult.files);
          }
        } else if (stat.isFile()) {
          result.files.push({
            name: item,
            path: itemPath,
            size: stat.size,
            extension: path.extname(item).toLowerCase(),
          });
          result.totalFiles++;

          // Only log CSV files and some examples
          if (item.endsWith(".csv") || result.totalFiles <= 5) {
            console.log(
              `${"  ".repeat(depth + 1)}📄 File: ${item} (${Math.round(
                stat.size / 1024
              )}KB)`
            );
          }
        }
      } catch (error) {
        console.warn(
          `${"  ".repeat(depth + 1)}⚠️  Cannot access: ${item} - ${
            error.message
          }`
        );
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning ${dirPath}:`, error.message);
  }

  return result;
}

/**
 * Main debug function
 */
async function main() {
  console.log("🔍 DEBUG: Property Folder Count Analysis\n");
  console.log("=".repeat(80));

  // Check the expected path
  const propertyDataPath = path.join(__dirname, "..", "Property Data");
  console.log(`📍 Looking for Property Data at: ${propertyDataPath}\n`);

  if (!fs.existsSync(propertyDataPath)) {
    console.log("❌ Property Data folder not found!");
    console.log("\n💡 Possible solutions:");
    console.log("1. Download the complete Google Drive folder");
    console.log('2. Make sure it\'s named exactly "Property Data"');
    console.log("3. Place it in the project root directory\n");

    // Check if there are any similar folders
    const projectRoot = path.join(__dirname, "..");
    console.log("🔍 Checking project root for similar folders...");

    try {
      const rootItems = fs.readdirSync(projectRoot);
      const possibleFolders = rootItems.filter((item) => {
        const itemPath = path.join(projectRoot, item);
        return (
          (fs.statSync(itemPath).isDirectory() &&
            item.toLowerCase().includes("property")) ||
          item.toLowerCase().includes("data") ||
          item.toLowerCase().includes("drive")
        );
      });

      if (possibleFolders.length > 0) {
        console.log("📂 Found these similar folders:");
        possibleFolders.forEach((folder) => {
          console.log(`  - ${folder}`);
        });
      }
    } catch (error) {
      console.error("Error checking root:", error.message);
    }

    return;
  }

  console.log("✅ Property Data folder found!\n");

  // Scan the directory
  console.log("🔍 Scanning folder structure...\n");
  const scanResult = scanDirectory(propertyDataPath);

  // Print summary
  console.log("\n" + "=".repeat(80));
  console.log("📊 SCAN RESULTS SUMMARY");
  console.log("=".repeat(80));
  console.log(`📂 Total folders found: ${scanResult.totalFolders}`);
  console.log(`📄 Total files found: ${scanResult.totalFiles}`);

  // Analyze top-level folders (these should be property folders)
  const topLevelFolders = scanResult.folders.filter((f) => f.depth === 0);
  console.log(`🏠 Top-level property folders: ${topLevelFolders.length}`);

  if (topLevelFolders.length !== 348) {
    console.log(`\n⚠️  MISMATCH DETECTED!`);
    console.log(`   Expected: 348 folders`);
    console.log(`   Found: ${topLevelFolders.length} folders`);
    console.log(`   Missing: ${348 - topLevelFolders.length} folders`);
  }

  // Show CSV files
  const csvFiles = scanResult.files.filter((f) => f.extension === ".csv");
  if (csvFiles.length > 0) {
    console.log(`\n📄 CSV files found: ${csvFiles.length}`);
    csvFiles.forEach((file) => {
      console.log(`  - ${file.name} (${Math.round(file.size / 1024)}KB)`);
    });
  }

  // Show first 10 property folders as examples
  console.log(`\n📝 First 10 property folders:`);
  topLevelFolders.slice(0, 10).forEach((folder, index) => {
    console.log(`  ${index + 1}. ${folder.name}`);
  });

  if (topLevelFolders.length > 10) {
    console.log(`  ... and ${topLevelFolders.length - 10} more folders`);
  }

  // Recommendations
  console.log("\n" + "=".repeat(80));
  console.log("💡 RECOMMENDATIONS:");
  console.log("=".repeat(80));

  if (topLevelFolders.length === 77) {
    console.log(
      "🔍 The script is finding exactly 77 folders (matching your previous output)"
    );
    console.log("📱 This suggests the local download may be incomplete");
    console.log("\n✅ Solutions:");
    console.log("1. Re-download the complete Google Drive folder");
    console.log("2. Check if some folders are nested deeper");
    console.log("3. Verify all 348 folders are actually downloaded");
  } else if (topLevelFolders.length === 348) {
    console.log("🎉 Perfect! All 348 folders are found locally");
    console.log("🔧 The migration script should work correctly now");
  } else {
    console.log(
      `🤔 Found ${topLevelFolders.length} folders instead of expected 348`
    );
    console.log("📥 Please verify your Google Drive download is complete");
  }

  console.log(
    "\n🚀 Ready to run migration once folder count matches expectation!"
  );
}

// Run the debug analysis
if (require.main === module) {
  main().catch(console.error);
}

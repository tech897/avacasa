/**
 * Quick Test Script for Image Detection
 * Tests the improved recursive image search on a sample folder
 */

const fs = require("fs");
const path = require("path");

// Property Data folder path
const PROPERTY_DATA_FOLDER = path.join(__dirname, "../Property Data");

// All supported image and video formats (same as main script)
const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
  ".tiff",
  ".tif",
  ".JPG",
  ".JPEG",
  ".PNG",
  ".GIF",
  ".BMP",
  ".WEBP",
  ".TIFF",
  ".TIF",
  ".jfif",
  ".JFIF",
  ".svg",
  ".SVG",
  ".avif",
  ".AVIF",
  ".heic",
  ".HEIC",
  ".heif",
  ".HEIF",
];

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".MP4",
  ".mov",
  ".MOV",
  ".avi",
  ".AVI",
  ".mkv",
  ".MKV",
  ".wmv",
  ".WMV",
  ".webm",
  ".WEBM",
];

function isImageFile(filename) {
  const ext = path.extname(filename);
  return IMAGE_EXTENSIONS.includes(ext);
}

function isVideoFile(filename) {
  const ext = path.extname(filename);
  return VIDEO_EXTENSIONS.includes(ext);
}

function isMediaFile(filename) {
  return isImageFile(filename) || isVideoFile(filename);
}

async function testFolderSearch(folderName) {
  const folderPath = path.join(PROPERTY_DATA_FOLDER, folderName);

  console.log(`\n🧪 TESTING: ${folderName}`);
  console.log(`📂 Path: ${folderPath}`);
  console.log("=".repeat(80));

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Folder not found!`);
    return;
  }

  const allMediaFiles = [];

  function findMediaRecursively(dirPath, currentDepth = 0) {
    if (currentDepth > 6) {
      console.log(
        `    ⚠️ Max depth reached at: ${path.relative(folderPath, dirPath)}`
      );
      return;
    }

    let items;
    try {
      items = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (error) {
      console.log(`    ⚠️ Cannot read: ${path.relative(folderPath, dirPath)}`);
      return;
    }

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isFile() && isMediaFile(item.name)) {
        allMediaFiles.push(fullPath);
        const relativePath = path.relative(folderPath, fullPath);
        const fileType = isVideoFile(item.name) ? "📹" : "📸";
        const fileSize = fs.statSync(fullPath).size;
        const fileSizeStr =
          fileSize > 1024 * 1024
            ? `${(fileSize / 1024 / 1024).toFixed(1)}MB`
            : `${(fileSize / 1024).toFixed(0)}KB`;
        console.log(`${fileType} ${relativePath} (${fileSizeStr})`);
      } else if (item.isDirectory()) {
        const relativePath = path.relative(folderPath, fullPath);
        console.log(`📁 Exploring: ${relativePath}/`);
        try {
          findMediaRecursively(fullPath, currentDepth + 1);
        } catch (error) {
          console.log(`    ⚠️ Cannot access: ${item.name}`);
        }
      }
    }
  }

  findMediaRecursively(folderPath);

  const images = allMediaFiles.filter((filePath) =>
    isImageFile(path.basename(filePath))
  );
  const videos = allMediaFiles.filter((filePath) =>
    isVideoFile(path.basename(filePath))
  );

  console.log(`\n📊 RESULTS for ${folderName}:`);
  console.log(`  📸 Images found: ${images.length}`);
  console.log(`  📹 Videos found: ${videos.length}`);
  console.log(`  🎬 Total media: ${allMediaFiles.length}`);

  if (allMediaFiles.length === 0) {
    console.log(`\n🔍 DIAGNOSTIC INFO:`);
    console.log(
      `  📋 Looking for: ${IMAGE_EXTENSIONS.slice(0, 6).join(", ")}... and more`
    );
    console.log(`  📏 Search depth: Up to 6 levels deep`);
    console.log(`  📂 Try checking folder structure manually`);
  }

  return allMediaFiles.length;
}

async function runTests() {
  console.log("🧪 TESTING IMAGE DETECTION IMPROVEMENTS");
  console.log("=======================================");

  // Test a few different folder types
  const testFolders = [
    "Aakruthi Villas by NG Rathi Realty", // Known to have deep nesting
    "Blooms", // Known to have images in subfolders
    "Dapoli Hills", // Known to have images directly
    "Brindavanam Estates", // Known to have videos
    "Casa Melo by Mount Forest", // Known to have PDFs
  ];

  let totalFound = 0;

  for (const folder of testFolders) {
    const found = await testFolderSearch(folder);
    totalFound += found || 0;
  }

  console.log(`\n🎯 TEST SUMMARY:`);
  console.log(`  📁 Folders tested: ${testFolders.length}`);
  console.log(`  🎬 Total media found: ${totalFound}`);
  console.log(
    `  ${totalFound > 0 ? "✅ Detection working!" : "❌ Need more debugging"}`
  );
}

// Run the test
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testFolderSearch };

/**
 * Quick Start Guide for Image Migration
 * Interactive script to help set up image migration
 */

const fs = require("fs");
const path = require("path");

function showWelcome() {
  console.log(`
🏠 ===================================
   AVACASA IMAGE MIGRATION SETUP
   ===================================

Welcome! This script will help you migrate your Google Drive property images 
to Cloudinary for production use.

Based on your folder structure:
📁 Property Data/
   ├── 21 Enclave by pushpam infra/
   │   ├── BATHROOM_01.jpg ✅
   │   ├── KITCHEN.jpg ✅
   │   └── 21 Enclave-brochure.pdf ❌ (will be ignored)
   ├── 32ND Avenue/
   └── [other property folders...]

The system will:
✅ Scan all your property folders automatically
✅ Filter only image files (ignore PDFs, docs)
✅ Match with your database properties
✅ Upload to Cloudinary with optimization
✅ Update your database with new URLs
  `);
}

function checkRequirements() {
  console.log(`
🔍 CHECKING REQUIREMENTS:
========================
  `);

  // Check if database exists
  const dbExists = fs.existsSync("prisma/dev.db");
  console.log(`📄 Database: ${dbExists ? "✅ Found" : "❌ Missing"}`);

  if (!dbExists) {
    console.log(`
❌ Database not found! Please run:
   npm run build
   npm run import-csv
    `);
    return false;
  }

  // Check if .env exists
  const envExists = fs.existsSync(".env");
  console.log(`⚙️  Environment file: ${envExists ? "✅ Found" : "❌ Missing"}`);

  // Check package.json for dependencies
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const hasOptionalDeps =
    packageJson.optionalDependencies &&
    packageJson.optionalDependencies.googleapis &&
    packageJson.optionalDependencies.cloudinary;

  console.log(
    `📦 Dependencies: ${hasOptionalDeps ? "✅ Ready" : "⚠️  Need installation"}`
  );

  return dbExists;
}

function showNextSteps() {
  console.log(`
🚀 NEXT STEPS:
==============

1. CHECK YOUR PROPERTIES:
   npm run check-properties
   
   This will show you all properties in your database and help you
   understand what will be matched with your Google Drive folders.

2. SET UP CLOUDINARY:
   • Go to https://cloudinary.com
   • Create free account (25GB storage included)
   • Get your credentials from dashboard

 3. SET UP GOOGLE DRIVE API:
    • Go to https://console.cloud.google.com
    • Create service account
    • Enable Google Drive API
    • Download credentials JSON file
    • IMPORTANT: Share your folder with service account email (NOT public sharing)

4. CONFIGURE ENVIRONMENT:
   Create .env file with:
   
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   GOOGLE_DRIVE_SERVICE_ACCOUNT="./google-drive-credentials.json"

5. INSTALL DEPENDENCIES:
   npm install googleapis cloudinary

6. RUN MIGRATION:
   npm run migrate-images

📖 For detailed setup instructions, see:
   PRODUCTION_SETUP_GUIDE.md
  `);
}

async function showProperties() {
  try {
    console.log(`
🔍 CHECKING YOUR PROPERTIES:
============================
    `);

    const { checkProperties } = require("./check-properties.js");
    await checkProperties();
  } catch (error) {
    console.log(`❌ Could not check properties: ${error.message}`);
    console.log(`💡 Make sure you have imported your CSV data first:
   npm run import-csv`);
  }
}

function showFolderMapping() {
  console.log(`
🗂️  GOOGLE DRIVE FOLDER MAPPING:
================================

Your Google Drive structure should look like:

📁 Property Data (ID: 1vjt3d4WgOYDjUsQEGhUl6pAkHEUU69kX)
   ├── 21 Enclave by pushpam infra/
   │   ├── BATHROOM_01.jpg
   │   ├── FF BEDROOM_01.jpg
   │   ├── KITCHEN.jpg
   │   └── LIVING ROOM_01.jpg
   ├── 32ND Avenue/
   ├── 32ND Vagator Resorts/
   └── [more properties...]

The migration script will:
1. Scan all folders in "Property Data"
2. Try to match folder names with your database properties
3. Process only image files in each folder
4. Upload to Cloudinary with optimization

🎯 SMART MATCHING:
The script uses intelligent matching to connect Google Drive folders
with your database properties. It tries multiple strategies:
• Exact slug match
• Title contains folder name  
• Partial keyword matching

If automatic matching fails, you can add manual mappings in the script.
  `);
}

function showCosts() {
  console.log(`
💰 COST BREAKDOWN:
==================

🆓 CLOUDINARY FREE TIER:
   • 25 GB storage
   • 25 GB bandwidth/month
   • 25,000 transformations/month
   • Perfect for most real estate websites

📊 FOR YOUR WEBSITE:
   • Estimated 50 properties × 8 images = 400 images
   • ~2-5 GB storage (with optimization)
   • Monthly bandwidth depends on traffic
   • Should stay within free tier easily

🚀 BENEFITS:
   • Global CDN = faster loading worldwide
   • Automatic optimization = smaller file sizes
   • WebP conversion = better compression
   • Responsive images = mobile-friendly
   • 99.9% uptime SLA

Alternative: AWS S3 costs ~$1-5/month for similar usage.
  `);
}

function showMenu() {
  console.log(`
📋 WHAT WOULD YOU LIKE TO DO?
=============================

1. Check my database properties
2. Show Google Drive folder mapping
3. Show cost breakdown
4. Show detailed setup steps
5. Exit

Choose an option (1-5): `);
}

async function runInteractive() {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question) =>
    new Promise((resolve) => rl.question(question, resolve));

  while (true) {
    showMenu();
    const choice = await ask("");

    switch (choice.trim()) {
      case "1":
        await showProperties();
        break;
      case "2":
        showFolderMapping();
        break;
      case "3":
        showCosts();
        break;
      case "4":
        showNextSteps();
        break;
      case "5":
        console.log("\n👋 Good luck with your migration!");
        rl.close();
        return;
      default:
        console.log("Please choose 1-5");
    }

    await ask("\nPress Enter to continue...");
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
🏠 AVACASA IMAGE MIGRATION QUICK START

USAGE:
  npm run quick-start              # Interactive guide
  node scripts/quick-start.js      # Direct execution
  npm run quick-start --check      # Just check requirements
  npm run quick-start --steps      # Show next steps only

DESCRIPTION:
  This interactive guide helps you set up image migration from 
  Google Drive to Cloudinary for production use.
    `);
    return;
  }

  showWelcome();

  if (args.includes("--check")) {
    checkRequirements();
    return;
  }

  if (args.includes("--steps")) {
    showNextSteps();
    return;
  }

  const requirementsOk = checkRequirements();

  if (!requirementsOk) {
    console.log(`\n❌ Please fix the requirements above before continuing.`);
    return;
  }

  await runInteractive();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { showWelcome, checkRequirements, showNextSteps };

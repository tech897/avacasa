# Production Image Migration Setup Guide

## 🎯 Overview

This guide will help you set up automatic image migration from your Google Drive to Cloudinary for production use. The system will:

- ✅ **Automatically scan** all your property folders
- ✅ **Filter only images** (ignore PDFs, documents, etc.)
- ✅ **Match properties** with your database automatically
- ✅ **Upload to Cloudinary** with optimization and CDN
- ✅ **Update your database** with new URLs

## 📋 Prerequisites

Based on your folder structure, you have:

- **Main folder**: "Property Data"
- **Property subfolders**: "21 Enclave by pushpam infra", "32ND Avenue", etc.
- **Mixed files**: Images (JPG, PNG) + PDFs/documents in each folder

## 🔧 Step 1: Set Up Cloudinary (Recommended)

### Why Cloudinary?

- **Free tier**: 25 GB storage + 25 GB bandwidth/month
- **Automatic optimization**: WebP conversion, compression
- **Global CDN**: Fast loading worldwide
- **Transformations**: Resize, crop, quality on-the-fly

### Setup Steps:

1. **Sign up**: Go to [cloudinary.com](https://cloudinary.com) → Free account
2. **Get credentials**: Dashboard → Account Details
3. **Note down**:
   - Cloud Name: `your_cloud_name`
   - API Key: `123456789012345`
   - API Secret: `abcdefghijklmnopqrstuvwxyz123456`

## 🔐 Step 2: Set Up Google Drive API

### Create Service Account:

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com)
2. **Create/Select Project**: "Avacasa Image Migration"
3. **Enable API**:
   - Go to "APIs & Services" → "Library"
   - Search "Google Drive API" → Enable
4. **Create Credentials**:
   - "APIs & Services" → "Credentials"
   - "Create Credentials" → "Service Account"
   - Name: "image-migration-service"
   - Download JSON credentials file

### Share Drive Folder:

1. **Open your Property Data folder** in Google Drive
2. **Share** → Add the service account email (from JSON file)
3. **Give "Viewer" access**
4. **IMPORTANT**: Do NOT use public sharing - only share with service account

### Get Folder ID:

From your URL: `https://drive.google.com/drive/folders/1vjt3d4WgOYDjUsQEGhUl6pAkHEUU69kX`
The folder ID is: `1vjt3d4WgOYDjUsQEGhUl6pAkHEUU69kX`

## ⚙️ Step 3: Configure Environment

### Create `.env` file in your project root:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Google Drive Configuration
GOOGLE_DRIVE_SERVICE_ACCOUNT="./google-drive-credentials.json"

# Your Property Data folder ID
PROPERTY_DATA_FOLDER_ID="1vjt3d4WgOYDjUsQEGhUl6pAkHEUU69kX"
```

### Place credentials file:

- **Download** `service-account-credentials.json` from Google Cloud
- **Rename** to `google-drive-credentials.json`
- **Place** in your project root (same level as package.json)

## 📦 Step 4: Install Dependencies

```bash
# Install required packages
npm install googleapis cloudinary

# Verify installation
npm run migrate-images --help
```

## 🚀 Step 5: Run Migration

### Update the script configuration:

1. **Open**: `scripts/production-image-migration.js`
2. **Update line 14**: Replace with your actual folder ID:
   ```javascript
   const PROPERTY_DATA_FOLDER_ID = "1vjt3d4WgOYDjUsQEGhUl6pAkHEUU69kX";
   ```

### Test the setup:

```bash
# Check if everything is configured correctly
npm run migrate-images --help

# Show what will be processed (dry run)
node scripts/production-image-migration.js --dry-run
```

### Run the migration:

```bash
npm run migrate-images
```

## 📊 What Will Happen

### The script will:

1. **Scan** your "Property Data" folder
2. **Find** all property subfolders (21 Enclave, 32ND Avenue, etc.)
3. **For each property**:
   - Get only image files (ignore PDFs, docs)
   - Try to match with your database properties
   - Download images from Google Drive
   - Upload to Cloudinary with optimization
   - Update your property database with new URLs

### Expected output:

```
🚀 Starting Production Image Migration
=====================================

📁 Scanning Property Data folder...
Found 50 property folders

[1/50] Processing property folders...

🏠 Processing: 21 Enclave by pushpam infra
==================================================
✅ Matched "21 Enclave by pushpam infra" → 21 Enclave Luxury Homes (21-enclave-luxury-homes)
🖼️  Scanning images in: 21 Enclave by pushpam infra
  📸 Found 6 images (8 total files)
  📥 [1/6] Downloading: BATHROOM_01.jpg
  ☁️  Uploading to Cloudinary...
  ✅ Success: https://res.cloudinary.com/your-cloud/image/upload/v1/avacasa/properties/21-enclave-luxury-homes/BATHROOM_01
  ...

✅ Updated property database with 6 images

📊 Results for 21 Enclave by pushpam infra:
  ✅ Successfully processed: 6 images
  ❌ Failed: 0 images
```

## 🔍 Troubleshooting

### Common Issues:

**"No property folders found"**

- Check folder ID in script
- Verify service account has access to folder

**"No database match found"**

- Property names don't match database slugs
- Use manual mapping (see Advanced Options)

**"Upload failed"**

- Check Cloudinary credentials
- Verify internet connection
- Check rate limits

**"Authentication failed"**

- Verify service account JSON file path
- Check if Drive API is enabled
- Confirm folder sharing permissions

### Database Matching:

The script uses intelligent matching:

1. **Exact slug match**: `21-enclave-by-pushpam-infra`
2. **Title contains**: Property title contains folder name
3. **Partial match**: Slug contains main keywords

## 🎛️ Advanced Options

### Manual Property Mapping:

If automatic matching fails, you can define manual mappings:

```javascript
// In scripts/production-image-migration.js
const manualMappings = [
  {
    folderName: "21 Enclave by pushpam infra",
    propertySlug: "your-actual-property-slug",
  },
  {
    folderName: "32ND Avenue",
    propertySlug: "another-property-slug",
  },
];
```

### Custom Image Processing:

You can modify the Cloudinary upload settings:

```javascript
transformation: [
  { quality: "auto", fetch_format: "auto" },
  { width: 1600, height: 1200, crop: "limit" }, // Larger images
  { effect: "sharpen" }, // Additional effects
];
```

## 📈 After Migration

### Verify Results:

1. **Check your website**: Images should load from Cloudinary
2. **Performance**: Should be faster with CDN
3. **Database**: Property images field updated with Cloudinary URLs

### Example URLs:

```
Before: https://drive.google.com/uc?export=view&id=...
After:  https://res.cloudinary.com/your-cloud/image/upload/v1/avacasa/properties/property-slug/image-name
```

### Optimize Further:

- **Responsive images**: Add size transformations
- **Lazy loading**: Implement in your components
- **Format optimization**: Automatic WebP conversion

## 💰 Cost Estimation

### Cloudinary Free Tier:

- **Storage**: 25 GB (plenty for property images)
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

### For 100 properties with 10 images each:

- **Storage used**: ~2-5 GB (with optimization)
- **Monthly bandwidth**: Depends on traffic
- **Cost**: Free for most small-medium websites

## 🚀 Next Steps

1. **Run the migration** for all your properties
2. **Test website performance**
3. **Set up monitoring** for Cloudinary usage
4. **Plan for future uploads** (update admin panel)
5. **Consider lazy loading** for better performance

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Verify all credentials and permissions
3. Test with a single property folder first
4. Check console logs for detailed error messages

The migration should take **2-4 hours** depending on the number of images and internet speed.

# Google Drive Image Migration Guide

## Overview

This guide provides multiple approaches to migrate your property images from Google Drive to your real estate website efficiently.

## 🚀 Quick Start Options

### Option 1: Google Drive Direct Links (Fastest)

**Best for:** Quick setup, small to medium image collections
**Time:** 30 minutes to 2 hours

1. **Run the helper script:**

   ```bash
   node scripts/gdrive-direct-links.js --help
   ```

2. **Update your Google Drive settings:**

   - Make all property image folders publicly viewable
   - Get sharing links for each image

3. **Convert links and update database:**
   ```bash
   node scripts/gdrive-direct-links.js
   ```

### Option 2: Cloud Storage Migration (Recommended)

**Best for:** Production websites, large image collections, better performance
**Time:** 2-4 hours setup + automatic processing

1. **Choose a cloud provider:**

   - **Cloudinary** (recommended for images)
   - **AWS S3**
   - **Google Cloud Storage**

2. **Set up migration:**

   ```bash
   # Install dependencies
   npm install googleapis form-data cloudinary

   # Configure environment variables
   cp .env.example .env
   # Add your API keys to .env

   # Run migration
   node scripts/migrate-gdrive-images.js
   ```

## 📋 Detailed Instructions

### Prerequisites

1. **Google Drive Organization:**

   ```
   Your Google Drive/
   ├── Property Images/
   │   ├── luxury-beach-villa-goa/
   │   │   ├── exterior-1.jpg
   │   │   ├── interior-1.jpg
   │   │   └── pool-view.jpg
   │   ├── coorg-farmhouse/
   │   │   ├── farmhouse-front.jpg
   │   │   └── coffee-plantation.jpg
   │   └── ...
   ```

2. **Database property slugs ready:**
   - Match folder names with your property slugs
   - Run this to see current slugs:
   ```bash
   node -e "
   const { prisma } = require('./src/lib/db');
   prisma.property.findMany({ select: { slug: true, title: true } })
     .then(console.log)
     .finally(() => prisma.$disconnect());
   "
   ```

### Method 1: Google Drive Direct Links

#### Step 1: Prepare Images

1. Navigate to your Google Drive property folders
2. Select all images in a folder
3. Right-click → "Get link"
4. Set permissions to "Anyone with the link can view"
5. Copy sharing URLs

#### Step 2: Update Script Configuration

Edit `scripts/gdrive-direct-links.js`:

```javascript
const propertyImageMappings = [
  {
    propertySlug: "your-actual-property-slug",
    images: [
      "https://drive.google.com/file/d/YOUR_FILE_ID_1/view?usp=sharing",
      "https://drive.google.com/file/d/YOUR_FILE_ID_2/view?usp=sharing",
    ],
  },
  // Add all your properties...
];
```

#### Step 3: Run Conversion

```bash
# Test first
node scripts/gdrive-direct-links.js --test

# Run actual conversion
node scripts/gdrive-direct-links.js
```

#### Step 4: Verify

Visit your website and check if images load correctly.

### Method 2: Cloud Storage Migration

#### Step 1: Choose Cloud Provider

**Cloudinary (Recommended):**

- ✅ Automatic image optimization
- ✅ Multiple format support
- ✅ CDN included
- ✅ Transformation APIs
- 💰 Free tier: 25 credits/month

**AWS S3:**

- ✅ Highly scalable
- ✅ Very reliable
- ✅ Cost-effective for large volumes
- 💰 Pay per use

#### Step 2: Set Up Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard
3. Create an upload preset:
   - Go to Settings > Upload
   - Create unsigned upload preset
   - Set folder to auto-organize

#### Step 3: Configure Environment

Add to your `.env` file:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Drive API (for migration script)
GOOGLE_DRIVE_CREDENTIALS=path/to/credentials.json
```

#### Step 4: Set Up Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create credentials (Service Account)
5. Download JSON credentials file
6. Share your Google Drive folders with the service account email

#### Step 5: Update Migration Script

Edit `scripts/migrate-gdrive-images.js`:

```javascript
const propertyMappings = [
  {
    propertyId: "property-1",
    propertySlug: "your-property-slug",
    gdriveFolderId: "your-google-drive-folder-id",
  },
  // Add all properties...
];
```

#### Step 6: Install Dependencies

```bash
npm install googleapis form-data cloudinary node-fetch
```

#### Step 7: Run Migration

```bash
node scripts/migrate-gdrive-images.js
```

## 🛠️ Advanced Options

### Option 3: Local Download + Upload

If you prefer to have local copies:

```bash
# Create download script
mkdir temp-images
cd temp-images

# Use rclone or similar tool to download from Google Drive
# Then upload to your preferred hosting
```

### Option 4: Update Admin Interface

Enhance your admin panel to accept Google Drive links directly:

1. Add Google Drive link input to property form
2. Auto-convert to direct links on save
3. Optional: Background job to migrate to cloud storage

## 🔧 Troubleshooting

### Common Issues

**Images not loading:**

- Check Google Drive sharing permissions
- Verify URLs are correctly formatted
- Test URLs directly in browser

**Migration script fails:**

- Check Google Drive API credentials
- Verify folder IDs are correct
- Ensure sufficient API quotas

**Performance issues:**

- Consider image optimization
- Use cloud storage for better CDN
- Implement lazy loading

### Performance Optimization

1. **Image Compression:**

   ```javascript
   // Add to your Cloudinary URLs
   const optimizedUrl = `${baseUrl}/c_auto,f_auto,q_auto/`;
   ```

2. **Responsive Images:**
   ```jsx
   <Image
     src={`${imageUrl}/c_auto,f_auto,q_auto,w_auto/`}
     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
     // ...other props
   />
   ```

## 📊 Comparison

| Method               | Setup Time | Performance | Cost         | Maintenance |
| -------------------- | ---------- | ----------- | ------------ | ----------- |
| Google Drive Direct  | 30 min     | Medium      | Free         | Low         |
| Cloudinary Migration | 2 hours    | High        | Low-Medium   | Very Low    |
| AWS S3 Migration     | 2 hours    | High        | Low          | Low         |
| Local Hosting        | 1 hour     | Medium      | Server costs | Medium      |

## 🎯 Recommendations

1. **For immediate launch:** Use Google Drive direct links
2. **For production:** Migrate to Cloudinary or AWS S3
3. **For large scale:** Use AWS S3 with CloudFront CDN
4. **For budget-conscious:** Start with Google Drive, migrate later

## 🚀 Next Steps

After migration:

1. Test website performance
2. Set up image optimization
3. Implement lazy loading
4. Monitor loading speeds
5. Plan for future image management

Need help? Check the troubleshooting section or create an issue in the repository.

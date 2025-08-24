# AWS CloudFront Migration Setup Guide

This guide contains the steps to complete your migration from Cloudinary to AWS S3 + CloudFront.

## 📋 What Has Been Done

✅ **Updated `next.config.ts`** - Added CloudFront domain to image remote patterns
✅ **Updated OptimizedImage component** - Removed Cloudinary references and added S3/CloudFront support
✅ **Updated PropertyImage component** - Now handles S3/CloudFront URLs properly
✅ **Removed Cloudinary package** - Deleted from package.json dependencies
✅ **Deleted Cloudinary scripts** - Removed obsolete migration scripts
✅ **Updated test-env API** - Added AWS environment variable checks

## 🔧 Required Actions

### 1. Set Your CloudFront Domain

You need to replace the placeholder in `next.config.ts` with your actual CloudFront domain.

**Current placeholder:**

```typescript
hostname: "your_cloudfront_domain.cloudfront.net";
```

**Replace with your actual domain:**

```typescript
hostname: "d1234567890abc.cloudfront.net"; // Your actual CloudFront domain
```

### 2. Set Environment Variables

Add these environment variables to your deployment platform (Vercel, etc.):

```env
NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN=d1234567890abc.cloudfront.net
AWS_S3_BUCKET=your-s3-bucket-name
AWS_CLOUDFRONT_DOMAIN=d1234567890abc.cloudfront.net
```

### 3. Update Database Image URLs

If your database still contains Cloudinary URLs or placeholder CloudFront URLs, you'll need to:

1. **Find your actual CloudFront domain** in your AWS Console
2. **Update all image URLs** in your database from:
   ```
   https://your_cloudfront_domain.cloudfront.net/properties/...
   ```
   to:
   ```
   https://YOUR_ACTUAL_DOMAIN.cloudfront.net/properties/...
   ```

### 4. Restart Your Development Server

After making these changes:

```bash
npm run dev
```

## 🔍 How to Find Your CloudFront Domain

1. Go to AWS Console > CloudFront
2. Find your distribution
3. Copy the "Domain name" (e.g., `d1234567890abc.cloudfront.net`)

## 🔧 Database Update Script (if needed)

If you need to update image URLs in your database, create a script like this:

```javascript
// scripts/update-s3-urls.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function updateImageUrls() {
  const YOUR_CLOUDFRONT_DOMAIN = "YOUR_ACTUAL_DOMAIN.cloudfront.net";

  const properties = await prisma.property.findMany();

  for (const property of properties) {
    let images = JSON.parse(property.images || "[]");

    // Update placeholder URLs
    images = images.map((img) =>
      img.replace(
        "your_cloudfront_domain.cloudfront.net",
        YOUR_CLOUDFRONT_DOMAIN
      )
    );

    await prisma.property.update({
      where: { id: property.id },
      data: { images: JSON.stringify(images) },
    });
  }

  console.log("Updated image URLs");
}

updateImageUrls().catch(console.error);
```

## ✅ Verification

After completing the setup:

1. **Images should load** without Next.js errors
2. **Check browser console** for any remaining image loading issues
3. **Test property pages** to ensure images display correctly

## 🆘 Troubleshooting

- **Still getting the error?** Make sure you restarted your dev server
- **Images not loading?** Check that your CloudFront domain is correct in both `next.config.ts` and your database
- **404 errors?** Verify your S3 bucket paths match your database image URLs



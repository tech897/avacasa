# 🚀 Deployment Checklist for Avacasa

## ✅ Pre-Deployment Checks Completed

- [x] **Build Test Passed** - `npm run build` completed successfully
- [x] **AWS S3/CloudFront Migration** - Cloudinary references removed
- [x] **Dependencies Updated** - AWS SDK packages installed
- [x] **Linting Clean** - No ESLint errors
- [x] **Image Components Updated** - OptimizedImage and PropertyImage components updated for S3/CloudFront

## 🔧 Final Steps Before Deployment

### 1. Set Environment Variables

Add these to your deployment platform (Vercel/Netlify/AWS):

```env
# Database
DATABASE_URL="your-mongodb-connection-string"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# AWS S3/CloudFront (Optional - for future image uploads)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="avacasa-images"
AWS_REGION="ap-south-1"
NEXT_PUBLIC_AWS_CLOUDFRONT_DOMAIN="your-actual-cloudfront-domain.cloudfront.net"

# Email (if using)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@domain.com"
EMAIL_PASSWORD="your-app-password"

# Other
NODE_ENV="production"
```

### 2. Update CloudFront Domain (When Available)

Once you have your CloudFront domain, update `next.config.ts`:

```typescript
// Uncomment and update this section in next.config.ts
{
  protocol: "https",
  hostname: "d1234567890abc.cloudfront.net", // Your actual CloudFront domain
  port: "",
  pathname: "/**",
},
```

### 3. Deploy Options

#### Option A: Vercel (Recommended for Next.js)

```bash
npm install -g vercel
vercel --prod
```

#### Option B: Manual Build & Deploy

```bash
npm run build
# Upload .next, public, and other necessary files to your server
```

### 4. Post-Deployment Verification

After deployment:

1. **Test Homepage** - Verify main functionality works
2. **Check Property Pages** - Ensure images load (currently using S3 direct URLs)
3. **Test Search** - Verify property search functionality
4. **Check Admin Panel** - Test admin authentication and features
5. **Monitor Console** - Check for any JavaScript errors

## 📱 Current Image Configuration

### Working Now:

- **S3 Direct URLs**: `avacasa-images.s3.ap-south-1.amazonaws.com`
- **Fallback Images**: Unsplash images for missing property photos
- **Placeholder**: "No Images" display for properties without photos

### Future (When CloudFront is Set Up):

- **CloudFront CDN**: Faster global image delivery
- **Image Optimization**: Automated resizing and format conversion

## 🔍 Troubleshooting

### If Images Don't Load:

1. Check S3 bucket permissions (public read access)
2. Verify image URLs in database match S3 structure
3. Check browser console for CORS errors

### If Build Fails on Deployment:

1. Ensure all environment variables are set
2. Check that database is accessible from deployment platform
3. Verify all dependencies are in `package.json`

### Common Issues:

- **Database Connection**: Make sure MongoDB Atlas whitelist includes deployment IPs
- **Memory Issues**: Increase deployment memory limits if needed
- **Timeout**: Large image processing may need timeout adjustments

## 📞 Ready to Deploy!

Your application is now ready for deployment. The current setup will work with:

- ✅ S3 direct image access
- ✅ All core functionality
- ✅ Production build optimization
- ✅ Responsive design
- ✅ SEO optimization

You can deploy now and add the remaining images later through the admin panel or bulk upload scripts.

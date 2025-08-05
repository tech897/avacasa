# Google Drive Permissions Guide

## 🔐 Understanding Google Drive Access Methods

There are **two different ways** to access your Google Drive images for migration:

## Method 1: Service Account Access (RECOMMENDED FOR PRODUCTION)

### What is it?

- Uses Google Drive API with a dedicated service account
- Images remain private in your Google Drive
- Only your service account can access them
- Professional, secure setup

### Setup Steps:

#### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Enable Google Drive API
4. Create credentials → Service Account
5. Download the JSON credentials file

#### Step 2: Share Folder with Service Account

1. Open your "Property Data" folder in Google Drive
2. Click "Share" button
3. Add the service account email (from the JSON file)
   - Example: `image-migration@your-project.iam.gserviceaccount.com`
4. Set permission to **"Viewer"**
5. Click "Send"

#### Step 3: Configure Script

```env
# In your .env file
GOOGLE_DRIVE_SERVICE_ACCOUNT="./google-drive-credentials.json"
```

### ✅ Benefits:

- **Secure**: Images stay private
- **Professional**: Enterprise-grade authentication
- **Reliable**: No rate limiting issues
- **Scalable**: Can handle large volumes
- **Future-proof**: Won't break if Google changes sharing policies

### ❌ Setup Time:

- Initial setup: ~30 minutes
- Requires Google Cloud Console access

---

## Method 2: Public Sharing (QUICK BUT LESS SECURE)

### What is it?

- Makes folders publicly viewable
- Anyone with the link can see images
- Simpler setup but less secure

### Setup Steps:

#### Step 1: Make Folders Public

1. Select your "Property Data" folder
2. Right-click → "Get link"
3. Change to **"Anyone with the link can view"**
4. Do this for each property subfolder

#### Step 2: Use Direct Links Script

```bash
npm run convert-gdrive-links
```

### ✅ Benefits:

- **Quick setup**: 5-10 minutes
- **Simple**: No API configuration needed
- **Immediate**: Works right away

### ❌ Drawbacks:

- **Security risk**: Images are publicly accessible
- **Google dependency**: Relies on Google Drive as CDN
- **Performance**: Not optimized for web delivery
- **Rate limits**: May hit Google's limits with many requests

---

## 🎯 Recommendation for Your Production Website

**Use Method 1 (Service Account)** because:

### Your Current Situation:

- You have ~20+ property folders
- Each folder has 5-10+ images
- You want professional hosting
- You're building for production

### Why Service Account is Better:

1. **Security**: Keep your property images private until published
2. **Performance**: Images get uploaded to Cloudinary CDN
3. **Optimization**: Automatic compression and format conversion
4. **Reliability**: Professional-grade infrastructure
5. **Scalability**: Can handle hundreds of properties

### Migration Flow:

```
Google Drive (Private) → Service Account → Cloudinary (Optimized) → Your Website
```

Instead of:

```
Google Drive (Public) → Direct Links → Your Website
```

---

## 📋 Step-by-Step for Service Account Setup

### 1. Google Cloud Console Setup

1. **Go to**: https://console.cloud.google.com
2. **Create Project**: "Avacasa Image Migration"
3. **Enable API**:
   - Navigation menu → "APIs & Services" → "Library"
   - Search "Google Drive API"
   - Click "Enable"

### 2. Create Service Account

1. **Go to**: "APIs & Services" → "Credentials"
2. **Click**: "Create Credentials" → "Service Account"
3. **Fill in**:
   - Service account name: `image-migration-service`
   - Description: `For migrating property images from Google Drive`
4. **Click**: "Create and Continue"
5. **Skip**: Role assignment (not needed for this use case)
6. **Click**: "Done"

### 3. Generate Key

1. **Find your service account** in the list
2. **Click** on the email address
3. **Go to**: "Keys" tab
4. **Click**: "Add Key" → "Create new key"
5. **Choose**: JSON format
6. **Click**: "Create"
7. **Save** the downloaded file as `google-drive-credentials.json`

### 4. Get Service Account Email

Open the downloaded JSON file and find:

```json
{
  "client_email": "image-migration-service@your-project.iam.gserviceaccount.com"
}
```

This is the email you'll share your Google Drive folder with.

### 5. Share Google Drive Folder

1. **Open** your "Property Data" folder in Google Drive
2. **Click** "Share" (top right)
3. **Add** the service account email
4. **Set permission** to "Viewer"
5. **Uncheck** "Notify people" (it's a service account)
6. **Click** "Send"

### 6. Verify Access

Your folder sharing should show:

- Your email (Owner)
- Service account email (Viewer)

---

## 🔍 Troubleshooting

### "Permission denied" errors:

- Check that service account email was added correctly
- Verify the JSON credentials file path
- Make sure Google Drive API is enabled

### "Folder not found" errors:

- Double-check the folder ID in the script
- Ensure the folder was shared with the service account
- Verify the service account has "Viewer" permission

### "Authentication failed":

- Check the JSON credentials file exists
- Verify the file path in .env is correct
- Make sure the service account key is valid

---

## 🎯 Summary

**For Production (Recommended):**

- ✅ Use Service Account method
- ✅ Keep images private in Google Drive
- ✅ Upload to Cloudinary for optimization
- ✅ Professional, secure, scalable

**For Quick Testing:**

- ⚠️ Use public sharing method
- ⚠️ Less secure but faster setup
- ⚠️ Good for testing, not production

Choose the service account method for your production website - it's worth the extra 30 minutes of setup for the security and performance benefits!

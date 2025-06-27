# 🚀 Production Database Setup Guide

Your local SQLite database doesn't work on Vercel. Here's how to set up a production PostgreSQL database.

## 🎯 Quick Setup (5 minutes)

### Step 1: Create Free Neon PostgreSQL Database

1. **Go to** [neon.tech](https://neon.tech)
2. **Sign up** for free account  
3. **Create new project** 
4. **Copy connection string** (looks like: `postgresql://username:password@host/database`)

### Step 2: Update Vercel Environment Variables

1. **Go to** your Vercel dashboard
2. **Go to** your project → Settings → Environment Variables
3. **Add these variables for Production:**

```bash
# Required for Production
DATABASE_URL="your-neon-connection-string-here"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-for-production"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Email Configuration (optional)
MAIL_FROM="your-email@domain.com"
MAIL_APP_PASSWORD="your-app-password"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_SITE_NAME="Avacasa"
```

### Step 3: Deploy Database Schema

Run this locally to create your production database:

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Push schema to production database  
npx prisma db push

# Import your properties to production
npm run import-csv
```

### Step 4: Deploy to Vercel

```bash
# Deploy your changes
git add .
git commit -m "Update to PostgreSQL for production"
git push
```

## 🎯 Alternative: Use Vercel Native Integration

### Option A: Neon Integration (Recommended)

1. **Go to** Vercel Dashboard → Your Project
2. **Click** Storage → Browse Marketplace  
3. **Find** Neon PostgreSQL → Install
4. **Follow** setup wizard
5. **Environment variables** added automatically

### Option B: Supabase Integration

1. **Go to** [supabase.com](https://supabase.com)
2. **Create** new project
3. **Copy** PostgreSQL connection string
4. **Add to** Vercel environment variables

## 🔧 Migration Scripts

We've included scripts to help you migrate:

```bash
# Check current data
npm run check-data

# Export local data (if needed)
npm run export-data

# Import to production
npm run import-csv
```

## 🚨 Troubleshooting

### Issue: "Unable to open database file"
**Solution:** SQLite doesn't work on Vercel. Use PostgreSQL.

### Issue: Environment variables not found
**Solution:** Make sure DATABASE_URL is set in Vercel environment variables.

### Issue: Prisma client errors
**Solution:** Run `npx prisma generate` and redeploy.

## ✅ Verification Checklist

- [ ] PostgreSQL database created (Neon/Supabase)
- [ ] DATABASE_URL added to Vercel environment variables
- [ ] Prisma schema updated to PostgreSQL
- [ ] Database schema pushed to production
- [ ] Properties imported to production database
- [ ] Vercel deployment successful
- [ ] Website loads without database errors

## 📞 Need Help?

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables are set
3. Ensure DATABASE_URL is correct
4. Run `npx prisma db push` locally first

Your website will be fully functional once the PostgreSQL database is connected! 🎉 
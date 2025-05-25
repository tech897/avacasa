# 📧 Email Configuration Guide

## Quick Setup

Your contact form is working and saving inquiries to the database, but emails are not being sent because the email credentials are not configured.

### 1. Create Environment File

Create a `.env.local` file in your project root with the following content:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-jwt-secret-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (Required for contact form notifications)
MAIL_FROM="your-email@gmail.com"
MAIL_APP_PASSWORD="your-gmail-app-password"
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"

# Admin Email (where contact form notifications will be sent)
ADMIN_EMAIL="admin@yourdomain.com"
```

### 2. Gmail App Password Setup

To get your Gmail App Password:

1. **Enable 2-Factor Authentication** on your Google account
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Navigate to **Security** → **2-Step Verification**
4. Scroll down and click **App passwords**
5. Select **Mail** as the app
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
7. Use this as your `MAIL_APP_PASSWORD`

### 3. Update Your Configuration

Replace the placeholder values in `.env.local`:

```env
# Replace with your actual Gmail address
MAIL_FROM="youremail@gmail.com"

# Replace with the 16-character app password from step 2
MAIL_APP_PASSWORD="abcd efgh ijkl mnop"

# Replace with your admin email (where notifications will be sent)
ADMIN_EMAIL="admin@yourdomain.com"
```

### 4. Test Email Configuration

After setting up your `.env.local` file, restart your development server and test:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev

# Test email configuration
node scripts/test-email.mjs
```

### 5. Test Contact Form

1. Go to `http://localhost:3000/contact`
2. Fill out the contact form
3. Submit the form
4. You should see a success popup
5. Check your admin email for the notification
6. The customer should receive an auto-reply

## Current Status

✅ **Contact Form**: Working - saves inquiries to database  
✅ **Admin Dashboard**: Working - view inquiries at `/admin/dashboard/inquiries`  
✅ **Popup Notifications**: Working - shows success/error messages  
❌ **Email Notifications**: Not working - needs email configuration  

## What's Working Now

1. **Contact Form Submission**: The form saves all inquiries to the database
2. **Admin Dashboard**: You can view all inquiries at `/admin/dashboard/inquiries`
3. **Popup Notifications**: Success/error messages show as popups instead of alerts
4. **Inquiry Management**: Admin can update status, view details, and manage inquiries

## What Needs Email Configuration

1. **Admin Notifications**: Email alerts when new inquiries are submitted
2. **Customer Auto-Reply**: Confirmation emails sent to customers
3. **Custom Email Campaigns**: Admin email communication tools

## Alternative: View Inquiries Without Email

Even without email configuration, you can still:

1. **View All Inquiries**: Go to `/admin/dashboard/inquiries`
2. **Manage Status**: Update inquiry status (New → In Progress → Resolved → Closed)
3. **Search & Filter**: Find specific inquiries
4. **View Details**: See complete inquiry information
5. **Reply Manually**: Use the "Reply via Email" button to open your email client

## Troubleshooting

### Common Issues

1. **"Missing credentials for PLAIN"**
   - Your `MAIL_FROM` or `MAIL_APP_PASSWORD` is not set
   - Check your `.env.local` file

2. **"Authentication failed"**
   - Your app password is incorrect
   - Make sure 2FA is enabled on your Google account
   - Generate a new app password

3. **"Connection timeout"**
   - Check your internet connection
   - Verify SMTP settings (host: smtp.gmail.com, port: 587)

### Test Commands

```bash
# Test email configuration
node scripts/test-email.mjs

# Test contact form API
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Inquiry",
    "message": "This is a test message",
    "type": "GENERAL"
  }'
```

## Next Steps

1. **Set up email configuration** using the guide above
2. **Test the complete flow** from contact form to email notifications
3. **Customize email templates** if needed
4. **Set up email monitoring** for production use

---

**Note**: The contact form and inquiry management system is fully functional even without email configuration. Email setup is only needed for automatic notifications. 
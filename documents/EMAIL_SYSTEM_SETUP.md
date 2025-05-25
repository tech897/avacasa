# 📧 Email System Setup Guide

## Overview

The Avacasa email system provides comprehensive email functionality including:

- **Contact Form Notifications**: Automatic email alerts when users submit contact forms
- **Auto-Reply System**: Instant confirmation emails to customers
- **Admin Email Communication**: Broadcast custom notifications to users and subscribers
- **Contact Management**: Track and manage contact submissions with status updates
- **Beautiful Email Templates**: Professional branded email templates

## 🚀 Quick Setup

### 1. Environment Configuration

Create or update your `.env.local` file with the following email configuration:

```env
# Email Configuration
MAIL_FROM="noreply@avacasa.life"
MAIL_APP_PASSWORD="your-gmail-app-password"
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"

# Admin Email (where contact form notifications will be sent)
ADMIN_EMAIL="admin@avacasa.life"

# Other required variables
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Gmail App Password Setup

For Gmail users, you need to create an App Password:

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. At the bottom, select "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password as `MAIL_APP_PASSWORD`

### 3. Test Email Configuration

Run the email test script to verify your setup:

```bash
node scripts/test-email.js
```

## 📋 Features

### Contact Form Integration

When users submit the contact form, the system automatically:

1. **Saves to Database**: Stores submission in `ContactSubmission` table
2. **Sends Admin Notification**: Beautiful HTML email to admin with all details
3. **Sends Auto-Reply**: Professional confirmation email to the customer
4. **Updates Status**: Tracks email delivery status

### Admin Dashboard

Access comprehensive contact management at `/admin/dashboard`:

- **Contact Submissions**: View, filter, and manage all contact forms
- **Status Tracking**: Update submission status (New → In Progress → Resolved → Closed)
- **Email Communication**: Send custom notifications to users and subscribers
- **Analytics**: View submission statistics and trends

### Email Templates

The system includes professional email templates:

- **Contact Form Notification**: Detailed admin alert with customer information
- **Auto-Reply Confirmation**: Customer acknowledgment with next steps
- **Custom Notifications**: Flexible templates for admin broadcasts

## 🔧 API Endpoints

### Contact Form API

```bash
# Submit contact form
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "subject": "Property Inquiry",
  "message": "I'm interested in your holiday homes.",
  "type": "SALES"
}
```

### Admin Contact Management

```bash
# Get contact submissions (Admin only)
GET /api/admin/contact-submissions?page=1&limit=20&status=NEW

# Update submission status (Admin only)
PATCH /api/admin/contact-submissions/{id}
{
  "status": "IN_PROGRESS"
}

# Delete submission (Admin only)
DELETE /api/admin/contact-submissions/{id}
```

### Admin Email Communication

```bash
# Send custom email (Admin only)
POST /api/admin/email/send
{
  "recipients": ["user@example.com"],
  "subject": "Special Offer",
  "content": "<h2>Limited Time Offer!</h2><p>Check out our new properties...</p>",
  "sendToAllUsers": false,
  "sendToAllSubscribers": false,
  "testMode": false
}

# Get email templates and recipient stats (Admin only)
GET /api/admin/email/send?action=templates
GET /api/admin/email/send?action=recipients
```

## 🎨 Email Templates

### Contact Form Notification (Admin)

Features:
- Professional Avacasa branding
- Complete customer information grid
- Message content with proper formatting
- Quick action buttons (Reply, View in Admin)
- Mobile-responsive design

### Auto-Reply (Customer)

Features:
- Welcome message with Avacasa branding
- Clear next steps and expectations
- Contact information for immediate assistance
- Links to browse properties and locations
- Professional footer with team signature

### Custom Notifications

Features:
- Flexible HTML content support
- Personalized recipient names
- Consistent Avacasa branding
- Mobile-responsive layout
- Professional styling

## 📊 Contact Management

### Status Workflow

1. **NEW**: Initial submission received
2. **IN_PROGRESS**: Admin has reviewed and is working on it
3. **RESOLVED**: Issue/inquiry has been addressed
4. **CLOSED**: Submission is complete and archived

### Admin Features

- **Search & Filter**: Find submissions by name, email, subject, or message
- **Status Updates**: Change submission status with dropdown
- **Detailed View**: Modal with complete submission details
- **Quick Actions**: Reply via email, delete submissions
- **Statistics**: Dashboard with status counts and trends

## 🚀 Usage Examples

### Testing Contact Form

```bash
# Test contact form submission
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "subject": "Test Contact Form",
    "message": "This is a test message.",
    "type": "GENERAL"
  }'
```

### Sending Custom Email (Admin)

```bash
# Send test email to admin
curl -X POST http://localhost:3000/api/admin/email/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-admin-token" \
  -d '{
    "recipients": ["admin@avacasa.life"],
    "subject": "Test Email",
    "content": "<h2>Hello!</h2><p>This is a test email.</p>",
    "testMode": true
  }'
```

## 🔒 Security Features

- **Admin Authentication**: All admin endpoints require valid JWT tokens
- **Input Validation**: Zod schema validation for all inputs
- **Rate Limiting**: Built-in protection against spam
- **Email Verification**: SMTP connection verification
- **Error Handling**: Graceful error handling with user-friendly messages

## 🛠️ Troubleshooting

### Common Issues

1. **Email not sending**
   - Check MAIL_APP_PASSWORD is correct
   - Verify Gmail 2FA is enabled
   - Ensure SMTP settings are correct

2. **Admin authentication failed**
   - Check JWT_SECRET is set
   - Verify admin token is valid
   - Ensure admin user exists in database

3. **Contact form not working**
   - Check database connection
   - Verify API endpoint is accessible
   - Check browser console for errors

### Debug Commands

```bash
# Test email configuration
node scripts/test-email.js

# Check database connection
npx prisma studio

# View server logs
npm run dev

# Test API endpoints
curl -X GET http://localhost:3000/api/contact
```

## 📈 Analytics & Monitoring

The system tracks:
- Contact submission counts by status
- Email delivery success/failure rates
- Response times and admin activity
- Popular inquiry types and subjects

## 🔄 Future Enhancements

Planned features:
- Email templates editor in admin dashboard
- Automated follow-up email sequences
- Integration with CRM systems
- Advanced analytics and reporting
- Email campaign scheduling
- A/B testing for email templates

## 📞 Support

For technical support or questions about the email system:
- Check the troubleshooting section above
- Review server logs for error messages
- Test email configuration with the provided script
- Verify environment variables are correctly set

---

**Note**: Make sure to configure your email settings in `.env.local` before using the system. The email functionality requires proper SMTP configuration to work correctly. 
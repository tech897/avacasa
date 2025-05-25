import nodemailer from 'nodemailer'
import { getSiteSettings } from '@/lib/settings'

// Check if email is configured
const isEmailConfigured = () => {
  return !!(process.env.MAIL_FROM && process.env.MAIL_APP_PASSWORD)
}

// Email configuration
const emailConfig = {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_FROM,
    pass: process.env.MAIL_APP_PASSWORD,
  },
}

// Create transporter only if email is configured
let transporter: nodemailer.Transporter | null = null

if (isEmailConfigured()) {
  transporter = nodemailer.createTransport(emailConfig)
} else {
  console.warn('⚠️  Email not configured. Set MAIL_FROM and MAIL_APP_PASSWORD environment variables.')
}

// Verify email configuration
export const verifyEmailConfig = async () => {
  if (!isEmailConfigured()) {
    console.error('❌ Email credentials not configured')
    return false
  }
  
  if (!transporter) {
    console.error('❌ Email transporter not initialized')
    return false
  }

  try {
    await transporter.verify()
    console.log('✅ Email server is ready to take our messages')
    return true
  } catch (error) {
    console.error('❌ Email server configuration error:', error)
    return false
  }
}

// Email templates with dynamic settings
export const emailTemplates = {
  contactFormNotification: (data: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
    propertyInterest?: string
    submittedAt: string
  }) => ({
    subject: `New Contact Form Submission: ${data.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .header-subtitle { font-size: 16px; opacity: 0.9; }
            .content { padding: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .info-item { background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .info-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
            .info-value { color: #1f2937; }
            .message-box { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏡 Avacasa</div>
              <div class="header-subtitle">New Contact Form Submission</div>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Contact Form Details</h2>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Name</div>
                  <div class="info-value">${data.name}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${data.email}</div>
                </div>
                ${data.phone ? `
                <div class="info-item">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${data.phone}</div>
                </div>
                ` : ''}
                <div class="info-item">
                  <div class="info-label">Subject</div>
                  <div class="info-value">${data.subject}</div>
                </div>
                ${data.propertyInterest ? `
                <div class="info-item">
                  <div class="info-label">Property Interest</div>
                  <div class="info-value">${data.propertyInterest}</div>
                </div>
                ` : ''}
                <div class="info-item">
                  <div class="info-label">Submitted At</div>
                  <div class="info-value">${data.submittedAt}</div>
                </div>
              </div>
              
              <div class="message-box">
                <h3 style="color: #1f2937; margin-top: 0;">Message</h3>
                <p style="color: #374151; line-height: 1.6; margin: 0;">${data.message}</p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                This email was sent from the Avacasa contact form.<br>
                Please respond to the customer directly at ${data.email}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
Subject: ${data.subject}
${data.propertyInterest ? `Property Interest: ${data.propertyInterest}` : ''}
Submitted At: ${data.submittedAt}

Message:
${data.message}

Please respond to the customer directly at ${data.email}
    `
  }),

  contactFormAutoReply: async (data: {
    name: string
    subject: string
  }) => {
    const settings = await getSiteSettings()
    
    return {
      subject: `Thank you for contacting ${settings.siteName}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank you for contacting ${settings.siteName}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
              .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 30px; text-align: center; }
              .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .header-subtitle { font-size: 16px; opacity: 0.9; }
              .content { padding: 30px; }
              .highlight-box { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
              .steps { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
              .step-number { background-color: #3b82f6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 15px; flex-shrink: 0; }
              .step-content { flex: 1; }
              .contact-info { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .btn { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px; }
              .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🏡 ${settings.siteName}</div>
                <div class="header-subtitle">Holiday Homes & Vacation Real Estate</div>
              </div>
              
              <div class="content">
                <h2 style="color: #1f2937; margin-top: 0;">Thank you, ${data.name}!</h2>
                
                <div class="highlight-box">
                  <h3 style="color: #1e40af; margin-top: 0;">We've received your inquiry!</h3>
                  <p style="color: #1e3a8a; margin-bottom: 0; font-size: 16px;">
                    Our property experts are reviewing your message about "<strong>${data.subject}</strong>" and will get back to you soon.
                  </p>
                </div>
                
                <div class="steps">
                  <h3 style="color: #1f2937; margin-top: 0;">What happens next?</h3>
                  <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <strong>Review & Analysis</strong><br>
                      <span style="color: #6b7280;">Our property experts will review your inquiry within 24 hours</span>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <strong>Personalized Recommendations</strong><br>
                      <span style="color: #6b7280;">We'll prepare customized property options based on your requirements</span>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <strong>Detailed Response</strong><br>
                      <span style="color: #6b7280;">You'll receive a comprehensive response with property options and next steps</span>
                    </div>
                  </div>
                </div>
                
                <div class="contact-info">
                  <h3 style="color: #1f2937; margin-top: 0;">Need immediate assistance?</h3>
                  <p style="color: #374151; margin-bottom: 10px;">
                    ${settings.contactPhone ? `📞 <strong>Call us:</strong> ${settings.contactPhone}<br>` : ''}
                    ${settings.contactEmail ? `📧 <strong>Email:</strong> ${settings.contactEmail}<br>` : ''}
                    🕒 <strong>Hours:</strong> Monday - Saturday, 9 AM - 7 PM IST
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${settings.siteUrl}/properties" class="btn">Browse Properties</a>
                  <a href="${settings.siteUrl}/locations" class="btn">Explore Locations</a>
                </div>
              </div>
              
              <div class="footer">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Best regards,<br>
                  <strong>The ${settings.siteName} Team</strong><br>
                  Your trusted partner in vacation real estate
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Thank you for contacting ${settings.siteName}, ${data.name}!

We've received your inquiry about "${data.subject}" and our team will review it shortly.

What happens next?
- Our property experts will review your inquiry within 24 hours
- We'll prepare personalized recommendations based on your requirements  
- You'll receive a detailed response with property options and next steps

Need immediate assistance?
${settings.contactPhone ? `Call us: ${settings.contactPhone}` : ''}
${settings.contactEmail ? `Email: ${settings.contactEmail}` : ''}
Hours: Monday - Saturday, 9 AM - 7 PM IST

Best regards,
The ${settings.siteName} Team
Your trusted partner in vacation real estate
      `
    }
  },

  // Custom notification template for admin broadcasts
  customNotification: (data: {
    subject: string
    content: string
    recipientName?: string
  }) => ({
    subject: data.subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.subject}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .header-subtitle { font-size: 16px; opacity: 0.9; }
            .content { padding: 30px; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏡 Avacasa</div>
              <div class="header-subtitle">Holiday Homes & Vacation Real Estate</div>
            </div>
            
            <div class="content">
              ${data.recipientName ? `<p>Dear ${data.recipientName},</p>` : ''}
              ${data.content}
            </div>
            
            <div class="footer">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Best regards,<br>
                <strong>The Avacasa Team</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: data.content.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
  })
}

// Send email function
export const sendEmail = async (options: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}) => {
  if (!isEmailConfigured() || !transporter) {
    console.warn('⚠️  Email not configured. Skipping email send.')
    return { 
      success: false, 
      error: 'Email not configured. Please set MAIL_FROM and MAIL_APP_PASSWORD environment variables.' 
    }
  }

  try {
    const mailOptions = {
      from: options.from || `"Avacasa" <${process.env.MAIL_FROM}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Send contact form notification
export const sendContactFormNotification = async (contactData: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  propertyInterest?: string
}) => {
  const submittedAt = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_FROM
  if (!adminEmail) {
    throw new Error('Admin email not configured')
  }

  // Send notification to admin
  const adminTemplate = emailTemplates.contactFormNotification({
    ...contactData,
    submittedAt
  })

  const adminResult = await sendEmail({
    to: adminEmail,
    subject: adminTemplate.subject,
    html: adminTemplate.html,
    text: adminTemplate.text
  })

  // Send auto-reply to customer
  const customerTemplate = await emailTemplates.contactFormAutoReply({
    name: contactData.name,
    subject: contactData.subject
  })

  const customerResult = await sendEmail({
    to: contactData.email,
    subject: customerTemplate.subject,
    html: customerTemplate.html,
    text: customerTemplate.text
  })

  return {
    adminNotification: adminResult,
    customerAutoReply: customerResult
  }
}

// Send custom notification to multiple recipients
export const sendCustomNotification = async (data: {
  recipients: string[]
  subject: string
  content: string
  recipientNames?: { [email: string]: string }
}) => {
  const results = []

  for (const email of data.recipients) {
    const template = emailTemplates.customNotification({
      subject: data.subject,
      content: data.content,
      recipientName: data.recipientNames?.[email]
    })

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    results.push({ email, result })
  }

  return results
} 
import nodemailer from 'nodemailer'

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

// Create transporter
const transporter = nodemailer.createTransport(emailConfig)

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify()
    console.log('✅ Email server is ready to take our messages')
    return true
  } catch (error) {
    console.error('❌ Email server configuration error:', error)
    return false
  }
}

async function testEmailConfig() {
  console.log('🧪 Testing email configuration...')
  
  try {
    const isValid = await verifyEmailConfig()
    
    if (isValid) {
      console.log('✅ Email configuration is valid!')
      console.log('📧 Email notifications will be sent when contact forms are submitted.')
      console.log('📝 Configuration details:')
      console.log(`   - MAIL_FROM: ${process.env.MAIL_FROM || 'Not set'}`)
      console.log(`   - MAIL_HOST: ${process.env.MAIL_HOST || 'smtp.gmail.com (default)'}`)
      console.log(`   - MAIL_PORT: ${process.env.MAIL_PORT || '587 (default)'}`)
      console.log(`   - ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'Not set'}`)
    } else {
      console.log('❌ Email configuration failed!')
      console.log('📝 Please check your environment variables:')
      console.log('   - MAIL_FROM: Your email address')
      console.log('   - MAIL_APP_PASSWORD: Your app password')
      console.log('   - MAIL_HOST: SMTP host (default: smtp.gmail.com)')
      console.log('   - MAIL_PORT: SMTP port (default: 587)')
      console.log('   - ADMIN_EMAIL: Admin email for notifications')
    }
  } catch (error) {
    console.error('❌ Email test failed:', error.message)
    console.log('📝 Make sure to configure your email settings in .env.local')
  }
}

testEmailConfig() 
import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { sendCustomNotification, sendEmail } from '@/lib/email'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const emailSchema = z.object({
  recipients: z.array(z.string().email()).min(1, 'At least one recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  recipientNames: z.record(z.string()).optional(),
  sendToAllUsers: z.boolean().default(false),
  sendToAllSubscribers: z.boolean().default(false),
  testMode: z.boolean().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = emailSchema.parse(body)

    let recipients = [...validatedData.recipients]
    let recipientNames = validatedData.recipientNames || {}

    // Add all users if requested
    if (validatedData.sendToAllUsers) {
      const users = await prisma.user.findMany({
        select: { email: true, name: true }
      })
      
      users.forEach(user => {
        if (!recipients.includes(user.email)) {
          recipients.push(user.email)
          if (user.name) {
            recipientNames[user.email] = user.name
          }
        }
      })
    }

    // Add all email subscribers if requested
    if (validatedData.sendToAllSubscribers) {
      const subscribers = await prisma.emailSubscriber.findMany({
        where: { active: true },
        select: { email: true, name: true }
      })
      
      subscribers.forEach(subscriber => {
        if (!recipients.includes(subscriber.email)) {
          recipients.push(subscriber.email)
          if (subscriber.name) {
            recipientNames[subscriber.email] = subscriber.name
          }
        }
      })
    }

    // Test mode - only send to admin
    if (validatedData.testMode) {
      recipients = [admin.email]
      recipientNames = { [admin.email]: admin.name || 'Admin' }
    }

    console.log(`📧 Sending email to ${recipients.length} recipients...`)

    // Send emails
    const results = await sendCustomNotification({
      recipients,
      subject: validatedData.subject,
      content: validatedData.content,
      recipientNames
    })

    // Count successful and failed sends
    const successful = results.filter(r => r.result.success).length
    const failed = results.filter(r => !r.result.success).length

    // Log the email campaign
    console.log(`✅ Email campaign completed: ${successful} sent, ${failed} failed`)

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${successful} recipients`,
      stats: {
        total: recipients.length,
        successful,
        failed,
        recipients: results.map(r => ({
          email: r.email,
          success: r.result.success,
          error: r.result.error || null
        }))
      }
    })

  } catch (error) {
    console.error('Email sending error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send email. Please try again.' 
      },
      { status: 500 }
    )
  }
}

// Get email templates and recipient lists
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'recipients') {
      // Get available recipient lists
      const [userCount, subscriberCount, contactCount] = await Promise.all([
        prisma.user.count(),
        prisma.emailSubscriber.count({ where: { active: true } }),
        prisma.contactSubmission.count()
      ])

      return NextResponse.json({
        success: true,
        data: {
          users: userCount,
          subscribers: subscriberCount,
          contacts: contactCount
        }
      })
    }

    if (action === 'templates') {
      // Return predefined email templates
      const templates = [
        {
          id: 'welcome',
          name: 'Welcome Message',
          subject: 'Welcome to Avacasa - Your Journey to Dream Properties Begins!',
          content: `
            <h2>Welcome to the Avacasa Family!</h2>
            <p>We're thrilled to have you join our community of property enthusiasts and investors.</p>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Explore our curated collection of holiday homes and farmlands</li>
              <li>Get personalized property recommendations</li>
              <li>Connect with our expert property consultants</li>
              <li>Stay updated with market insights and investment opportunities</li>
            </ul>
            
            <p>If you have any questions, our team is here to help you every step of the way.</p>
          `
        },
        {
          id: 'newsletter',
          name: 'Monthly Newsletter',
          subject: 'Avacasa Monthly Update - New Properties & Market Insights',
          content: `
            <h2>This Month at Avacasa</h2>
            
            <h3>🏡 New Property Listings</h3>
            <p>Discover our latest collection of premium holiday homes and investment properties.</p>
            
            <h3>📈 Market Insights</h3>
            <p>Stay informed with the latest trends in vacation real estate and investment opportunities.</p>
            
            <h3>💡 Investment Tips</h3>
            <p>Expert advice to help you make informed property investment decisions.</p>
            
            <p>Visit our website to explore all new listings and opportunities.</p>
          `
        },
        {
          id: 'promotion',
          name: 'Special Offer',
          subject: 'Limited Time Offer - Exclusive Property Deals',
          content: `
            <h2>🎉 Exclusive Offer Just for You!</h2>
            
            <p>For a limited time, we're offering special deals on select premium properties.</p>
            
            <h3>What's Included:</h3>
            <ul>
              <li>Reduced booking amounts</li>
              <li>Flexible payment plans</li>
              <li>Complimentary legal assistance</li>
              <li>Priority site visits</li>
            </ul>
            
            <p><strong>Offer valid until [DATE]</strong></p>
            
            <p>Contact our team today to learn more about these exclusive opportunities.</p>
          `
        }
      ]

      return NextResponse.json({
        success: true,
        data: templates
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action parameter'
    }, { status: 400 })

  } catch (error) {
    console.error('Email templates fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
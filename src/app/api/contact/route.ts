import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendContactFormNotification } from '@/lib/email'
import { z } from 'zod'

const baseContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  type: z.enum(['GENERAL', 'SALES', 'SUPPORT', 'PARTNERSHIP', 'PHONE_INQUIRY']).default('GENERAL'),
  source: z.string().optional().default('web_form'),
  propertyInterest: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Contact API called')
    const body = await request.json()
    console.log('📝 Request body:', body)
    
    // Validate base schema first
    const baseValidation = baseContactSchema.safeParse(body)
    if (!baseValidation.success) {
      console.log('❌ Base validation failed:', baseValidation.error.errors)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: baseValidation.error.errors 
        },
        { status: 400 }
      )
    }

    const data = baseValidation.data
    console.log('✅ Base validation passed:', data)

    // Additional validation based on type
    if (data.type === 'PHONE_INQUIRY') {
      if (!data.phone || data.phone.length < 10) {
        console.log('❌ Phone validation failed for PHONE_INQUIRY')
        return NextResponse.json(
          { 
            success: false, 
            error: 'Phone number is required for phone inquiries',
            details: [{ path: ['phone'], message: 'Phone number is required for phone inquiries' }]
          },
          { status: 400 }
        )
      }
      console.log('✅ Phone validation passed for PHONE_INQUIRY')
    } else {
      if (!data.email || !z.string().email().safeParse(data.email).success) {
        console.log('❌ Email validation failed for general inquiry')
        return NextResponse.json(
          { 
            success: false, 
            error: 'Valid email is required for general inquiries',
            details: [{ path: ['email'], message: 'Valid email is required for general inquiries' }]
          },
          { status: 400 }
        )
      }
      console.log('✅ Email validation passed for general inquiry')
    }
    
    console.log('💾 Attempting to save to database...')
    // Save to database
    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        type: data.type,
        source: data.source,
        status: 'NEW'
      }
    })
    console.log('✅ Saved to database:', contactSubmission.id)

    // Send email notifications only if email is provided
    if (data.email) {
      console.log('📧 Attempting to send email notifications...')
      try {
        const emailResult = await sendContactFormNotification({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          propertyInterest: data.propertyInterest
        })

        console.log('📧 Email notifications sent:', emailResult)
        
        // Update submission status to indicate email was sent
        await prisma.contactSubmission.update({
          where: { id: contactSubmission.id },
          data: { status: 'IN_PROGRESS' }
        })

      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError)
        // Don't fail the API call if email fails, but log it
      }
    } else {
      console.log('📞 Phone inquiry without email, setting status to IN_PROGRESS')
      // For phone inquiries without email, set status to IN_PROGRESS
      await prisma.contactSubmission.update({
        where: { id: contactSubmission.id },
        data: { status: 'IN_PROGRESS' }
      })
    }

    console.log('✅ Contact form submission completed successfully')
    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      submissionId: contactSubmission.id
    })

  } catch (error) {
    console.error('❌ Contact form error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit contact form. Please try again.' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contactSubmission.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Contact submissions fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact submissions' },
      { status: 500 }
    )
  }
} 
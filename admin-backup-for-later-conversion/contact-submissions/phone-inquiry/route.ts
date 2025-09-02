import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const phoneInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Phone number is required for phone inquiries'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  notes: z.string().optional(),
  propertyInterest: z.string().optional()
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
    const validatedData = phoneInquirySchema.parse(body)

    // Create phone inquiry
    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        name: validatedData.name,
        email: validatedData.email || `${validatedData.phone}@phone-inquiry.local`,
        phone: validatedData.phone,
        subject: validatedData.subject,
        message: validatedData.message,
        type: 'PHONE_INQUIRY',
        source: 'phone_call',
        notes: validatedData.notes,
        status: 'IN_PROGRESS' // Phone inquiries start as in progress since they've been contacted
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Phone inquiry recorded successfully',
      data: contactSubmission
    })

  } catch (error) {
    console.error('Phone inquiry creation error:', error)
    
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
        error: 'Failed to record phone inquiry. Please try again.' 
      },
      { status: 500 }
    )
  }
} 
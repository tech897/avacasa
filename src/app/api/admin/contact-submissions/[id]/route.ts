import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  notes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request)
    const { id } = await params

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const submission = await prisma.contactSubmission.findUnique({
      where: { id }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: submission
    })

  } catch (error) {
    console.error('Contact submission fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request)
    const { id } = await params

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: submission,
      message: 'Contact submission updated successfully'
    })

  } catch (error) {
    console.error('Contact submission update error:', error)
    
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request)
    const { id } = await params

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.contactSubmission.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Contact submission deleted successfully'
    })

  } catch (error) {
    console.error('Contact submission deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
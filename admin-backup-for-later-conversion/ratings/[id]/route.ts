import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateRatingSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  verified: z.boolean().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED']).optional(),
  adminNotes: z.string().optional(),
  helpful: z.number().min(0).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const rating = await prisma.rating.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!rating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      )
    }

    // Parse property images
    const parsedRating = {
      ...rating,
      property: {
        ...rating.property,
        images: JSON.parse(rating.property.images || '[]'),
      }
    }

    return NextResponse.json({ rating: parsedRating })
  } catch (error) {
    console.error('Error fetching rating:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const data = updateRatingSchema.parse(body)

    // Check if rating exists
    const existingRating = await prisma.rating.findUnique({
      where: { id }
    })

    if (!existingRating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      )
    }

    const rating = await prisma.rating.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // Parse property images
    const parsedRating = {
      ...rating,
      property: {
        ...rating.property,
        images: JSON.parse(rating.property.images || '[]'),
      }
    }

    return NextResponse.json({ rating: parsedRating })
  } catch (error) {
    console.error('Rating update error:', error)
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

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if rating exists
    const existingRating = await prisma.rating.findUnique({
      where: { id }
    })

    if (!existingRating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      )
    }

    await prisma.rating.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Rating deleted successfully' 
    })
  } catch (error) {
    console.error('Rating deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
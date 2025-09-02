import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED', 'all']).default('all'),
  propertyId: z.string().optional(),
  search: z.string().optional(),
})

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
    const query = querySchema.parse(Object.fromEntries(searchParams))

    const where = {
      ...(query.status !== 'all' && { status: query.status }),
      ...(query.propertyId && { propertyId: query.propertyId }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { review: { contains: query.search, mode: 'insensitive' as const } },
          { property: { title: { contains: query.search, mode: 'insensitive' as const } } },
        ],
      }),
    }

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where,
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
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rating.count({ where }),
    ])

    // Parse property images
    const parsedRatings = ratings.map((rating: any) => ({
      ...rating,
      property: {
        ...rating.property,
        images: JSON.parse(rating.property.images || '[]'),
      }
    }))

    return NextResponse.json({
      ratings: parsedRatings,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const createRatingSchema = z.object({
  propertyId: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  verified: z.boolean().default(false),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED']).default('PENDING'),
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
    const data = createRatingSchema.parse(body)

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    const rating = await prisma.rating.create({
      data,
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
    console.error('Rating creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
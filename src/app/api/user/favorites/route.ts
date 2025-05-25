import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: decoded.userId },
      include: {
        property: {
          include: {
            location: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Parse JSON fields in properties
    const favoritesWithParsedData = favorites.map(favorite => ({
      ...favorite,
      property: {
        ...favorite.property,
        images: JSON.parse(favorite.property.images || '[]'),
        amenities: JSON.parse(favorite.property.amenities || '[]'),
        features: JSON.parse(favorite.property.features || '[]'),
        coordinates: favorite.property.coordinates ? JSON.parse(favorite.property.coordinates) : null,
        price: parseInt(favorite.property.price)
      }
    }))

    return NextResponse.json({
      success: true,
      favorites: favoritesWithParsedData
    })
  } catch (error) {
    console.error('Favorites fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string }

    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_propertyId: {
          userId: decoded.userId,
          propertyId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Property already in favorites' },
        { status: 400 }
      )
    }

    // Add to favorites
    const favorite = await prisma.userFavorite.create({
      data: {
        userId: decoded.userId,
        propertyId
      }
    })

    // Track favorite action
    await prisma.userActivity.create({
      data: {
        userId: decoded.userId,
        action: 'PROPERTY_FAVORITE',
        resource: propertyId,
        metadata: JSON.stringify({
          propertyTitle: property.title,
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')
      }
    })

    return NextResponse.json({
      success: true,
      favorite
    })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string }

    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Remove from favorites
    await prisma.userFavorite.delete({
      where: {
        userId_propertyId: {
          userId: decoded.userId,
          propertyId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites'
    })
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const locations = await prisma.location.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Locations fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    
    const location = await prisma.location.create({
      data: {
        ...data,
        highlights: JSON.stringify(data.highlights || []),
        amenities: JSON.stringify(data.amenities || []),
        coordinates: data.coordinates ? JSON.stringify(data.coordinates) : JSON.stringify({ lat: 0, lng: 0 })
      }
    })

    return NextResponse.json({ location })
  } catch (error) {
    console.error('Location creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
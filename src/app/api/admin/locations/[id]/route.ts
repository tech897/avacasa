import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const location = await prisma.location.findUnique({
      where: { id: id },
      include: {
        properties: true
      }
    })

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ location })
  } catch (error) {
    console.error('Location fetch error:', error)
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

    const data = await request.json()
    
    // Process JSON fields if they exist
    const updateData: any = { ...data }
    if (data.highlights) updateData.highlights = JSON.stringify(data.highlights)
    if (data.amenities) updateData.amenities = JSON.stringify(data.amenities)
    if (data.coordinates) updateData.coordinates = JSON.stringify(data.coordinates)

    const location = await prisma.location.update({
      where: { id: id },
      data: updateData
    })

    return NextResponse.json({ location })
  } catch (error) {
    console.error('Location update error:', error)
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

    // Check if location has properties
    const propertyCount = await prisma.property.count({
      where: { locationId: id }
    })

    if (propertyCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete location with existing properties' },
        { status: 400 }
      )
    }

    await prisma.location.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Location deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
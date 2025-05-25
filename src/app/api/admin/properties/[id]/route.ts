import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        location: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const parsedProperty = {
      ...property,
      images: JSON.parse(property.images || '[]'),
      amenities: JSON.parse(property.amenities || '[]'),
      features: JSON.parse(property.features || '[]'),
      coordinates: property.coordinates ? JSON.parse(property.coordinates) : null,
    }

    return NextResponse.json({ property: parsedProperty })
  } catch (error) {
    console.error('Property fetch error:', error)
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

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const data = await request.json()
    
    // Process JSON fields if they exist
    const updateData: any = { ...data }
    if (data.images) updateData.images = JSON.stringify(data.images)
    if (data.amenities) updateData.amenities = JSON.stringify(data.amenities)
    if (data.features) updateData.features = JSON.stringify(data.features)
    if (data.coordinates) updateData.coordinates = JSON.stringify(data.coordinates)

    // Get the old property to check if location changed
    const oldProperty = await prisma.property.findUnique({
      where: { id },
      select: { locationId: true, active: true, status: true }
    })

    const property = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        location: {
          select: {
            name: true
          }
        }
      }
    })

    // Update location property counts if relevant fields changed
    const locationChanged = oldProperty?.locationId !== property.locationId
    const statusChanged = oldProperty?.active !== property.active || oldProperty?.status !== property.status
    
    if (locationChanged || statusChanged) {
      // Update old location count if location changed
      if (locationChanged && oldProperty?.locationId) {
        const oldLocationPropertyCount = await prisma.property.count({
          where: {
            locationId: oldProperty.locationId,
            active: true,
            status: 'AVAILABLE'
          }
        })
        
        await prisma.location.update({
          where: { id: oldProperty.locationId },
          data: { propertyCount: oldLocationPropertyCount }
        })
      }
      
      // Update new/current location count
      const newLocationPropertyCount = await prisma.property.count({
        where: {
          locationId: property.locationId,
          active: true,
          status: 'AVAILABLE'
        }
      })
      
      await prisma.location.update({
        where: { id: property.locationId },
        data: { propertyCount: newLocationPropertyCount }
      })
    }

    // Parse JSON fields
    const parsedProperty = {
      ...property,
      images: JSON.parse(property.images || '[]'),
      amenities: JSON.parse(property.amenities || '[]'),
      features: JSON.parse(property.features || '[]'),
      coordinates: property.coordinates ? JSON.parse(property.coordinates) : null,
    }

    return NextResponse.json({ property: parsedProperty })
  } catch (error) {
    console.error('Property update error:', error)
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

    // Get property info before deletion
    const property = await prisma.property.findUnique({
      where: { id },
      select: { locationId: true, active: true, status: true }
    })

    await prisma.property.delete({
      where: { id }
    })

    // Update location property count if the deleted property was active and available
    if (property && property.active && property.status === 'AVAILABLE') {
      const propertyCount = await prisma.property.count({
        where: {
          locationId: property.locationId,
          active: true,
          status: 'AVAILABLE'
        }
      })
      
      await prisma.location.update({
        where: { id: property.locationId },
        data: { propertyCount }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Property deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
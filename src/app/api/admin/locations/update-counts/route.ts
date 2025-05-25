import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all locations
    const locations = await prisma.location.findMany({
      select: { id: true, name: true }
    })

    const updateResults = []

    // Update property count for each location
    for (const location of locations) {
      const propertyCount = await prisma.property.count({
        where: {
          locationId: location.id,
          active: true,
          status: 'AVAILABLE'
        }
      })

      await prisma.location.update({
        where: { id: location.id },
        data: { propertyCount }
      })

      updateResults.push({
        locationId: location.id,
        locationName: location.name,
        propertyCount
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Property counts updated successfully',
      results: updateResults
    })
  } catch (error) {
    console.error('Error updating property counts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
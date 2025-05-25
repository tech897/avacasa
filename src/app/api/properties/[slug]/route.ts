import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const property = await prisma.property.findUnique({
      where: { 
        slug: slug,
        active: true 
      },
      include: {
        location: true
      }
    })

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.property.update({
      where: { id: property.id },
      data: { views: { increment: 1 } }
    })

    // Parse JSON fields
    const parsedProperty = {
      ...property,
      price: parseFloat(property.price),
      images: JSON.parse(property.images || '[]'),
      amenities: JSON.parse(property.amenities || '[]'),
      features: JSON.parse(property.features || '[]'),
      coordinates: property.coordinates ? JSON.parse(property.coordinates) : null,
      unitConfiguration: property.unitConfiguration ? JSON.parse(property.unitConfiguration) : null,
      legalApprovals: property.legalApprovals ? JSON.parse(property.legalApprovals) : null,
      registrationCosts: property.registrationCosts ? JSON.parse(property.registrationCosts) : null,
      propertyManagement: property.propertyManagement ? JSON.parse(property.propertyManagement) : null,
      financialReturns: property.financialReturns ? JSON.parse(property.financialReturns) : null,
      investmentBenefits: property.investmentBenefits ? JSON.parse(property.investmentBenefits) : null,
      nearbyInfrastructure: property.nearbyInfrastructure ? JSON.parse(property.nearbyInfrastructure) : null,
      emiOptions: property.emiOptions ? JSON.parse(property.emiOptions) : null,
      tags: property.tags ? JSON.parse(property.tags) : null,
    }

    return NextResponse.json({
      success: true,
      data: parsedProperty
    })
  } catch (error) {
    console.error('Property fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
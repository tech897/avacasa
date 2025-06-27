import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getContentSettings } from '@/lib/settings'

const querySchema = z.object({
  location: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  propertyType: z.string().optional(),
  bedrooms: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))
    
    // Get content settings for featured properties limit
    const contentSettings = await getContentSettings()
    
    // Use settings-based limit for featured properties
    let effectiveLimit = query.limit
    if (query.featured === true) {
      effectiveLimit = Math.min(query.limit, contentSettings.featuredPropertiesLimit)
    }
    
    const where = {
      ...(query.location && { locationId: query.location }),
      ...(query.propertyType && { propertyType: query.propertyType }),
      ...(query.bedrooms && { bedrooms: { gte: query.bedrooms } }),
      ...(query.minPrice && { price: { gte: query.minPrice } }),
      ...(query.maxPrice && { price: { lte: query.maxPrice } }),
      ...(query.featured !== undefined && { featured: query.featured }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
          { location: { name: { contains: query.search, mode: 'insensitive' as const } } },
        ],
      }),
      status: 'AVAILABLE' as const,
    } as any
    
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: { location: true },
        skip: (query.page - 1) * effectiveLimit,
        take: effectiveLimit,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
      }),
      prisma.property.count({ where }),
    ])
    
    // Parse JSON fields for each property
    const parsedProperties = properties.map(property => {
      let nearbyInfrastructure = null;
      
      // Parse nearbyInfrastructure and convert strings to proper arrays
      if (property.nearbyInfrastructure) {
        try {
          const parsed = JSON.parse(property.nearbyInfrastructure);
          nearbyInfrastructure = {
            educational: parsed.education ? 
              parsed.education.split(',').filter((item: string) => item.trim()).map((item: string) => ({
                name: item.trim(),
                distance: 'Contact for details'
              })) : [],
            healthcare: parsed.healthcare ? 
              parsed.healthcare.split(',').filter((item: string) => item.trim()).map((item: string) => ({
                name: item.trim(),
                distance: 'Contact for details'
              })) : [],
            shopping: parsed.shopping ? 
              parsed.shopping.split(',').filter((item: string) => item.trim()).map((item: string) => ({
                name: item.trim(),
                distance: 'Contact for details'
              })) : [],
            transportation: parsed.transport ? [
              ...(parsed.transport.airport ? [{ name: `Airport: ${parsed.transport.airport}`, distance: 'Contact for details' }] : []),
              ...(parsed.transport.bus ? [{ name: `Bus: ${parsed.transport.bus}`, distance: 'Contact for details' }] : []),
              ...(parsed.transport.train ? [{ name: `Train: ${parsed.transport.train}`, distance: 'Contact for details' }] : []),
              ...(parsed.transport.highway ? [{ name: `Highway: ${parsed.transport.highway}`, distance: 'Contact for details' }] : [])
            ] : [],
            attractions: parsed.attractions || []
          };
        } catch (e) {
          nearbyInfrastructure = {
            educational: [],
            healthcare: [],
            shopping: [],
            transportation: [],
            attractions: []
          };
        }
      }

      return {
        ...property,
        images: JSON.parse(property.images || '[]'),
        amenities: JSON.parse(property.amenities || '[]'),
        features: JSON.parse(property.features || '[]'),
        coordinates: property.coordinates ? JSON.parse(property.coordinates) : null,
        nearbyInfrastructure,
        // Parse other JSON fields
        unitConfiguration: property.unitConfiguration ? JSON.parse(property.unitConfiguration) : null,
        legalApprovals: property.legalApprovals ? JSON.parse(property.legalApprovals) : [],
        registrationCosts: property.registrationCosts ? JSON.parse(property.registrationCosts) : null,
        propertyManagement: property.propertyManagement ? JSON.parse(property.propertyManagement) : null,
        financialReturns: property.financialReturns ? JSON.parse(property.financialReturns) : null,
        investmentBenefits: property.investmentBenefits ? JSON.parse(property.investmentBenefits) : [],
        emiOptions: property.emiOptions ? JSON.parse(property.emiOptions) : null,
        tags: property.tags ? JSON.parse(property.tags) : []
      };
    })
    
    return NextResponse.json({
      success: true,
      data: parsedProperties,
      pagination: {
        page: query.page,
        limit: effectiveLimit,
        total,
        pages: Math.ceil(total / effectiveLimit),
      },
      settings: query.featured === true ? {
        featuredPropertiesLimit: contentSettings.featuredPropertiesLimit
      } : undefined
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch properties',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
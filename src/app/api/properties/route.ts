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
  // Map bounds filtering
  bounds: z.string().optional(), // JSON string with {north, south, east, west}
})

// Helper function to check if coordinates are within bounds
function isWithinBounds(coordinates: any, bounds: any): boolean {
  if (!coordinates || !coordinates.lat || !coordinates.lng) return false
  if (!bounds) return true

  const { lat, lng } = coordinates
  const { north, south, east, west } = bounds

  return lat >= south && lat <= north && lng >= west && lng <= east
}

// --- New helpers ---
function toRad (deg: number) { return (deg * Math.PI) / 180 }
function haversine (lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = querySchema.parse(Object.fromEntries(searchParams))
    

    
    // Parse bounds if provided
    let boundsFilter = null
    if (query.bounds) {
      try {
        boundsFilter = JSON.parse(query.bounds)
      } catch (e) {
        console.warn('Invalid bounds format:', query.bounds)
      }
    }
    
    // Get content settings for featured properties limit
    const contentSettings = await getContentSettings()
    
    // Use settings-based limit for featured properties
    let effectiveLimit = query.limit
    if (query.featured === true) {
      effectiveLimit = Math.min(query.limit, contentSettings.featuredPropertiesLimit)
    }
    
    // Handle location search - support both location ID and location name
    let locationFilter = {}
    let enhancedSearch = query.search
    
    // --- Collect center coordinates if location query present ---
    let centerCoords: { lat: number; lng: number } | null = null
    if (query.location) {
      try {
        const loc = await prisma.location.findFirst({
          where: {
            OR: [
              { name: { equals: query.location } },
              { slug: { equals: query.location.toLowerCase().replace(/\s+/g, '-') } },
              { name: { contains: query.location } }
            ],
            active: true
          }
        })
        if (loc) {
          try {
            centerCoords = JSON.parse(loc.coordinates)
          } catch (_) {
            centerCoords = null
          }
        }
      } catch (e) {
        centerCoords = null
      }
    }
    
    // Instead of strict locationId match, we prefer name contains so that nearby areas also appear.
    if (query.location) {
      locationFilter = {
        location: {
          name: { contains: query.location }
        }
      }
    }
    
    const where = {
      ...locationFilter,
      ...(query.propertyType && { propertyType: query.propertyType }),
      ...(query.bedrooms && { bedrooms: { gte: query.bedrooms } }),
      ...(query.featured !== undefined && { featured: query.featured }),
      ...(enhancedSearch && {
        OR: [
          { title: { contains: enhancedSearch } },
          { description: { contains: enhancedSearch } },
          { location: { name: { contains: enhancedSearch } } },
        ],
      }),
      status: 'AVAILABLE' as const,
      active: true,
    } as any
    
    // First get all properties that match other criteria
    const allProperties = await prisma.property.findMany({
      where,
      include: { location: true },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
    })
    
    // Parse JSON fields and filter by bounds if provided
    const parsedProperties = allProperties.map(property => {
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

    // Apply price filtering (handle both string and number prices)
    let priceFilteredProperties = parsedProperties
    if (query.minPrice || query.maxPrice) {
      priceFilteredProperties = parsedProperties.filter(property => {
        // Convert price to number for comparison (handle both string and number)
        let priceNum = 0
        try {
          if (typeof property.price === 'number') {
            priceNum = property.price
          } else if (typeof property.price === 'string') {
            priceNum = parseFloat(property.price.replace(/[^0-9.]/g, '')) || 0
          }
        } catch (error) {
          priceNum = 0
        }
        
        let passesFilter = true
        
        if (query.minPrice && priceNum < query.minPrice) {
          passesFilter = false
        }
        
        if (query.maxPrice && priceNum > query.maxPrice) {
          passesFilter = false
        }
        
        return passesFilter
      })
    }

    // Filter by map bounds if provided
    const boundsFilteredProperties = boundsFilter 
      ? priceFilteredProperties.filter(property => isWithinBounds(property.coordinates, boundsFilter))
      : priceFilteredProperties

    // After boundsFilteredProperties is calculated, insert distance sorting
    let distanceSortedProperties = boundsFilteredProperties
    if (centerCoords) {
      distanceSortedProperties = boundsFilteredProperties
        .map(p => {
          let distance: number | null = null
          try {
            const coords = p.coordinates
            if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
              distance = haversine(centerCoords!.lat, centerCoords!.lng, coords.lat, coords.lng)
            }
          } catch (_) { distance = null }
          return { ...p, distance }
        })
        .sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0
          if (a.distance === null) return 1
          if (b.distance === null) return -1
          return a.distance! - b.distance!
        })
    }

    // Apply pagination on distance-sorted list
    const total = distanceSortedProperties.length
    const paginatedProperties = distanceSortedProperties.slice(
      (query.page - 1) * effectiveLimit,
      query.page * effectiveLimit
    )
    

    
    return NextResponse.json({
      success: true,
      data: paginatedProperties,
      pagination: {
        page: query.page,
        limit: effectiveLimit,
        total,
        pages: Math.ceil(total / effectiveLimit),
      },
      settings: query.featured === true ? {
        featuredPropertiesLimit: contentSettings.featuredPropertiesLimit
      } : undefined,
      // Include bounds information for map synchronization
      bounds: boundsFilter,
      totalBeforeBounds: parsedProperties.length // Total before bounds filtering
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
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getContentSettings } from "@/lib/settings";
import {
  parseArray,
  parseObject,
  parseCoordinates,
  parseNearbyInfrastructure,
  safeJsonParse,
} from "@/lib/utils/json";
import {
  paginatedResponse,
  errorResponse,
  handleApiError,
} from "@/lib/utils/api-response";

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
  viewType: z.string().optional(),
  bounds: z.string().optional(),
});

// Helper function to check if coordinates are within bounds
function isWithinBounds(coordinates: any, bounds: any): boolean {
  if (!coordinates || !coordinates.lat || !coordinates.lng) return false;
  if (!bounds) return true;

  const { lat, lng } = coordinates;
  const { north, south, east, west } = bounds;

  return lat >= south && lat <= north && lng >= west && lng <= east;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    console.log("🔍 API Request - Query params:", query);

    // Parse bounds if provided
    let boundsFilter = null;
    if (query.bounds) {
      try {
        boundsFilter = JSON.parse(query.bounds);
      } catch (e) {
        console.warn("Invalid bounds format:", query.bounds);
      }
    }

    // Get content settings for featured properties limit
    const contentSettings = await getContentSettings();

    // Use settings-based limit for featured properties
    let effectiveLimit = query.limit;
    if (query.featured === true) {
      effectiveLimit = Math.min(
        query.limit,
        contentSettings.featuredPropertiesLimit
      );
    }

    // Build the where clause step by step
    const where: any = {
      status: "AVAILABLE",
      active: true,
    };

    // Add property type filter
    if (query.propertyType) {
      where.propertyType = query.propertyType;
    }

    // Add bedrooms filter
    if (query.bedrooms) {
      where.bedrooms = { gte: query.bedrooms };
    }

    // Add featured filter
    if (query.featured !== undefined) {
      where.featured = query.featured;
    }

    // Add price range filters
    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) {
        where.price.gte = query.minPrice.toString();
      }
      if (query.maxPrice) {
        where.price.lte = query.maxPrice.toString();
      }
    }

    // Enhanced search functionality
    if (query.search) {
      const searchTerm = query.search.trim();
      console.log("🔍 Searching for:", searchTerm);

      // Comprehensive search across multiple fields
      where.OR = [
        // Search in title (case insensitive)
        { title: { contains: searchTerm, mode: "insensitive" } },
        // Search in description (case insensitive)
        { description: { contains: searchTerm, mode: "insensitive" } },
        // Search in location name
        { location: { name: { contains: searchTerm, mode: "insensitive" } } },
        // Search in property type (convert to match enum)
        ...(searchTerm.toLowerCase().includes("villa")
          ? [{ propertyType: "VILLA" }]
          : []),
        ...(searchTerm.toLowerCase().includes("apartment")
          ? [{ propertyType: "APARTMENT" }]
          : []),
        ...(searchTerm.toLowerCase().includes("farmland")
          ? [{ propertyType: "FARMLAND" }]
          : []),
        ...(searchTerm.toLowerCase().includes("plot")
          ? [{ propertyType: "PLOT" }]
          : []),
        ...(searchTerm.toLowerCase().includes("holiday")
          ? [{ propertyType: "HOLIDAY_HOME" }]
          : []),
        ...(searchTerm.toLowerCase().includes("residential")
          ? [{ propertyType: "RESIDENTIAL_PLOT" }]
          : []),
      ];
    }

    // Add location filter (separate from search)
    if (query.location && !query.search) {
      where.location = {
        name: { contains: query.location, mode: "insensitive" },
      };
    }

    console.log("🔍 Final where clause:", JSON.stringify(where, null, 2));

    // Fetch properties with detailed error handling
    const allProperties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        propertyType: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        floors: true,
        images: true,
        amenities: true,
        features: true,
        coordinates: true,
        status: true,
        featured: true,
        active: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        // Extended fields
        unitConfiguration: true,
        aboutProject: true,
        legalApprovals: true,
        registrationCosts: true,
        propertyManagement: true,
        financialReturns: true,
        investmentBenefits: true,
        nearbyInfrastructure: true,
        plotSize: true,
        constructionStatus: true,
        emiOptions: true,
        tags: true,
        // Location with only needed fields
        location: {
          select: {
            id: true,
            name: true,
            slug: true,
            coordinates: true,
          },
        },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });

    console.log(`🔍 Found ${allProperties.length} properties before parsing`);

    // Parse JSON fields safely to prevent crashes
    const parsedProperties = allProperties.map((property) => {
      try {
        return {
          ...property,
          price: parseFloat(property.price) || 0,
          images: parseArray(property.images),
          amenities: parseArray(property.amenities),
          features: parseArray(property.features),
          coordinates: parseCoordinates(property.coordinates),
          nearbyInfrastructure: parseNearbyInfrastructure(
            property.nearbyInfrastructure
          ),
          unitConfiguration: parseObject(property.unitConfiguration),
          legalApprovals: parseObject(property.legalApprovals),
          registrationCosts: parseObject(property.registrationCosts),
          investmentBenefits: parseArray(property.investmentBenefits),
          tags: parseArray(property.tags),
          // Keep text fields as strings
          propertyManagement: property.propertyManagement || "",
          financialReturns: property.financialReturns || "",
          emiOptions: property.emiOptions || "",
          plotSize: property.plotSize || null,
        };
      } catch (parseError) {
        console.error(`Error parsing property ${property.id}:`, parseError);
        // Return the property with basic fields only if parsing fails
        return {
          ...property,
          price: parseFloat(property.price) || 0,
          images: [],
          amenities: [],
          features: [],
          coordinates: null,
          nearbyInfrastructure: {},
          unitConfiguration: {},
          legalApprovals: {},
          registrationCosts: {},
          investmentBenefits: [],
          tags: [],
          propertyManagement: "",
          financialReturns: "",
          emiOptions: "",
          plotSize: null,
        };
      }
    });

    // Apply bounds filtering in JavaScript if needed
    let filteredProperties = parsedProperties;
    if (boundsFilter) {
      filteredProperties = parsedProperties.filter((property) =>
        isWithinBounds(property.coordinates, boundsFilter)
      );
    }

    // Calculate pagination
    const total = filteredProperties.length;
    const pages = Math.ceil(total / effectiveLimit);
    const startIndex = (query.page - 1) * effectiveLimit;
    const endIndex = startIndex + effectiveLimit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    console.log(
      `🔍 Returning ${paginatedProperties.length} properties (page ${query.page}/${pages})`
    );

    return NextResponse.json({
      success: true,
      data: paginatedProperties,
      pagination: {
        page: query.page,
        limit: effectiveLimit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Properties API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch properties",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

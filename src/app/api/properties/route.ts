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
  viewType: z.string().optional(), // Filter by view type/feature
  // Map bounds filtering
  bounds: z.string().optional(), // JSON string with {north, south, east, west}
});

// Helper function to check if coordinates are within bounds
function isWithinBounds(coordinates: any, bounds: any): boolean {
  if (!coordinates || !coordinates.lat || !coordinates.lng) return false;
  if (!bounds) return true;

  const { lat, lng } = coordinates;
  const { north, south, east, west } = bounds;

  return lat >= south && lat <= north && lng >= west && lng <= east;
}

// --- New helpers ---
function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

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

    // Handle location search - support both location ID and location name
    let locationFilter = {};
    let enhancedSearch = query.search;

    // --- Collect center coordinates if location query present ---
    let centerCoords: { lat: number; lng: number } | null = null;
    if (query.location) {
      try {
        const loc = await prisma.location.findFirst({
          where: {
            OR: [
              { name: { equals: query.location } },
              {
                slug: {
                  equals: query.location.toLowerCase().replace(/\s+/g, "-"),
                },
              },
              { name: { contains: query.location } },
            ],
            active: true,
          },
        });
        if (loc) {
          try {
            centerCoords = JSON.parse(loc.coordinates);
          } catch (_) {
            centerCoords = null;
          }
        }
      } catch (e) {
        centerCoords = null;
      }
    }

    // Instead of strict locationId match, we prefer name contains so that nearby areas also appear.
    if (query.location) {
      locationFilter = {
        location: {
          name: { contains: query.location },
        },
      };
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
      status: "AVAILABLE" as const,
      active: true,
    } as any;

    // Optimized query to only select needed fields for better performance
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

    // Parse JSON fields safely to prevent crashes
    const parsedProperties = allProperties.map((property) => {
      return {
        ...property,
        // Safe parsing for all JSON fields
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
        // Keep text fields as strings (don't parse as JSON)
        propertyManagement: property.propertyManagement || "",
        financialReturns: property.financialReturns || "",
        emiOptions: property.emiOptions || "",
      };
    });

    // Apply price filtering (handle both string and number prices)
    let priceFilteredProperties = parsedProperties;
    if (query.minPrice || query.maxPrice) {
      priceFilteredProperties = parsedProperties.filter((property) => {
        // Convert price to number for comparison (handle both string and number)
        let priceNum = 0;
        try {
          if (typeof property.price === "number") {
            priceNum = property.price;
          } else if (typeof property.price === "string") {
            priceNum = parseFloat(property.price.replace(/[^0-9.]/g, "")) || 0;
          }
        } catch (error) {
          priceNum = 0;
        }

        let passesFilter = true;

        if (query.minPrice && priceNum < query.minPrice) {
          passesFilter = false;
        }

        if (query.maxPrice && priceNum > query.maxPrice) {
          passesFilter = false;
        }

        return passesFilter;
      });
    }

    // Filter by viewType if provided
    let viewTypeFilteredProperties = priceFilteredProperties;
    if (query.viewType) {
      viewTypeFilteredProperties = priceFilteredProperties.filter(
        (property) => {
          // Check if the property has features that match the requested viewType
          const features = property.features || [];
          const searchTerm = query.viewType!.toLowerCase();

          return features.some((feature: any) => {
            if (!feature.name) return false;

            const featureName = feature.name.toLowerCase();

            // Exact or close matches for common view types
            if (searchTerm === "lake view") {
              return (
                (featureName.includes("lake") &&
                  featureName.includes("view")) ||
                featureName.includes("lakeside") ||
                featureName.includes("lake views")
              );
            }
            if (searchTerm === "forest view") {
              return (
                (featureName.includes("forest") &&
                  featureName.includes("view")) ||
                featureName.includes("forest views") ||
                featureName === "forest" ||
                featureName.includes("forest edge")
              );
            }
            if (searchTerm === "hill view") {
              return (
                (featureName.includes("hill") &&
                  featureName.includes("view")) ||
                featureName.includes("hill views") ||
                featureName === "hill" ||
                featureName === "hills" ||
                featureName.includes("hills")
              );
            }
            if (searchTerm === "farm view") {
              return (
                (featureName.includes("farm") &&
                  featureName.includes("view")) ||
                featureName.includes("farm views") ||
                featureName.includes("farmland view") ||
                featureName.includes("farmland")
              );
            }
            if (searchTerm === "sea view") {
              return (
                (featureName.includes("sea") && featureName.includes("view")) ||
                featureName.includes("sea views") ||
                featureName.includes("beach view") ||
                featureName.includes("beach")
              );
            }
            if (searchTerm === "pool view") {
              return (
                (featureName.includes("pool") &&
                  featureName.includes("view")) ||
                featureName.includes("pool views") ||
                featureName.includes("poolside")
              );
            }

            // Fallback to general containment check
            return featureName.includes(searchTerm);
          });
        }
      );
    }

    // Filter by map bounds if provided
    const boundsFilteredProperties = boundsFilter
      ? viewTypeFilteredProperties.filter((property) =>
          isWithinBounds(property.coordinates, boundsFilter)
        )
      : viewTypeFilteredProperties;

    // After boundsFilteredProperties is calculated, insert distance sorting
    let distanceSortedProperties = boundsFilteredProperties;
    if (centerCoords) {
      distanceSortedProperties = boundsFilteredProperties
        .map((p) => {
          let distance: number | null = null;
          try {
            const coords = p.coordinates;
            if (
              coords &&
              typeof coords.lat === "number" &&
              typeof coords.lng === "number"
            ) {
              distance = haversine(
                centerCoords!.lat,
                centerCoords!.lng,
                coords.lat,
                coords.lng
              );
            }
          } catch (_) {
            distance = null;
          }
          return { ...p, distance };
        })
        .sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance! - b.distance!;
        });
    }

    // Apply pagination on distance-sorted list
    const total = distanceSortedProperties.length;
    const paginatedProperties = distanceSortedProperties.slice(
      (query.page - 1) * effectiveLimit,
      query.page * effectiveLimit
    );

    return NextResponse.json(
      paginatedResponse(
        paginatedProperties,
        {
          page: query.page,
          limit: effectiveLimit,
          total,
        },
        {
          settings:
            query.featured === true
              ? {
                  featuredPropertiesLimit:
                    contentSettings.featuredPropertiesLimit,
                }
              : undefined,
          bounds: boundsFilter,
          totalBeforeBounds: parsedProperties.length,
        }
      )
    );
  } catch (error) {
    const { message, status } = handleApiError(error);
    return NextResponse.json(
      errorResponse("Failed to fetch properties", message),
      { status }
    );
  }
}

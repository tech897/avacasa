import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().default(8),
});

// Cache for suggestions to improve performance
const suggestionCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface Suggestion {
  type: "location" | "property_type" | "property";
  id: string;
  title: string;
  subtitle: string;
  value: string;
  slug?: string;
  key?: string;
  icon: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const searchTerm = query.q.toLowerCase().trim();
    const cacheKey = `${searchTerm}-${query.limit}`;

    // Check cache first
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
      });
    }

    const suggestions: Suggestion[] = [];

    // Search locations
    const locations = await prisma.location.findMany({
      where: {
        AND: [
          { active: true },
          {
            OR: [
              { name: { contains: searchTerm } },
              { slug: { contains: searchTerm } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        propertyCount: true,
      },
      take: Math.ceil(query.limit / 2),
      orderBy: [{ featured: "desc" }, { propertyCount: "desc" }],
    });

    // Add location suggestions
    locations.forEach((location) => {
      suggestions.push({
        type: "location",
        id: location.id,
        title: location.name,
        subtitle: `${location.propertyCount} properties`,
        value: location.name,
        slug: location.slug,
        icon: "map-pin",
      });
    });

    // Search property types
    const propertyTypes = [
      { key: "VILLA", label: "Villas", icon: "home" },
      { key: "HOLIDAY_HOME", label: "Holiday Homes", icon: "home" },
      { key: "FARMLAND", label: "Farmlands", icon: "tree" },
      { key: "PLOT", label: "Plots", icon: "square" },
      { key: "APARTMENT", label: "Apartments", icon: "building" },
    ];

    const matchingTypes = propertyTypes.filter(
      (type) =>
        type.label.toLowerCase().includes(searchTerm) ||
        type.key.toLowerCase().includes(searchTerm)
    );

    // Get property counts for matching types
    for (const type of matchingTypes) {
      const count = await prisma.property.count({
        where: {
          propertyType: type.key as any,
          status: "AVAILABLE",
          active: true,
        },
      });

      if (count > 0) {
        suggestions.push({
          type: "property_type",
          id: type.key,
          title: type.label,
          subtitle: `${count} properties`,
          value: type.label,
          key: type.key,
          icon: type.icon,
        });
      }
    }

    // Search property titles and descriptions
    if (suggestions.length < query.limit) {
      const properties = await prisma.property.findMany({
        where: {
          AND: [
            { active: true },
            { status: "AVAILABLE" },
            {
              OR: [
                { title: { contains: searchTerm } },
                { description: { contains: searchTerm } },
              ],
            },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          propertyType: true,
          location: {
            select: {
              name: true,
            },
          },
        },
        take: query.limit - suggestions.length,
        orderBy: [{ featured: "desc" }, { views: "desc" }],
      });

      properties.forEach((property) => {
        suggestions.push({
          type: "property",
          id: property.id,
          title: property.title,
          subtitle: `${property.propertyType} in ${property.location.name}`,
          value: property.title,
          slug: property.slug,
          icon: "home",
        });
      });
    }

    // Sort suggestions by relevance
    const typePriority: Record<string, number> = {
      location: 0,
      property_type: 1,
      property: 2,
    };

    const sortedSuggestions = suggestions
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.title.toLowerCase() === searchTerm;
        const bExact = b.title.toLowerCase() === searchTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then prioritize starts with
        const aStarts = a.title.toLowerCase().startsWith(searchTerm);
        const bStarts = b.title.toLowerCase().startsWith(searchTerm);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        // Then by type priority (locations first, then property types, then properties)
        return typePriority[a.type] - typePriority[b.type];
      })
      .slice(0, query.limit);

    // Cache the results
    suggestionCache.set(cacheKey, {
      data: sortedSuggestions,
      timestamp: Date.now(),
    });

    // Clean old cache entries periodically
    if (suggestionCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of suggestionCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          suggestionCache.delete(key);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: sortedSuggestions,
      cached: false,
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch suggestions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

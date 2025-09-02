import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
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

    // Connect to MongoDB
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db("avacasa_production");

    const suggestions: Suggestion[] = [];

    // Search locations
    const locations = await db
      .collection("locations")
      .find({
        $and: [
          { active: true },
          {
            $or: [
              { name: { $regex: searchTerm, $options: "i" } },
              { slug: { $regex: searchTerm, $options: "i" } },
            ],
          },
        ],
      })
      .project({
        _id: 1,
        name: 1,
        slug: 1,
        propertyCount: 1,
      })
      .limit(Math.ceil(query.limit / 2))
      .sort({ featured: -1, propertyCount: -1 })
      .toArray();

    // Add location suggestions
    locations.forEach((location) => {
      suggestions.push({
        type: "location",
        id: location._id.toString(),
        title: location.name,
        subtitle: `${location.propertyCount || 0} properties`,
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
      const count = await db.collection("properties").countDocuments({
        propertyType: type.key,
        status: "AVAILABLE",
        active: true,
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
      const properties = await db
        .collection("properties")
        .aggregate([
          {
            $match: {
              $and: [
                { active: true },
                { status: "AVAILABLE" },
                {
                  $or: [
                    { title: { $regex: searchTerm, $options: "i" } },
                    { description: { $regex: searchTerm, $options: "i" } },
                  ],
                },
              ],
            },
          },
          {
            $lookup: {
              from: "locations",
              localField: "locationId",
              foreignField: "_id",
              as: "location",
            },
          },
          {
            $addFields: {
              location: { $arrayElemAt: ["$location", 0] },
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              propertyType: 1,
              location: { name: 1 },
            },
          },
          {
            $sort: { featured: -1, views: -1 },
          },
          {
            $limit: query.limit - suggestions.length,
          },
        ])
        .toArray();

      properties.forEach((property) => {
        suggestions.push({
          type: "property",
          id: property._id.toString(),
          title: property.title,
          subtitle: `${property.propertyType} in ${
            property.location?.name || "Unknown"
          }`,
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

    // Close MongoDB connection
    await client.close();

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

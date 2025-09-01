import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchParser } from "@/lib/search-parser";
import { MongoClient } from "mongodb";

const querySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().default(20),
  page: z.coerce.number().default(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const searchQuery = query.q.trim();

    // Parse the natural language query
    const parsed = searchParser.parse(searchQuery);

    // Connect to MongoDB
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db("avacasa_production");

    // If confidence is too low, fall back to basic text search
    if (parsed.confidence < 30) {
      await client.close();
      return NextResponse.json({
        success: true,
        data: {
          parsed,
          properties: [],
          fallback: true,
          message:
            "Query not clear enough for natural language processing. Try using specific terms like '2 BHK villa in Goa under 2 crore'.",
        },
        pagination: {
          page: query.page,
          limit: query.limit,
          total: 0,
          pages: 0,
        },
      });
    }

    // Build MongoDB aggregation pipeline
    const pipeline = [];

    // NEW: keep reference to center coordinates for distance sorting
    let centerCoords: { lat: number; lng: number } | null = null;

    // Add location filter
    if (parsed.location) {
      // Fetch location (exact or contains) to get coordinates for distance calculation
      const locationMatch = await db.collection("locations").findOne({
        $or: [
          { name: { $regex: parsed.location, $options: "i" } },
          { slug: { $regex: parsed.location, $options: "i" } },
        ],
        active: true,
      });

      if (locationMatch && locationMatch.coordinates) {
        try {
          if (typeof locationMatch.coordinates === "string") {
            centerCoords = JSON.parse(locationMatch.coordinates);
          } else {
            centerCoords = locationMatch.coordinates;
          }
        } catch (_) {
          centerCoords = null;
        }
      }
    }

    // Build match stage
    const matchStage: any = {
      status: "AVAILABLE",
      active: true,
    };

    // Add property type filter
    if (parsed.propertyType) {
      matchStage.propertyType = parsed.propertyType;
    }

    // Add bedroom filter
    if (parsed.bedrooms) {
      matchStage.bedrooms = { $gte: parsed.bedrooms };
    }

    // Add keyword search if any remaining keywords
    if (parsed.keywords && parsed.keywords.length > 0) {
      const keywordSearch = parsed.keywords.join(" ");
      matchStage.$or = [
        { title: { $regex: keywordSearch, $options: "i" } },
        { description: { $regex: keywordSearch, $options: "i" } },
      ];
    }

    pipeline.push({ $match: matchStage });

    // Add location lookup
    pipeline.push({
      $lookup: {
        from: "locations",
        localField: "locationId",
        foreignField: "_id",
        as: "location",
      },
    });

    pipeline.push({
      $addFields: {
        location: { $arrayElemAt: ["$location", 0] },
      },
    });

    // Add location name filter if specified
    if (parsed.location) {
      pipeline.push({
        $match: {
          $or: [
            { "location.name": { $regex: parsed.location, $options: "i" } },
            { "location.slug": { $regex: parsed.location, $options: "i" } },
          ],
        },
      });
    }

    // Add sorting
    pipeline.push({
      $sort: {
        featured: -1,
        views: -1,
        createdAt: -1,
      },
    });

    // Execute the search query
    const allProperties = await db
      .collection("properties")
      .aggregate(pipeline)
      .toArray();

    // Apply price filtering in application layer
    let priceFilteredProperties = allProperties;
    if (parsed.minPrice || parsed.maxPrice) {
      priceFilteredProperties = allProperties.filter((property) => {
        // Convert price to number for comparison
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

        // Debug logging
        console.log(
          `Property: ${property.title}, Price: ${property.price}, Parsed: ${priceNum}, Max: ${parsed.maxPrice}`
        );

        // Skip properties with price 0 (likely incomplete data)
        if (priceNum === 0) {
          console.log(`Skipping ${property.title} - price is 0`);
          return false;
        }

        let passesFilter = true;

        if (parsed.minPrice && priceNum < parsed.minPrice) {
          console.log(
            `${property.title} filtered out - price ${priceNum} < min ${parsed.minPrice}`
          );
          passesFilter = false;
        }

        if (parsed.maxPrice && priceNum > parsed.maxPrice) {
          console.log(
            `${property.title} filtered out - price ${priceNum} > max ${parsed.maxPrice}`
          );
          passesFilter = false;
        }

        if (passesFilter) {
          console.log(`${property.title} passes price filter`);
        }

        return passesFilter;
      });
    }

    console.log(
      `Total properties after filtering: ${priceFilteredProperties.length}`
    );

    // NEW: distance-based sorting
    let distanceSortedProperties = priceFilteredProperties;
    if (centerCoords) {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const haversine = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
      ) => {
        const R = 6371; // Earth radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      distanceSortedProperties = priceFilteredProperties
        .map((p) => {
          let distance: number | null = null;
          try {
            if (p.coordinates) {
              const coords =
                typeof p.coordinates === "string"
                  ? JSON.parse(p.coordinates)
                  : p.coordinates;
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
    } else {
      // No center coordinates – keep original order
      distanceSortedProperties = priceFilteredProperties;
    }

    // Pagination on distance-sorted list
    const total = distanceSortedProperties.length;
    const properties = distanceSortedProperties.slice(
      (query.page - 1) * query.limit,
      query.page * query.limit
    );

    // Parse JSON fields for each property
    const parsedProperties = properties.map((property) => ({
      ...property,
      images: JSON.parse(property.images || "[]"),
      amenities: JSON.parse(property.amenities || "[]"),
      features: JSON.parse(property.features || "[]"),
      coordinates: property.coordinates
        ? JSON.parse(property.coordinates)
        : null,
      unitConfiguration: property.unitConfiguration
        ? JSON.parse(property.unitConfiguration)
        : null,
      legalApprovals: property.legalApprovals
        ? JSON.parse(property.legalApprovals)
        : [],
      registrationCosts: property.registrationCosts
        ? JSON.parse(property.registrationCosts)
        : null,
      propertyManagement: property.propertyManagement
        ? JSON.parse(property.propertyManagement)
        : null,
      financialReturns: property.financialReturns
        ? JSON.parse(property.financialReturns)
        : null,
      investmentBenefits: property.investmentBenefits
        ? JSON.parse(property.investmentBenefits)
        : [],
      nearbyInfrastructure: property.nearbyInfrastructure
        ? JSON.parse(property.nearbyInfrastructure)
        : null,
      emiOptions: property.emiOptions ? JSON.parse(property.emiOptions) : null,
      tags: property.tags ? JSON.parse(property.tags) : [],
    }));

    // Generate search summary
    const summary = searchParser.summarize(parsed);

    // Convert to search params for URL generation
    const generatedSearchParams = searchParser.toSearchParams(parsed);

    // Close MongoDB connection
    await client.close();

    return NextResponse.json({
      success: true,
      data: {
        parsed,
        properties: parsedProperties,
        summary,
        searchParams: Object.fromEntries(generatedSearchParams.entries()),
        confidence: parsed.confidence,
        originalQuery: searchQuery,
        debug: {
          totalPropertiesBeforeFiltering: allProperties.length,
          totalPropertiesAfterPriceFiltering: priceFilteredProperties.length,
          propertiesBeforeFiltering: allProperties.map((p) => ({
            title: p.title,
            price: p.price,
            bedrooms: p.bedrooms,
            propertyType: p.propertyType,
            locationName: p.location?.name,
          })),
        },
      },
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error("Natural language search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process natural language search",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query: searchQuery, filters = {} } = body;

    if (!searchQuery || typeof searchQuery !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Query is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Parse the natural language query
    const parsed = searchParser.parse(searchQuery);

    // Merge with any additional filters provided
    const mergedFilters = {
      ...parsed,
      ...filters,
    };

    // Log the search query for analytics (optional - could be implemented with MongoDB later)
    // For now, just console log for debugging
    console.log("Search query:", searchQuery, "Filters:", mergedFilters);

    const generatedParams = searchParser.toSearchParams(mergedFilters);

    return NextResponse.json({
      success: true,
      data: {
        parsed: mergedFilters,
        summary: searchParser.summarize(mergedFilters),
        searchParams: Object.fromEntries(generatedParams.entries()),
        confidence: parsed.confidence,
      },
    });
  } catch (error) {
    console.error("Natural language search POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process natural language search",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { z } from "zod";

const querySchema = z.object({
  location: z.string().optional(),
  locations: z.string().optional(),
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

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Properties API (Direct MongoDB) - Starting...");

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    console.log("🔍 Query params:", query);

    // Connect directly to MongoDB
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db("avacasa_production");

    // Build MongoDB query
    const mongoQuery: any = {
      status: "AVAILABLE",
      active: true,
    };

    // Add filters
    if (query.propertyType) {
      mongoQuery.propertyType = query.propertyType;
    }

    if (query.bedrooms) {
      mongoQuery.bedrooms = { $gte: query.bedrooms };
    }

    if (query.featured !== undefined) {
      mongoQuery.featured = query.featured;
    }

    // Add price range filters
    if (query.minPrice || query.maxPrice) {
      mongoQuery.price = {};
      if (query.minPrice) {
        mongoQuery.price.$gte = query.minPrice.toString();
      }
      if (query.maxPrice) {
        mongoQuery.price.$lte = query.maxPrice.toString();
      }
    }

    // Add search functionality
    if (query.search) {
      mongoQuery.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
    }

    // Add viewType filter (filter by features)
    if (query.viewType) {
      mongoQuery.features = { $regex: query.viewType, $options: "i" };
    }

    // Add location filter - we'll need to join with locations to filter by slug
    let locationLookup = {};
    if (query.location) {
      // We'll filter after the location lookup in the aggregation pipeline
      locationLookup = { "location.slug": query.location };
    }

    console.log("🔍 MongoDB query:", JSON.stringify(mongoQuery, null, 2));

    // Calculate pagination
    const skip = (query.page - 1) * query.limit;

    // Build aggregation pipeline with location filtering
    const pipeline = [
      { $match: mongoQuery },
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
    ];

    // Add location filter after lookup if specified
    if (query.location) {
      pipeline.push({ $match: { "location.slug": query.location } });
    }

    // Add sorting, pagination
    pipeline.push(
      { $sort: { featured: -1, createdAt: -1 } } as any,
      { $skip: skip } as any,
      { $limit: query.limit } as any
    );

    // Query properties with the complete pipeline
    const properties = await db
      .collection("properties")
      .aggregate(pipeline)
      .toArray();

    // Get total count for pagination (with location filter if specified)
    let totalCount;
    if (query.location) {
      // Use aggregation to count with location filter
      const countPipeline = [
        { $match: mongoQuery },
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
        { $match: { "location.slug": query.location } },
        { $count: "total" },
      ];

      const countResult = await db
        .collection("properties")
        .aggregate(countPipeline)
        .toArray();

      totalCount = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      totalCount = await db.collection("properties").countDocuments(mongoQuery);
    }

    console.log(
      `✅ Found ${properties.length} properties (${totalCount} total)`
    );

    // Transform the data for the frontend
    const transformedProperties = properties.map((property) => {
      try {
        return {
          id: property._id.toString(),
          title: property.title || "",
          slug: property.slug || "",
          description: property.description || "",
          price: parseInt(property.price) || 0,
          propertyType: property.propertyType || "",
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || 0,
          floors: property.floors || 1,
          status: property.status || "AVAILABLE",
          featured: property.featured || false,
          active: property.active !== false,
          views: property.views || 0,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          // Parse JSON fields safely
          images: property.images ? JSON.parse(property.images) : [],
          amenities: property.amenities ? JSON.parse(property.amenities) : [],
          features: property.features ? JSON.parse(property.features) : [],
          coordinates: property.coordinates
            ? JSON.parse(property.coordinates)
            : null,
          // Location info from the lookup
          location: property.location
            ? {
                id: property.location._id?.toString(),
                name: property.location.name,
                slug: property.location.slug,
                coordinates: property.location.coordinates
                  ? JSON.parse(property.location.coordinates)
                  : null,
              }
            : null,
        };
      } catch (parseError) {
        console.error(`Error parsing property ${property._id}:`, parseError);
        return {
          id: property._id.toString(),
          title: property.title || "",
          slug: property.slug || "",
          description: property.description || "",
          price: parseInt(property.price) || 0,
          propertyType: property.propertyType || "",
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || 0,
          floors: property.floors || 1,
          status: property.status || "AVAILABLE",
          featured: property.featured || false,
          active: property.active !== false,
          views: property.views || 0,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          images: [],
          amenities: [],
          features: [],
          coordinates: null,
          location: property.location
            ? {
                id: property.location._id?.toString(),
                name: property.location.name || "Unknown Location",
                slug: property.location.slug || "",
                coordinates: null,
              }
            : null,
        };
      }
    });

    await client.close();

    const totalPages = Math.ceil(totalCount / query.limit);

    return NextResponse.json({
      success: true,
      data: transformedProperties,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        pages: totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Properties API error:", error);
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

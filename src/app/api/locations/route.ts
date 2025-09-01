import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { z } from "zod";

const querySchema = z.object({
  featured: z.coerce.boolean().optional(),
  limit: z.coerce.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Connect directly to MongoDB
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db("avacasa_production");

    // Build MongoDB query
    const mongoQuery: any = {};
    if (query.featured !== undefined) {
      mongoQuery.featured = query.featured;
    }

    // Query locations directly
    const locations = await db
      .collection("locations")
      .find(mongoQuery)
      .sort({ featured: -1, propertyCount: -1, name: 1 })
      .limit(query.limit || 1000)
      .toArray();

    // Safe JSON parsing function
    const safeJsonParse = (value: any, fallback: any = null) => {
      if (!value) return fallback;
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.error("JSON parse error for value:", value, error);
          return fallback;
        }
      }
      return value;
    };

    // Transform the data for the frontend
    const transformedLocations = locations.map((location) => ({
      id: location._id.toString(),
      name: location.name,
      slug: location.slug,
      description: location.description,
      image: location.image,
      coordinates: safeJsonParse(location.coordinates, null),
      highlights: safeJsonParse(location.highlights, []),
      amenities: safeJsonParse(location.amenities, []),
      featured: location.featured || false,
      propertyCount: location.propertyCount || 0,
      active: location.active !== false,
      type: location.type,
      parentId: location.parentId,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    }));

    await client.close();

    return NextResponse.json({
      success: true,
      data: transformedLocations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch locations",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Connect directly to MongoDB
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db("avacasa_production");

    // Find location by slug
    const location = await db.collection("locations").findOne({ slug });

    if (!location) {
      await client.close();
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 }
      );
    }

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
    const transformedLocation = {
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
    };

    await client.close();

    return NextResponse.json({
      success: true,
      data: transformedLocation,
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch location",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

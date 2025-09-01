import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    // Connect directly to MongoDB
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db("avacasa_production");

    // Fetch all locations with property counts using aggregation
    const locations = await db
      .collection("locations")
      .aggregate([
        {
          $match: { active: true },
        },
        {
          $lookup: {
            from: "properties",
            localField: "_id",
            foreignField: "locationId",
            as: "properties",
          },
        },
        {
          $lookup: {
            from: "locations",
            localField: "parentId",
            foreignField: "_id",
            as: "parent",
          },
        },
        {
          $addFields: {
            propertyCount: {
              $size: {
                $filter: {
                  input: "$properties",
                  cond: {
                    $and: [
                      { $eq: ["$$this.active", true] },
                      { $eq: ["$$this.status", "AVAILABLE"] },
                    ],
                  },
                },
              },
            },
            parent: { $arrayElemAt: ["$parent", 0] },
          },
        },
        {
          $sort: {
            type: 1, // MAJOR first, then MINOR
            featured: -1,
            name: 1,
          },
        },
      ])
      .toArray();

    // Transform locations to match frontend interface
    const transformedLocations = locations.map((location) => ({
      id: location._id.toString(),
      name: location.name,
      slug: location.slug,
      type: location.type?.toLowerCase() as "major" | "minor",
      propertyCount: location.propertyCount || 0,
      majorLocationId: location.parentId?.toString(),
      majorLocationName: location.parent?.name,
    }));

    await client.close();

    return NextResponse.json({
      success: true,
      data: transformedLocations,
    });
  } catch (error) {
    console.error("Error fetching search locations:", error);
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

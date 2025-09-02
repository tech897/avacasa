import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug Properties API called");
    
    // Test basic MongoDB connection
    const db = await getDatabase();
    console.log("✅ MongoDB connected");

    // Get total count
    const totalCount = await db.collection("properties").countDocuments();
    console.log(`📊 Total properties: ${totalCount}`);

    // Get a few sample properties
    const sampleProperties = await db.collection("properties").find({}, {
      projection: {
        _id: 1,
        title: 1,
        slug: 1,
        price: 1,
        propertyType: 1,
        locationId: 1,
        active: 1,
        status: 1,
      }
    }).limit(3).toArray();
    
    console.log(`📋 Sample properties count: ${sampleProperties.length}`);

    // Test with different filters
    const activeCount = await db.collection("properties").countDocuments({
      active: true
    });
    console.log(`✅ Active properties: ${activeCount}`);

    const availableCount = await db.collection("properties").countDocuments({
      active: true,
      status: "AVAILABLE"
    });
    console.log(`🏠 Available properties: ${availableCount}`);

    // Transform _id to id for consistency
    const transformedSamples = sampleProperties.map(prop => ({
      ...prop,
      id: prop._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({
      success: true,
      debug: {
        totalCount,
        activeCount,
        availableCount,
        sampleCount: sampleProperties.length,
        sampleProperties: transformedSamples,
        databaseUrl: process.env.DATABASE_URL ? "SET" : "NOT SET",
        nodeEnv: process.env.NODE_ENV,
        databaseType: "MongoDB"
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Debug Properties API Error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
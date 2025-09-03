import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  try {
    console.log("🔍 Testing MongoDB Connection...");
    
    // Check environment variables
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      return NextResponse.json({
        success: false,
        error: "DATABASE_URL not set",
        details: {
          databaseUrl: "NOT_SET",
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
        }
      });
    }

    // Test basic connection
    console.log("🔗 Connecting to MongoDB...");
    const client = new MongoClient(dbUrl, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000,
    });
    
    await client.connect();
    console.log("✅ MongoDB connected");
    
    // Test database access
    const db = client.db("avacasa_production");
    
    // Quick collection test
    const collections = await db.listCollections().toArray();
    console.log(`📚 Found ${collections.length} collections`);
    
    // Test properties count
    const propertiesCount = await db.collection("properties").countDocuments();
    console.log(`🏠 Properties count: ${propertiesCount}`);
    
    // Test locations count
    const locationsCount = await db.collection("locations").countDocuments();
    console.log(`📍 Locations count: ${locationsCount}`);
    
    await client.close();
    
    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      details: {
        databaseUrl: dbUrl.substring(0, 30) + "...",
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        collections: collections.map(c => c.name),
        counts: {
          properties: propertiesCount,
          locations: locationsCount,
        }
      }
    });
    
  } catch (error: any) {
    console.error("❌ MongoDB Connection Error:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        databaseUrl: process.env.DATABASE_URL ? "SET" : "NOT_SET",
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        errorType: error.constructor.name,
        stack: error.stack?.split('\n').slice(0, 5), // First 5 lines of stack
      }
    });
  }
}

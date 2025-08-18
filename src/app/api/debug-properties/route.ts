import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug Properties API called");
    
    // Test basic Prisma connection
    await prisma.$connect();
    console.log("✅ Prisma connected");

    // Get total count
    const totalCount = await prisma.property.count();
    console.log(`📊 Total properties: ${totalCount}`);

    // Get a few sample properties
    const sampleProperties = await prisma.property.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        propertyType: true,
        locationId: true,
        active: true,
        status: true,
      },
    });
    console.log(`📋 Sample properties count: ${sampleProperties.length}`);

    // Test with different filters
    const activeCount = await prisma.property.count({
      where: { active: true }
    });
    console.log(`✅ Active properties: ${activeCount}`);

    const availableCount = await prisma.property.count({
      where: { 
        active: true,
        status: "AVAILABLE"
      }
    });
    console.log(`🏠 Available properties: ${availableCount}`);

    return NextResponse.json({
      success: true,
      debug: {
        totalCount,
        activeCount,
        availableCount,
        sampleCount: sampleProperties.length,
        sampleProperties,
        databaseUrl: process.env.DATABASE_URL ? "SET" : "NOT SET",
        nodeEnv: process.env.NODE_ENV,
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
  } finally {
    await prisma.$disconnect();
  }
}

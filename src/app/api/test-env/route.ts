import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test environment variables without database connection
    const envStatus = {
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        preview: process.env.DATABASE_URL
          ? process.env.DATABASE_URL.substring(0, 30) + "..."
          : "NOT SET",
        length: process.env.DATABASE_URL?.length || 0,
      },
      JWT_SECRET: {
        exists: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET?.length || 0,
      },
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0,
      },
      AWS_S3_BUCKET: {
        exists: !!process.env.AWS_S3_BUCKET,
        value: process.env.AWS_S3_BUCKET || "NOT SET",
      },
      AWS_CLOUDFRONT_DOMAIN: {
        exists: !!process.env.AWS_CLOUDFRONT_DOMAIN,
        value: process.env.AWS_CLOUDFRONT_DOMAIN || "NOT SET",
      },
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };

    return NextResponse.json({
      success: true,
      message: "Environment variables check",
      environment: envStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

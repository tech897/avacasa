import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const propertyCount = await prisma.property.count()
    const locationCount = await prisma.location.count()
    
    // Get environment info (safely)
    const envInfo = {
      hasDBUrl: !!process.env.DATABASE_URL,
      dbUrlPreview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET',
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nodeEnv: process.env.NODE_ENV
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      counts: {
        properties: propertyCount,
        locations: locationCount
      },
      environment: envInfo,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        hasDBUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

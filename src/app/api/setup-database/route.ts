import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting database setup...')
    
    // Test database connection
    console.log('🔍 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Try to create tables (this will fail if tables already exist, which is fine)
    try {
      // Test if we can query - this will work if tables exist
      const testQuery = await prisma.$queryRaw`SELECT 1 as test`
      console.log('📊 Database tables already exist!')
      
      // Check current data
      const propertyCount = await prisma.property.count()
      const locationCount = await prisma.location.count()
      const ratingCount = await prisma.rating.count()
      
      return NextResponse.json({
        success: true,
        message: 'Database is ready!',
        data: {
          properties: propertyCount,
          locations: locationCount,
          ratings: ratingCount,
          status: 'Tables exist and ready'
        }
      })
      
    } catch (tableError) {
      console.log('⚠️ Tables do not exist yet. This is normal for first setup.')
      return NextResponse.json({
        success: true,
        message: 'Database connected but tables need to be created',
        data: {
          status: 'Connected - needs schema push',
          instruction: 'Run: npx prisma db push'
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      instruction: 'Check DATABASE_URL environment variable'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 
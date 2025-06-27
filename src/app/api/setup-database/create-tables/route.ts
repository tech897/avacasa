import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating database tables...')
    
    // Create tables using raw SQL (simplified version of Prisma schema)
    const createTablesSQL = `
      -- Create admins table
      CREATE TABLE IF NOT EXISTS "admins" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ADMIN',
        "active" BOOLEAN NOT NULL DEFAULT true,
        "lastLogin" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create locations table
      CREATE TABLE IF NOT EXISTS "locations" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "image" TEXT NOT NULL,
        "coordinates" TEXT NOT NULL,
        "highlights" TEXT NOT NULL,
        "amenities" TEXT NOT NULL,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "propertyCount" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create properties table
      CREATE TABLE IF NOT EXISTS "properties" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "price" TEXT NOT NULL,
        "locationId" TEXT NOT NULL,
        "propertyType" TEXT NOT NULL,
        "bedrooms" INTEGER NOT NULL,
        "bathrooms" INTEGER NOT NULL,
        "area" INTEGER NOT NULL,
        "floors" INTEGER NOT NULL DEFAULT 1,
        "images" TEXT NOT NULL,
        "amenities" TEXT NOT NULL,
        "features" TEXT NOT NULL,
        "coordinates" TEXT,
        "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "unitConfiguration" TEXT,
        "aboutProject" TEXT,
        "legalApprovals" TEXT,
        "registrationCosts" TEXT,
        "propertyManagement" TEXT,
        "financialReturns" TEXT,
        "investmentBenefits" TEXT,
        "nearbyInfrastructure" TEXT,
        "plotSize" TEXT,
        "constructionStatus" TEXT,
        "possessionDate" TIMESTAMP,
        "emiOptions" TEXT,
        "metaTitle" TEXT,
        "metaDescription" TEXT,
        "tags" TEXT,
        "views" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "properties_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );

      -- Create users table
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT,
        "name" TEXT,
        "phone" TEXT,
        "avatar" TEXT,
        "provider" TEXT,
        "providerId" TEXT,
        "verified" BOOLEAN NOT NULL DEFAULT false,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "lastLogin" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create ratings table
      CREATE TABLE IF NOT EXISTS "ratings" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "propertyId" TEXT NOT NULL,
        "userId" TEXT,
        "rating" INTEGER NOT NULL,
        "review" TEXT,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "verified" BOOLEAN NOT NULL DEFAULT false,
        "helpful" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "adminNotes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ratings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      -- Create user_activities table
      CREATE TABLE IF NOT EXISTS "user_activities" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "sessionId" TEXT,
        "action" TEXT NOT NULL,
        "resource" TEXT,
        "metadata" TEXT,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "referrer" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "user_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      -- Create other necessary tables
      CREATE TABLE IF NOT EXISTS "user_sessions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "user_favorites" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "propertyId" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "user_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "user_favorites_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "user_favorites_userId_propertyId_key" UNIQUE ("userId", "propertyId")
      );

      CREATE TABLE IF NOT EXISTS "inquiries" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "propertyId" TEXT NOT NULL,
        "userId" TEXT,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "message" TEXT,
        "preferredDate" TIMESTAMP,
        "visitType" TEXT NOT NULL DEFAULT 'SITE_VISIT',
        "budget" TEXT,
        "status" TEXT NOT NULL DEFAULT 'NEW',
        "source" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "inquiries_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "inquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "excerpt" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "author" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "tags" TEXT NOT NULL,
        "featuredImage" TEXT NOT NULL,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "publishedAt" TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "views" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "contact_submissions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "phone" TEXT,
        "subject" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'GENERAL',
        "source" TEXT,
        "status" TEXT NOT NULL DEFAULT 'NEW',
        "notes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "email_subscribers" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "source" TEXT,
        "interests" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "verified" BOOLEAN NOT NULL DEFAULT false,
        "subscribedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "unsubscribedAt" TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "site_settings" (
        "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'settings',
        "data" TEXT NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "page_views" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "path" TEXT NOT NULL,
        "userId" TEXT,
        "sessionId" TEXT,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "referrer" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "search_queries" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "query" TEXT NOT NULL,
        "filters" TEXT,
        "results" INTEGER NOT NULL DEFAULT 0,
        "userId" TEXT,
        "sessionId" TEXT,
        "ipAddress" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Execute the SQL
    await prisma.$executeRawUnsafe(createTablesSQL)
    
    console.log('✅ Database tables created successfully!')
    
    // Test the tables
    const locationCount = await prisma.location.count()
    const propertyCount = await prisma.property.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully!',
      data: {
        tablesCreated: true,
        locations: locationCount,
        properties: propertyCount,
        status: 'Ready for data import'
      }
    })
    
  } catch (error) {
    console.error('❌ Table creation failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Table creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to create tables',
    instruction: 'Send POST request to this endpoint to create database tables'
  })
} 
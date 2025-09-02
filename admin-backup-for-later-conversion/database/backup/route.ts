import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`Database backup initiated by admin: ${admin.email}`)

    // Get all data from all tables
    const [
      users,
      properties,
      locations,
      blogPosts,
      contactSubmissions,
      emailSubscribers,
      userActivities,
      siteSettings
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.property.findMany({
        include: {
          location: true
        }
      }),
      prisma.location.findMany(),
      prisma.blogPost.findMany(),
      prisma.contactSubmission.findMany(),
      prisma.emailSubscriber.findMany(),
      prisma.userActivity.findMany(),
      prisma.siteSettings.findMany()
    ])

    // Create backup object
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        exportedBy: admin.email,
        totalRecords: {
          users: users.length,
          properties: properties.length,
          locations: locations.length,
          blogPosts: blogPosts.length,
          contactSubmissions: contactSubmissions.length,
          emailSubscribers: emailSubscribers.length,
          userActivities: userActivities.length,
          siteSettings: siteSettings.length
        }
      },
      data: {
        users: users.map((user: any) => ({
          ...user,
          password: '[REDACTED]' // Don't export passwords
        })),
        properties,
        locations,
        blogPosts,
        contactSubmissions,
        emailSubscribers,
        userActivities,
        siteSettings
      }
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `avacasa-backup-${timestamp}.json`

    console.log(`✅ Database backup created successfully: ${JSON.stringify(backup.metadata.totalRecords)}`)

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Database backup error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create database backup',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
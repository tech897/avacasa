import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all stats in parallel
    const [
      totalUsers,
      totalProperties,
      totalLocations,
      totalSubscribers,
      totalInquiries,
      totalPageViews,
      recentActivities,
      popularProperties
    ] = await Promise.all([
      prisma.user.count({ where: { active: true } }),
      prisma.property.count({ where: { active: true } }),
      prisma.location.count({ where: { active: true } }),
      prisma.emailSubscriber.count({ where: { active: true } }),
      prisma.inquiry.count(),
      prisma.pageView.count(),
      prisma.userActivity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.property.findMany({
        take: 10,
        orderBy: { views: 'desc' },
        select: {
          id: true,
          title: true,
          views: true,
          slug: true
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalProperties,
      totalLocations,
      totalSubscribers,
      totalInquiries,
      totalPageViews,
      recentActivities,
      popularProperties
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
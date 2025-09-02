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

    const body = await request.json()
    const { daysToKeep = 30, dataTypes = ['activities', 'pageViews', 'searchQueries'] } = body

    console.log(`Analytics cleanup initiated by admin: ${admin.email}`)
    console.log(`Keeping data from last ${daysToKeep} days, cleaning: ${dataTypes.join(', ')}`)

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const results = {
      userActivities: 0,
      pageViews: 0,
      searchQueries: 0
    }

    // Clean up old data based on selected types
    if (dataTypes.includes('activities')) {
      const deletedActivities = await prisma.userActivity.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      })
      results.userActivities = deletedActivities.count
    }

    if (dataTypes.includes('pageViews')) {
      const deletedPageViews = await prisma.pageView.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      })
      results.pageViews = deletedPageViews.count
    }

    if (dataTypes.includes('searchQueries')) {
      const deletedSearchQueries = await prisma.searchQuery.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      })
      results.searchQueries = deletedSearchQueries.count
    }

    const totalDeleted = Object.values(results).reduce((sum, count) => sum + count, 0)

    console.log(`✅ Analytics cleanup completed:`, results)

    return NextResponse.json({
      success: true,
      message: `Analytics cleanup completed successfully`,
      deleted: results,
      totalDeleted,
      cutoffDate: cutoffDate.toISOString(),
      daysKept: daysToKeep
    })

  } catch (error) {
    console.error('Analytics cleanup error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to cleanup analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
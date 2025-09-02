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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get comprehensive analytics data
    const [
      pageViews,
      userActivities,
      contactSubmissions,
      users,
      properties,
      locations
    ] = await Promise.all([
      prisma.pageView.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userActivity.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.contactSubmission.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.property.findMany({
        include: { location: true }
      }),
      prisma.location.findMany({
        include: {
          _count: { select: { properties: true } }
        }
      })
    ])

    // Process daily metrics
    const dailyMetrics = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayViews = pageViews.filter((view: any) => 
        view.createdAt.toISOString().split('T')[0] === dateStr
      ).length
      
      const dayUsers = users.filter((user: any) => 
        user.createdAt.toISOString().split('T')[0] === dateStr
      ).length
      
      const dayContacts = contactSubmissions.filter((contact: any) => 
        contact.createdAt.toISOString().split('T')[0] === dateStr
      ).length
      
      const dayActivities = userActivities.filter((activity: any) => 
        activity.createdAt.toISOString().split('T')[0] === dateStr
      ).length
      
      dailyMetrics.push({
        date: dateStr,
        views: dayViews,
        users: dayUsers,
        contacts: dayContacts,
        activities: dayActivities
      })
    }

    // Top pages with engagement metrics
    const pageStats = pageViews.reduce((acc: any, view: any) => {
      if (!acc[view.path]) {
        acc[view.path] = { views: 0, uniqueUsers: new Set() }
      }
      acc[view.path].views++
      if (view.userId) acc[view.path].uniqueUsers.add(view.userId)
      if (view.sessionId) acc[view.path].uniqueUsers.add(view.sessionId)
      return acc
    }, {} as Record<string, { views: number; uniqueUsers: Set<string> }>)

    const topPages = Object.entries(pageStats)
      .map(([path, stats]: [string, any]) => ({
        path,
        views: stats.views,
        uniqueUsers: stats.uniqueUsers.size
      }))
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 10)

    // User activity breakdown
    const activityBreakdown = userActivities.reduce((acc: any, activity: any) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Property performance
    const propertyViews = userActivities
      .filter((activity: any) => activity.action === 'PROPERTY_VIEW')
      .reduce((acc: any, activity: any) => {
        if (activity.resource) {
          acc[activity.resource] = (acc[activity.resource] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

    const topProperties = Object.entries(propertyViews)
      .map(([id, views]: [string, any]) => {
        const property = properties.find((p: any) => p.id === id)
        return {
          id,
          title: property?.title || 'Unknown Property',
          location: property?.location?.name || 'Unknown Location',
          views
        }
      })
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 10)

    // Location performance with real data
    const locationViews = userActivities
      .filter((activity: any) => activity.action === 'LOCATION_VIEW')
      .reduce((acc: any, activity: any) => {
        if (activity.resource) {
          acc[activity.resource] = (acc[activity.resource] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

    const locationStats = locations.map((location: any) => ({
      id: location.id,
      name: location.name,
      views: locationViews[location.id] || 0,
      properties: location._count.properties,
      slug: location.slug
    })).sort((a: any, b: any) => b.views - a.views)

    // User journey analysis
    const journeyData = userActivities
      .filter((activity: any) => activity.sessionId)
      .reduce((acc: any, activity: any) => {
        const sessionId = activity.sessionId!
        if (!acc[sessionId]) {
          acc[sessionId] = []
        }
        acc[sessionId].push({
          action: activity.action,
          resource: activity.resource,
          timestamp: activity.createdAt,
          metadata: activity.metadata
        })
        return acc
      }, {} as Record<string, any[]>)

    // Common user paths
    const userPaths = Object.values(journeyData)
      .map((journey: any) => journey.map((step: any) => step.action).join(' → '))
      .reduce((acc: any, path: any) => {
        acc[path] = (acc[path] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const topUserPaths = Object.entries(userPaths)
      .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
      .slice(0, 10)
      .map(([path, count]: [string, any]) => ({ path, count }))

    // Conversion funnel
    const funnelSteps = [
      { step: 'PAGE_VIEW', name: 'Page Views' },
      { step: 'PROPERTY_VIEW', name: 'Property Views' },
      { step: 'PROPERTY_INQUIRY', name: 'Property Inquiries' },
      { step: 'CONTACT_SUBMIT', name: 'Contact Submissions' }
    ]

    const conversionFunnel = funnelSteps.map(({ step, name }: any) => ({
      step: name,
      count: userActivities.filter((activity: any) => activity.action === step).length
    }))

    // Device and browser stats from user agents
    const deviceStats = userActivities
      .filter((activity: any) => activity.userAgent)
      .reduce((acc: any, activity: any) => {
        const userAgent = activity.userAgent!.toLowerCase()
        let device = 'Desktop'
        if (userAgent.includes('mobile')) device = 'Mobile'
        else if (userAgent.includes('tablet') || userAgent.includes('ipad')) device = 'Tablet'
        
        acc[device] = (acc[device] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const deviceStatsArray = Object.entries(deviceStats).map(([device, count]: [string, any]) => ({
      device,
      count
    }))

    // Referrer stats
    const referrerStats = pageViews
      .filter((view: any) => view.referrer && !view.referrer.includes(request.headers.get('host') || ''))
      .reduce((acc: any, view: any) => {
        try {
          const url = new URL(view.referrer!)
          const domain = url.hostname
          acc[domain] = (acc[domain] || 0) + 1
        } catch {
          acc['Direct'] = (acc['Direct'] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

    const referrerStatsArray = Object.entries(referrerStats)
      .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
      .slice(0, 10)
      .map(([source, count]: [string, any]) => ({ source, count }))

    // Real-time metrics (last 24 hours)
    const last24Hours = new Date()
    last24Hours.setHours(last24Hours.getHours() - 24)

    const realtimeMetrics = {
      activeUsers: new Set([
        ...userActivities.filter((a: any) => a.createdAt >= last24Hours).map((a: any) => a.userId || a.sessionId)
      ]).size,
      pageViews: pageViews.filter((v: any) => v.createdAt >= last24Hours).length,
      newContacts: contactSubmissions.filter((c: any) => c.createdAt >= last24Hours).length,
      topPages: pageViews
        .filter((v: any) => v.createdAt >= last24Hours)
        .reduce((acc: any, view: any) => {
          acc[view.path] = (acc[view.path] || 0) + 1
          return acc
        }, {} as Record<string, number>)
    }

    // Engagement metrics
    const engagementMetrics = {
      avgSessionDuration: calculateAvgSessionDuration(userActivities),
      bounceRate: calculateBounceRate(journeyData),
      pagesPerSession: calculatePagesPerSession(journeyData),
      conversionRate: calculateConversionRate(userActivities, contactSubmissions.length)
    }

    return NextResponse.json({
      dailyMetrics,
      topPages,
      activityBreakdown,
      topProperties,
      locationStats,
      topUserPaths,
      conversionFunnel,
      deviceStats: deviceStatsArray,
      referrerStats: referrerStatsArray,
      realtimeMetrics,
      engagementMetrics,
      totalStats: {
        totalViews: pageViews.length,
        totalUsers: users.length,
        totalContacts: contactSubmissions.length,
        totalActivities: userActivities.length
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateAvgSessionDuration(activities: any[]): number {
  const sessions = activities.reduce((acc: any, activity: any) => {
    const sessionId = activity.sessionId || activity.userId
    if (!sessionId) return acc
    
    if (!acc[sessionId]) {
      acc[sessionId] = { start: activity.createdAt, end: activity.createdAt }
    } else {
      if (activity.createdAt < acc[sessionId].start) acc[sessionId].start = activity.createdAt
      if (activity.createdAt > acc[sessionId].end) acc[sessionId].end = activity.createdAt
    }
    return acc
  }, {} as Record<string, { start: Date; end: Date }>)

  const durations = (Object.values(sessions) as { start: Date; end: Date }[]).map((session: any) => 
    (session.end.getTime() - session.start.getTime()) / 1000 / 60 // minutes
  )

  return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
}

function calculateBounceRate(journeyData: Record<string, any[]>): number {
  const sessions = Object.values(journeyData)
  const singlePageSessions = sessions.filter((session: any[]) => session.length === 1).length
  return sessions.length > 0 ? (singlePageSessions / sessions.length) * 100 : 0
}

function calculatePagesPerSession(journeyData: Record<string, any[]>): number {
  const sessions = Object.values(journeyData)
  const totalPages = sessions.reduce((sum: number, session: any[]) => sum + session.length, 0)
  return sessions.length > 0 ? totalPages / sessions.length : 0
}

function calculateConversionRate(activities: any[], totalContacts: number): number {
  const uniqueVisitors = new Set(activities.map((a: any) => a.sessionId || a.userId)).size
  return uniqueVisitors > 0 ? (totalContacts / uniqueVisitors) * 100 : 0
} 
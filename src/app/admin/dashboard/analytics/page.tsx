"use client"

import { useState, useEffect } from "react"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Calendar,
  MapPin,
  Home,
  Activity,
  MousePointer,
  Clock,
  Target,
  Smartphone,
  Monitor,
  Tablet,
  ExternalLink,
  ArrowRight,
  TrendingDown
} from "lucide-react"

interface AnalyticsData {
  dailyMetrics: { date: string; views: number; users: number; contacts: number; activities: number }[]
  topPages: { path: string; views: number; uniqueUsers: number }[]
  activityBreakdown: Record<string, number>
  topProperties: { id: string; title: string; location: string; views: number }[]
  locationStats: { id: string; name: string; views: number; properties: number; slug: string }[]
  topUserPaths: { path: string; count: number }[]
  conversionFunnel: { step: string; count: number }[]
  deviceStats: { device: string; count: number }[]
  referrerStats: { source: string; count: number }[]
  realtimeMetrics: {
    activeUsers: number
    pageViews: number
    newContacts: number
    topPages: Record<string, number>
  }
  engagementMetrics: {
    avgSessionDuration: number
    bounceRate: number
    pagesPerSession: number
    conversionRate: number
  }
  totalStats: {
    totalViews: number
    totalUsers: number
    totalContacts: number
    totalActivities: number
  }
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?days=${dateRange}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights into user behavior and website performance</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Real-time Metrics */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Real-time Activity (Last 24 Hours)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{data?.realtimeMetrics.activeUsers || 0}</div>
            <div className="text-sm opacity-90">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data?.realtimeMetrics.pageViews || 0}</div>
            <div className="text-sm opacity-90">Page Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data?.realtimeMetrics.newContacts || 0}</div>
            <div className="text-sm opacity-90">New Contacts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Object.keys(data?.realtimeMetrics.topPages || {}).length}
            </div>
            <div className="text-sm opacity-90">Active Pages</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.totalStats.totalViews || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.totalStats.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.totalStats.totalContacts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.totalStats.totalActivities || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Session Duration</p>
              <p className="text-xl font-semibold text-gray-900">
                {Math.round(data?.engagementMetrics.avgSessionDuration || 0)}m
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
              <p className="text-xl font-semibold text-gray-900">
                {Math.round(data?.engagementMetrics.bounceRate || 0)}%
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pages/Session</p>
              <p className="text-xl font-semibold text-gray-900">
                {Math.round((data?.engagementMetrics.pagesPerSession || 0) * 10) / 10}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-xl font-semibold text-gray-900">
                {Math.round((data?.engagementMetrics.conversionRate || 0) * 100) / 100}%
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Metrics Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity Trends</h3>
          <div className="h-64 flex items-end space-x-1">
            {data?.dailyMetrics?.map((day, index) => {
              const maxValue = Math.max(...(data.dailyMetrics?.map(d => d.views + d.users + d.contacts) || [1]))
              const totalActivity = day.views + day.users + day.contacts
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full space-y-1">
                    <div 
                      className="bg-blue-500 w-full rounded-t"
                      style={{ 
                        height: `${Math.max((day.views / maxValue) * 180, 2)}px` 
                      }}
                      title={`Views: ${day.views}`}
                    ></div>
                    <div 
                      className="bg-green-500 w-full"
                      style={{ 
                        height: `${Math.max((day.users / maxValue) * 180, 2)}px` 
                      }}
                      title={`Users: ${day.users}`}
                    ></div>
                    <div 
                      className="bg-purple-500 w-full"
                      style={{ 
                        height: `${Math.max((day.contacts / maxValue) * 180, 2)}px` 
                      }}
                      title={`Contacts: ${day.contacts}`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center space-x-4 mt-4 text-sm">
            <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>Views</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-2"></div>Users</div>
            <div className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>Contacts</div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
          <div className="space-y-4">
            {data?.conversionFunnel?.map((step, index) => {
              const maxCount = data.conversionFunnel[0]?.count || 1
              const percentage = (step.count / maxCount) * 100
              return (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{step.step}</span>
                    <span className="text-sm text-gray-500">{step.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {index < (data.conversionFunnel?.length || 0) - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-auto mt-2" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h3>
          <div className="space-y-4">
            {data?.topPages?.slice(0, 8).map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm text-gray-900 truncate">{page.path}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">{page.views} views</div>
                  <div className="text-xs text-gray-500">{page.uniqueUsers} unique</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Journey Paths */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Common User Journeys</h3>
          <div className="space-y-3">
            {data?.topUserPaths?.slice(0, 6).map((path, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 font-medium">{path.count} users</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {path.path.split(' → ').map((step, stepIndex) => (
                    <span key={stepIndex}>
                      {step}
                      {stepIndex < path.path.split(' → ').length - 1 && (
                        <ArrowRight className="w-3 h-3 inline mx-1 text-gray-400" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Properties */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Properties</h3>
          <div className="space-y-4">
            {data?.topProperties?.map((property, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Home className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-900 font-medium">{property.title}</div>
                    <div className="text-xs text-gray-500">{property.location}</div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">{property.views} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location Performance</h3>
          <div className="space-y-4">
            {data?.locationStats?.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{location.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">{location.views} views</div>
                  <div className="text-xs text-gray-500">{location.properties} properties</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Device Usage</h3>
          <div className="space-y-4">
            {data?.deviceStats?.map((device, index) => {
              const total = data.deviceStats?.reduce((sum, d) => sum + d.count, 0) || 1
              const percentage = (device.count / total) * 100
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.device)}
                    <span className="text-sm text-gray-900">{device.device}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Sources</h3>
          <div className="space-y-4">
            {data?.referrerStats?.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{source.source}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">{source.count} visits</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(data?.activityBreakdown || {}).map(([activity, count]) => (
            <div key={activity} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{count}</div>
              <div className="text-xs text-gray-600 mt-1">
                {activity.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
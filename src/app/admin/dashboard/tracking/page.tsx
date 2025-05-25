"use client"

import { useState, useEffect } from "react"
import { 
  Eye, 
  User, 
  Calendar, 
  MapPin, 
  Search,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserActivity {
  id: string
  action: string
  resource: string | null
  metadata: string | null
  ipAddress: string | null
  userAgent: string | null
  referrer: string | null
  createdAt: string
  user: {
    name: string | null
    email: string
  } | null
}

interface PageView {
  id: string
  path: string
  userId: string | null
  ipAddress: string | null
  userAgent: string | null
  referrer: string | null
  createdAt: string
}

export default function UserTracking() {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [pageViews, setPageViews] = useState<PageView[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'activities' | 'pageviews'>('activities')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('7') // days

  useEffect(() => {
    fetchTrackingData()
  }, [dateFilter])

  const fetchTrackingData = async () => {
    setLoading(true)
    try {
      const [activitiesRes, pageViewsRes] = await Promise.all([
        fetch(`/api/admin/tracking/activities?days=${dateFilter}`),
        fetch(`/api/admin/tracking/pageviews?days=${dateFilter}`)
      ])

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json()
        setActivities(activitiesData.activities)
      }

      if (pageViewsRes.ok) {
        const pageViewsData = await pageViewsRes.json()
        setPageViews(pageViewsData.pageViews)
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity =>
    activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.resource?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPageViews = pageViews.filter(view =>
    view.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    view.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getActionColor = (action: string) => {
    switch (action) {
      case 'USER_LOGIN': return 'bg-green-100 text-green-800'
      case 'USER_REGISTER': return 'bg-blue-100 text-blue-800'
      case 'PROPERTY_VIEW': return 'bg-purple-100 text-purple-800'
      case 'PROPERTY_SEARCH': return 'bg-yellow-100 text-yellow-800'
      case 'EMAIL_SUBSCRIBE': return 'bg-pink-100 text-pink-800'
      case 'PROPERTY_INQUIRY': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown'
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Other'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Tracking</h1>
          <p className="text-gray-600">Monitor user activities and page views in real-time</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={fetchTrackingData}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search activities, users, or resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Activities ({filteredActivities.length})
            </button>
            <button
              onClick={() => setActiveTab('pageviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pageviews'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Page Views ({filteredPageViews.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {activeTab === 'activities' && (
                <div className="space-y-4">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(activity.action)}`}>
                                  {activity.action.replace('_', ' ')}
                                </span>
                                {activity.resource && (
                                  <span className="text-sm text-gray-500">
                                    → {activity.resource}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-900">
                                {activity.user ? (
                                  <span className="font-medium">{activity.user.name || activity.user.email}</span>
                                ) : (
                                  <span className="text-gray-500">Anonymous user</span>
                                )}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(activity.createdAt).toLocaleString()}
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {activity.ipAddress || 'Unknown IP'}
                                </span>
                                <span>{formatUserAgent(activity.userAgent)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {activity.metadata && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                              {JSON.stringify(JSON.parse(activity.metadata), null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Eye className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No user activities match your current filters.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pageviews' && (
                <div className="space-y-4">
                  {filteredPageViews.length > 0 ? (
                    filteredPageViews.map((view) => (
                      <div key={view.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{view.path}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(view.createdAt).toLocaleString()}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {view.ipAddress || 'Unknown IP'}
                              </span>
                              <span>{formatUserAgent(view.userAgent)}</span>
                            </div>
                            {view.referrer && (
                              <p className="text-xs text-gray-500 mt-1">
                                Referrer: {view.referrer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Eye className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No page views found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No page views match your current filters.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useState, useEffect } from "react"
import { 
  Users, 
  Home, 
  MapPin, 
  Mail, 
  MessageSquare, 
  TrendingUp, 
  Eye,
  Calendar
} from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalProperties: number
  totalLocations: number
  totalSubscribers: number
  totalInquiries: number
  totalPageViews: number
  recentActivities: any[]
  popularProperties: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
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

  const statCards = [
    {
      name: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "increase"
    },
    {
      name: "Properties",
      value: stats?.totalProperties || 0,
      icon: Home,
      color: "bg-green-500",
      change: "+5%",
      changeType: "increase"
    },
    {
      name: "Locations",
      value: stats?.totalLocations || 0,
      icon: MapPin,
      color: "bg-purple-500",
      change: "+2%",
      changeType: "increase"
    },
    {
      name: "Email Subscribers",
      value: stats?.totalSubscribers || 0,
      icon: Mail,
      color: "bg-yellow-500",
      change: "+18%",
      changeType: "increase"
    },
    {
      name: "Inquiries",
      value: stats?.totalInquiries || 0,
      icon: MessageSquare,
      color: "bg-red-500",
      change: "+8%",
      changeType: "increase"
    },
    {
      name: "Page Views",
      value: stats?.totalPageViews || 0,
      icon: Eye,
      color: "bg-indigo-500",
      change: "+25%",
      changeType: "increase"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard. Here's what's happening with your site.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Popular Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.action.replace('_', ' ').toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>

        {/* Popular Properties */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Popular Properties</h3>
          </div>
          <div className="p-6">
            {stats?.popularProperties && stats.popularProperties.length > 0 ? (
              <div className="space-y-4">
                {stats.popularProperties.slice(0, 5).map((property, index) => (
                  <div key={property.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {property.views} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No property data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Home className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Add Property</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <MapPin className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Add Location</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">View Users</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
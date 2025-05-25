"use client"

import { useState, useEffect } from "react"
import { 
  Settings, 
  Globe, 
  Mail, 
  Search, 
  BarChart3, 
  Shield, 
  Database, 
  Palette, 
  Bell,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface SiteSettings {
  // Site Configuration
  siteName: string
  siteDescription: string
  siteUrl: string
  contactEmail: string
  contactPhone: string
  address: string
  
  // SEO Settings
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  ogImage: string
  
  // Email Settings
  emailFrom: string
  emailHost: string
  emailPort: string
  emailPassword: string
  adminEmail: string
  
  // Analytics Settings
  googleAnalyticsId: string
  facebookPixelId: string
  trackingEnabled: boolean
  
  // Security Settings
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
  maxLoginAttempts: number
  sessionTimeout: number
  
  // Content Settings
  featuredPropertiesLimit: number
  blogPostsPerPage: number
  enableComments: boolean
  moderateComments: boolean
  
  // Notification Settings
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  
  // Theme Settings
  primaryColor: string
  secondaryColor: string
  logoUrl: string
  faviconUrl: string
  
  // Social Media
  facebookUrl: string
  twitterUrl: string
  instagramUrl: string
  linkedinUrl: string
  youtubeUrl: string
}

const defaultSettings: SiteSettings = {
  siteName: "Avacasa",
  siteDescription: "Premium Real Estate Platform for Holiday Homes and Investment Properties",
  siteUrl: "https://avacasa.life",
  contactEmail: "contact@avacasa.life",
  contactPhone: "+91 9876543210",
  address: "Mumbai, Maharashtra, India",
  metaTitle: "Avacasa - Premium Real Estate Platform",
  metaDescription: "Discover premium holiday homes, farmlands, and investment properties. Your trusted partner in real estate investment.",
  metaKeywords: "real estate, holiday homes, farmland, investment properties, Mumbai, Maharashtra",
  ogImage: "/images/og-image.jpg",
  emailFrom: "noreply@avacasa.life",
  emailHost: "smtp.gmail.com",
  emailPort: "587",
  emailPassword: "",
  adminEmail: "admin@avacasa.life",
  googleAnalyticsId: "",
  facebookPixelId: "",
  trackingEnabled: true,
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: true,
  maxLoginAttempts: 5,
  sessionTimeout: 24,
  featuredPropertiesLimit: 6,
  blogPostsPerPage: 9,
  enableComments: true,
  moderateComments: true,
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: false,
  primaryColor: "#1f2937",
  secondaryColor: "#3b82f6",
  logoUrl: "/images/logo.png",
  faviconUrl: "/favicon.ico",
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  youtubeUrl: ""
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [showPasswords, setShowPasswords] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "seo", label: "SEO", icon: Search },
    { id: "email", label: "Email", icon: Mail },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "security", label: "Security", icon: Shield },
    { id: "content", label: "Content", icon: Database },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "theme", label: "Theme", icon: Palette },
    { id: "system", label: "System", icon: Settings },
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data.settings })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      showMessage('error', 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
        credentials: 'include'
      })

      if (response.ok) {
        showMessage('success', 'Settings saved successfully!')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      showMessage('error', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings(defaultSettings)
      showMessage('info', 'Settings reset to default values')
    }
  }

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const updateSetting = (key: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your website configuration and preferences</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={resetSettings}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-gray-900 hover:bg-gray-800"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
          {message.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
          {message.type === 'info' && <Info className="w-5 h-5 mr-2" />}
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Settings Categories</h3>
            </div>
            <nav className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <Input
                      value={settings.siteName}
                      onChange={(e) => updateSetting('siteName', e.target.value)}
                      placeholder="Enter site name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site URL
                    </label>
                    <Input
                      value={settings.siteUrl}
                      onChange={(e) => updateSetting('siteUrl', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Description
                    </label>
                    <Textarea
                      value={settings.siteDescription}
                      onChange={(e) => updateSetting('siteDescription', e.target.value)}
                      placeholder="Brief description of your website"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <Input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => updateSetting('contactEmail', e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <Input
                      value={settings.contactPhone}
                      onChange={(e) => updateSetting('contactPhone', e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Textarea
                      value={settings.address}
                      onChange={(e) => updateSetting('address', e.target.value)}
                      placeholder="Business address"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO Settings */}
            {activeTab === "seo" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">SEO Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <Input
                      value={settings.metaTitle}
                      onChange={(e) => updateSetting('metaTitle', e.target.value)}
                      placeholder="Page title for search engines"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <Textarea
                      value={settings.metaDescription}
                      onChange={(e) => updateSetting('metaDescription', e.target.value)}
                      placeholder="Brief description for search engines"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Keywords
                    </label>
                    <Input
                      value={settings.metaKeywords}
                      onChange={(e) => updateSetting('metaKeywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Open Graph Image URL
                    </label>
                    <Input
                      value={settings.ogImage}
                      onChange={(e) => updateSetting('ogImage', e.target.value)}
                      placeholder="/images/og-image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Image shown when sharing on social media</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === "email" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Email Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <Input
                      type="email"
                      value={settings.emailFrom}
                      onChange={(e) => updateSetting('emailFrom', e.target.value)}
                      placeholder="noreply@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Email
                    </label>
                    <Input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => updateSetting('adminEmail', e.target.value)}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <Input
                      value={settings.emailHost}
                      onChange={(e) => updateSetting('emailHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <Input
                      value={settings.emailPort}
                      onChange={(e) => updateSetting('emailPort', e.target.value)}
                      placeholder="587"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Password / App Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPasswords ? "text" : "password"}
                        value={settings.emailPassword}
                        onChange={(e) => updateSetting('emailPassword', e.target.value)}
                        placeholder="Enter email password or app password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      For Gmail, use App Password instead of regular password
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Settings */}
            {activeTab === "analytics" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Analytics Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Enable Tracking</h4>
                      <p className="text-sm text-gray-500">Allow user activity tracking and analytics</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.trackingEnabled}
                        onChange={(e) => updateSetting('trackingEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Analytics ID
                    </label>
                    <Input
                      value={settings.googleAnalyticsId}
                      onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook Pixel ID
                    </label>
                    <Input
                      value={settings.facebookPixelId}
                      onChange={(e) => updateSetting('facebookPixelId', e.target.value)}
                      placeholder="123456789012345"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                      <p className="text-sm text-gray-500">Show maintenance page to visitors</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Allow User Registration</h4>
                      <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowRegistration}
                        onChange={(e) => updateSetting('allowRegistration', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Require Email Verification</h4>
                      <p className="text-sm text-gray-500">Users must verify email before accessing account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requireEmailVerification}
                        onChange={(e) => updateSetting('requireEmailVerification', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <Input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (hours)
                      </label>
                      <Input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                        min="1"
                        max="168"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Settings */}
            {activeTab === "content" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Content Settings</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Properties Limit
                      </label>
                      <Input
                        type="number"
                        value={settings.featuredPropertiesLimit}
                        onChange={(e) => updateSetting('featuredPropertiesLimit', parseInt(e.target.value))}
                        min="1"
                        max="20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blog Posts Per Page
                      </label>
                      <Input
                        type="number"
                        value={settings.blogPostsPerPage}
                        onChange={(e) => updateSetting('blogPostsPerPage', parseInt(e.target.value))}
                        min="1"
                        max="50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Enable Comments</h4>
                      <p className="text-sm text-gray-500">Allow users to comment on blog posts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableComments}
                        onChange={(e) => updateSetting('enableComments', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Moderate Comments</h4>
                      <p className="text-sm text-gray-500">Require approval before comments are published</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.moderateComments}
                        onChange={(e) => updateSetting('moderateComments', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Send email notifications for important events</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Send SMS notifications for urgent events</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => updateSetting('smsNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Send browser push notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Settings */}
            {activeTab === "theme" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Theme Settings</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="w-16 h-10 p-1 border border-gray-300 rounded"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          placeholder="#1f2937"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          className="w-16 h-10 p-1 border border-gray-300 rounded"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo URL
                      </label>
                      <Input
                        value={settings.logoUrl}
                        onChange={(e) => updateSetting('logoUrl', e.target.value)}
                        placeholder="/images/logo.png"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favicon URL
                      </label>
                      <Input
                        value={settings.faviconUrl}
                        onChange={(e) => updateSetting('faviconUrl', e.target.value)}
                        placeholder="/favicon.ico"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Social Media Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Facebook</label>
                        <Input
                          value={settings.facebookUrl}
                          onChange={(e) => updateSetting('facebookUrl', e.target.value)}
                          placeholder="https://facebook.com/yourpage"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Twitter</label>
                        <Input
                          value={settings.twitterUrl}
                          onChange={(e) => updateSetting('twitterUrl', e.target.value)}
                          placeholder="https://twitter.com/yourhandle"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Instagram</label>
                        <Input
                          value={settings.instagramUrl}
                          onChange={(e) => updateSetting('instagramUrl', e.target.value)}
                          placeholder="https://instagram.com/yourhandle"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn</label>
                        <Input
                          value={settings.linkedinUrl}
                          onChange={(e) => updateSetting('linkedinUrl', e.target.value)}
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">YouTube</label>
                        <Input
                          value={settings.youtubeUrl}
                          onChange={(e) => updateSetting('youtubeUrl', e.target.value)}
                          placeholder="https://youtube.com/yourchannel"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === "system" && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">System Management</h3>
                <div className="space-y-8">
                  
                  {/* Database Management */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-4">Database Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center p-4 h-auto"
                        onClick={async () => {
                          try {
                            showMessage('info', 'Creating database backup...')
                            const response = await fetch('/api/admin/database/backup', {
                              method: 'POST',
                              credentials: 'include'
                            })
                            
                            if (response.ok) {
                              const blob = await response.blob()
                              const url = window.URL.createObjectURL(blob)
                              const a = document.createElement('a')
                              a.href = url
                              a.download = `avacasa-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
                              document.body.appendChild(a)
                              a.click()
                              window.URL.revokeObjectURL(url)
                              document.body.removeChild(a)
                              showMessage('success', 'Database backup downloaded successfully')
                            } else {
                              const error = await response.json()
                              showMessage('error', `Backup failed: ${error.message || 'Unknown error'}`)
                            }
                          } catch (error) {
                            showMessage('error', 'Failed to create database backup')
                          }
                        }}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Backup Database</div>
                          <div className="text-xs text-gray-500">Export all data</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="flex items-center justify-center p-4 h-auto"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = '.json'
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (!file) return
                            
                            try {
                              showMessage('info', 'Restoring database from backup...')
                              const text = await file.text()
                              const backupData = JSON.parse(text)
                              
                              // Validate backup format
                              if (!backupData.metadata || !backupData.data) {
                                showMessage('error', 'Invalid backup file format')
                                return
                              }
                              
                              const confirmed = confirm(
                                `Are you sure you want to restore from this backup?\n\n` +
                                `Backup Date: ${new Date(backupData.metadata.timestamp).toLocaleString()}\n` +
                                `Exported by: ${backupData.metadata.exportedBy}\n` +
                                `Total Records: ${Object.values(backupData.metadata.totalRecords).reduce((a: any, b: any) => a + b, 0)}\n\n` +
                                `This will update existing data. Continue?`
                              )
                              
                              if (!confirmed) return
                              
                              const response = await fetch('/api/admin/database/restore', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                  backupData,
                                  options: {
                                    clearExisting: false,
                                    skipPasswords: true
                                  }
                                })
                              })
                              
                              const result = await response.json()
                              
                              if (response.ok) {
                                showMessage('success', `Database restored successfully! Restored: ${Object.values(result.restored).reduce((a: any, b: any) => a + b, 0)} records`)
                                // Reload settings after restore
                                await loadSettings()
                              } else {
                                showMessage('error', `Restore failed: ${result.message || 'Unknown error'}`)
                              }
                            } catch (error) {
                              showMessage('error', 'Failed to restore database: Invalid file or format')
                            }
                          }
                          input.click()
                        }}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Restore Database</div>
                          <div className="text-xs text-gray-500">Import data backup</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="flex items-center justify-center p-4 h-auto text-red-600 border-red-600 hover:bg-red-50"
                        onClick={async () => {
                          const daysToKeep = prompt('How many days of analytics data would you like to keep? (default: 30)', '30')
                          if (daysToKeep === null) return
                          
                          const days = parseInt(daysToKeep) || 30
                          
                          if (confirm(`Are you sure you want to delete analytics data older than ${days} days? This action cannot be undone.`)) {
                            try {
                              showMessage('info', 'Cleaning up analytics data...')
                              const response = await fetch('/api/admin/database/cleanup', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                  daysToKeep: days,
                                  dataTypes: ['activities', 'pageViews', 'searchQueries']
                                })
                              })
                              
                              const result = await response.json()
                              
                              if (response.ok) {
                                showMessage('success', `Analytics cleanup completed! Deleted ${result.totalDeleted} old records`)
                              } else {
                                showMessage('error', `Cleanup failed: ${result.message || 'Unknown error'}`)
                              }
                            } catch (error) {
                              showMessage('error', 'Failed to cleanup analytics data')
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Clear Analytics</div>
                          <div className="text-xs text-red-500">Remove old data</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* Cache Management */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-4">Cache Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center p-4 h-auto"
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/admin/cache/clear', {
                              method: 'POST',
                              credentials: 'include'
                            })
                            if (response.ok) {
                              showMessage('success', 'Settings cache cleared successfully')
                            } else {
                              showMessage('error', 'Failed to clear cache')
                            }
                          } catch (error) {
                            showMessage('error', 'Failed to clear cache')
                          }
                        }}
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Clear Settings Cache</div>
                          <div className="text-xs text-gray-500">Force reload settings</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="flex items-center justify-center p-4 h-auto"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.location.reload()
                          }
                        }}
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Reload Application</div>
                          <div className="text-xs text-gray-500">Refresh admin panel</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  {/* System Information */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-4">System Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Platform:</span>
                          <span className="ml-2 text-gray-600">Next.js 15.3.2</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Database:</span>
                          <span className="ml-2 text-gray-600">SQLite with Prisma</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Environment:</span>
                          <span className="ml-2 text-gray-600">Development</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Last Updated:</span>
                          <span className="ml-2 text-gray-600">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-4">Quick Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        className="flex items-center justify-center p-4 h-auto"
                        onClick={() => window.open('/api/admin/logs', '_blank')}
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">View System Logs</div>
                          <div className="text-xs text-gray-500">Check application logs</div>
                        </div>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="flex items-center justify-center p-4 h-auto"
                        onClick={() => window.open('http://localhost:5555', '_blank')}
                      >
                        <Database className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-medium">Database Studio</div>
                          <div className="text-xs text-gray-500">Manage database directly</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
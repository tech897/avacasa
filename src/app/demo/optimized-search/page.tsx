"use client"

import { OptimizedSearch } from "@/components/search/optimized-search"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Force dynamic rendering to avoid SSG issues with event handlers
export const dynamic = 'force-dynamic'

export default function OptimizedSearchDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Optimized Search Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our intelligent search with real-time suggestions, property type filtering, 
            and optimized performance with debouncing and caching.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Hero Variant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Hero Variant
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Primary</span>
              </CardTitle>
              <p className="text-gray-600">
                Full-featured search with property type selector, used on the homepage hero section.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <OptimizedSearch 
                variant="hero"
                placeholder="Search destinations, property types, or keywords..."
                showPropertyType={true}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                Features: Property type dropdown, large search button, responsive design
              </div>
            </CardContent>
          </Card>

          {/* Header Variant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Header Variant
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Compact</span>
              </CardTitle>
              <p className="text-gray-600">
                Compact search for navigation headers with minimal footprint.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <OptimizedSearch 
                variant="header"
                placeholder="Search properties..."
                showPropertyType={false}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                Features: Compact design, no property type selector, header-friendly
              </div>
            </CardContent>
          </Card>

          {/* Page Variant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Page Variant
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Standard</span>
              </CardTitle>
              <p className="text-gray-600">
                Standard search for property listing pages and general use.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <OptimizedSearch 
                variant="page"
                placeholder="Search by property type, location, or keyword..."
                showPropertyType={false}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                Features: Standard styling, flexible integration, callback support
              </div>
            </CardContent>
          </Card>

          {/* Custom Callback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Custom Callback
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Advanced</span>
              </CardTitle>
              <p className="text-gray-600">
                Search with custom callback function for advanced integrations.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <OptimizedSearch 
                variant="page"
                placeholder="Try searching for 'Goa' or 'Villa'..."
                showPropertyType={false}
                onSearch={(query, filters) => {
                  alert(`Search: "${query}" with filters: ${JSON.stringify(filters)}`)
                }}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                Features: Custom onSearch callback, programmatic control
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">🚀 Real-time Suggestions</h3>
                <p className="text-gray-600 text-sm">
                  Get instant suggestions from locations, property types, and property titles as you type.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">⚡ Optimized Performance</h3>
                <p className="text-gray-600 text-sm">
                  300ms debouncing, request cancellation, and 5-minute caching for lightning-fast responses.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">🎯 Smart Filtering</h3>
                <p className="text-gray-600 text-sm">
                  Intelligent suggestion ranking with exact matches, starts-with, and type priority.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">⌨️ Keyboard Navigation</h3>
                <p className="text-gray-600 text-sm">
                  Full keyboard support with arrow keys, Enter, and Escape for accessibility.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">📱 Responsive Design</h3>
                <p className="text-gray-600 text-sm">
                  Adapts perfectly to mobile, tablet, and desktop with touch-friendly interactions.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">🔗 Smart Navigation</h3>
                <p className="text-gray-600 text-sm">
                  Automatically navigates to locations, properties, or search results based on selection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Try These Searches:</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Goa</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Villa</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Coorg</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Holiday Home</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Farmland</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Mysore</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Keyboard Shortcuts:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↑↓</kbd> Navigate suggestions</li>
                  <li><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> Select suggestion or search</li>
                  <li><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd> Close suggestions</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Suggestion Types:</h3>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Location</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Property Type</span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Property</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">API Endpoint</h3>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  GET /api/search/suggestions?q=search&limit=8
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Searches across locations, property types, and property titles with intelligent ranking.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Performance Optimizations</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 300ms debouncing to reduce API calls</li>
                  <li>• Request cancellation for outdated queries</li>
                  <li>• 5-minute server-side caching</li>
                  <li>• Automatic cache cleanup</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
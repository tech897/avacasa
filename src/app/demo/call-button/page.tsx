"use client"

import { CallButton } from "@/components/common/call-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Force dynamic rendering to avoid SSG issues with event handlers
export const dynamic = 'force-dynamic'

export default function CallButtonDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Call Button Demo
          </h1>
          <p className="text-xl text-gray-600">
            Test the call button functionality with different variants
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Default Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Default Variant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Standard call button with default styling
              </p>
              <CallButton 
                variant="default"
                size="default"
                showText={true}
              />
            </CardContent>
          </Card>

          {/* Ghost Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Ghost Variant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Subtle call button for headers and navigation
              </p>
              <CallButton 
                variant="ghost"
                size="sm"
                showText={true}
              />
            </CardContent>
          </Card>

          {/* Outline Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Outline Variant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Outlined call button for secondary actions
              </p>
              <CallButton 
                variant="outline"
                size="lg"
                showText={true}
              />
            </CardContent>
          </Card>

          {/* Icon Only */}
          <Card>
            <CardHeader>
              <CardTitle>Icon Only</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Compact call button with icon only
              </p>
              <CallButton 
                variant="default"
                size="sm"
                showText={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">✅ Form Validation</h3>
                <p className="text-gray-600">
                  Validates name (minimum 2 characters) and phone number (exactly 10 digits)
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">💾 Local Storage</h3>
                <p className="text-gray-600">
                  Stores user inquiries in browser localStorage for tracking
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔒 Disabled State</h3>
                <p className="text-gray-600">
                  "Make Call" button is disabled until valid data is entered
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📞 Contact Display</h3>
                <p className="text-gray-600">
                  Shows +91 9977294113 after successful form submission
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Click any of the call buttons above</li>
              <li>Enter your name (minimum 2 characters required)</li>
              <li>Enter a 10-digit phone number</li>
              <li>Notice the "Make Call" button becomes enabled</li>
              <li>Click "Make Call" to submit the form</li>
              <li>See the contact number +91 9977294113 displayed</li>
              <li>Check the admin inquiries page to see stored data</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
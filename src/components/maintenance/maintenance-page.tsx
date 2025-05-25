"use client"

import { Mail, Phone } from 'lucide-react'
import { useSettings } from '@/contexts/settings-context'

export default function MaintenancePage() {
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            We'll be back soon!
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            {settings.siteName} is currently undergoing scheduled maintenance. 
            We're working hard to improve your experience.
          </p>
          
          <p className="text-gray-500">
            Thank you for your patience.
          </p>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 mb-4">
            Need immediate assistance? Contact us:
          </p>
          
          <div className="space-y-3">
            {settings.contactEmail && (
              <div className="flex items-center justify-center text-gray-700">
                <Mail className="w-4 h-4 mr-2" />
                <a 
                  href={`mailto:${settings.contactEmail}`}
                  className="text-sm hover:text-gray-900 transition-colors"
                >
                  {settings.contactEmail}
                </a>
              </div>
            )}
            
            {settings.contactPhone && (
              <div className="flex items-center justify-center text-gray-700">
                <Phone className="w-4 h-4 mr-2" />
                <a 
                  href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}
                  className="text-sm hover:text-gray-900 transition-colors"
                >
                  {settings.contactPhone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            © 2024 {settings.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
} 
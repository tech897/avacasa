"use client"

import Link from 'next/link'
import { Home, ArrowLeft, Search, MapPin, Building2, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-6 shadow-lg">
                <Building2 className="w-16 h-16 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for seems to have moved or doesn't exist.
          </p>
          <p className="text-gray-500">
            Don't worry, let's get you back on track to finding your dream property.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Destinations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/properties"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="bg-blue-100 rounded-lg p-2 mr-3 group-hover:bg-blue-200 transition-colors duration-200">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Properties</div>
                <div className="text-sm text-gray-500">Browse listings</div>
              </div>
            </Link>

            <Link
              href="/locations"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="bg-green-100 rounded-lg p-2 mr-3 group-hover:bg-green-200 transition-colors duration-200">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Locations</div>
                <div className="text-sm text-gray-500">Explore areas</div>
              </div>
            </Link>

            <Link
              href="/blog"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200 group"
            >
              <div className="bg-purple-100 rounded-lg p-2 mr-3 group-hover:bg-purple-200 transition-colors duration-200">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Blog</div>
                <div className="text-sm text-gray-500">Read insights</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center text-blue-800">
            <Search className="w-5 h-5 mr-2" />
            <span className="text-sm">
              Try searching for properties, locations, or browse our blog for real estate insights
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Still can't find what you're looking for?{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 
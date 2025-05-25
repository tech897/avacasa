"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Home, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Force dynamic rendering to avoid SSG issues with event handlers
export const dynamic = 'force-dynamic'

interface Location {
  id: string
  name: string
  slug: string
  description: string
  image: string
  propertyCount: number
  featured: boolean
  highlights: string[]
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Parse highlights from JSON string
          const locationsWithParsedData = result.data.map((location: any) => ({
            ...location,
            highlights: JSON.parse(location.highlights || '[]')
          }))
          setLocations(locationsWithParsedData)
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const featuredLocations = locations.filter(location => location.featured)
  const otherLocations = locations.filter(location => !location.featured)

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 mt-30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Explore Our Locations
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              From pristine beaches to misty mountains, discover premium holiday homes 
              and farmlands across India's most beautiful destinations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 transition-all duration-300" asChild>
                <Link href="/properties">
                  <Home className="w-5 h-5 mr-2" />
                  Browse All Properties
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300" asChild>
                <Link href="/contact">
                  Get Expert Advice
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Locations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our most popular locations with the highest demand and best investment potential.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredLocations.map((location) => (
              <div key={location.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                          <p className="text-sm text-gray-600">{location.propertyCount} Properties</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {location.description}
                  </p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">What makes it special:</h4>
                    <div className="flex flex-wrap gap-2">
                      {location.highlights.slice(0, 3).map((highlight, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {highlight}
                        </span>
                      ))}
                      {location.highlights.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          +{location.highlights.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-gray-900 hover:bg-gray-800 transition-all duration-300" asChild>
                      <Link href={`/locations/${location.slug}`}>
                        <MapPin className="w-4 h-4 mr-2" />
                        Explore {location.name}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Locations */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              More Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover emerging destinations with great potential for holiday homes and farmland investments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherLocations.map((location) => (
              <div key={location.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{location.name}</h3>
                    <span className="text-sm text-gray-500">{location.propertyCount} Properties</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {location.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Button size="sm" variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300" asChild>
                      <Link href={`/locations/${location.slug}`}>
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Can't Find Your Preferred Location?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            We're constantly expanding to new destinations. Let us know where you'd like to invest.
          </p>
          <Button size="lg" variant="outline" className="bg-white text-gray-900 hover:bg-gray-100 border-white transition-all duration-300" asChild>
            <Link href="/contact">
              Contact Our Experts
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
} 
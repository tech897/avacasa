"use client"

import { useState, useEffect } from "react"
import { Hero } from "@/components/home/hero"
import { Benefits } from "@/components/home/benefits"
import { LocationCard } from "@/components/location/location-card"
import { PropertyCard } from "@/components/property/property-card"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/ui/star-rating"
import { HomePageWrapper } from "@/components/home/home-page-wrapper"
import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"
import { PropertyType, PropertyStatus } from "@/types"
import type { Property, Location, Rating } from "@/types"

export default function HomePageContent() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [featuredLocations, setFeaturedLocations] = useState<Location[]>([])
  const [featuredRatings, setFeaturedRatings] = useState<Rating[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(true)
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [ratingsLoading, setRatingsLoading] = useState(true)

  // Fetch featured properties, locations, and ratings from API
  useEffect(() => {
    fetchFeaturedProperties()
    fetchFeaturedLocations()
    fetchFeaturedRatings()
  }, [])

  const fetchFeaturedProperties = async () => {
    try {
      setPropertiesLoading(true)
      const response = await fetch('/api/properties?featured=true&limit=4')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setFeaturedProperties(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching featured properties:', error)
    } finally {
      setPropertiesLoading(false)
    }
  }

  const fetchFeaturedLocations = async () => {
    try {
      setLocationsLoading(true)
      const response = await fetch('/api/locations?featured=true&limit=3')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Parse highlights from JSON string
          const locationsWithParsedData = result.data.map((location: any) => ({
            ...location,
            coordinates: JSON.parse(location.coordinates || '{"lat": 0, "lng": 0}'),
            highlights: JSON.parse(location.highlights || '[]'),
            amenities: JSON.parse(location.amenities || '[]')
          }))
          setFeaturedLocations(locationsWithParsedData)
        }
      }
    } catch (error) {
      console.error('Error fetching featured locations:', error)
    } finally {
      setLocationsLoading(false)
    }
  }

  const fetchFeaturedRatings = async () => {
    try {
      setRatingsLoading(true)
      const response = await fetch('/api/ratings/featured')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setFeaturedRatings(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching featured ratings:', error)
    } finally {
      setRatingsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <HomePageWrapper>
      <Hero />
      
      {/* Featured Locations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Discover Prime Destinations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From serene beaches to misty hills, explore our handpicked locations across India&apos;s most beautiful destinations.
            </p>
          </div>
          
          {locationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-t-lg" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-2/3" />
                    <div className="h-4 bg-gray-200 rounded mb-5" />
                    <div className="flex flex-wrap gap-2 mb-5">
                      <div className="h-6 bg-gray-200 rounded-full w-20" />
                      <div className="h-6 bg-gray-200 rounded-full w-24" />
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredLocations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Featured Locations</h3>
              <p className="text-gray-600 mb-4">
                Featured locations will appear here once they are added by the admin.
              </p>
            </div>
          )}
          
          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/locations">
                View All Locations
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most popular holiday homes and farmlands, carefully selected for their location, amenities, and investment potential.
            </p>
          </div>
          
          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-t-lg" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-2/3" />
                    <div className="h-4 bg-gray-200 rounded mb-5" />
                    <div className="flex gap-4 mb-5">
                      <div className="h-4 bg-gray-200 rounded w-16" />
                      <div className="h-4 bg-gray-200 rounded w-16" />
                      <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 bg-gray-200 rounded flex-1" />
                      <div className="h-10 bg-gray-200 rounded flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">No featured properties available at the moment.</p>
              <Button asChild>
                <Link href="/properties">
                  Browse All Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/properties">
                View All Properties
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Benefits />

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from happy property owners who found their dream vacation homes with Avacasa.
            </p>
          </div>
          
          {ratingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-8 shadow-sm animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="h-5 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-4/5" />
                    <div className="h-4 bg-gray-200 rounded w-3/5" />
                  </div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredRatings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRatings.map((rating) => (
                <div key={rating.id} className="bg-white rounded-xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <StarRating rating={rating.rating} />
                    {rating.verified && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-6 italic">
                    &quot;{rating.review}&quot;
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{rating.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(rating.createdAt)} • {rating.property?.title || 'Property Review'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-4">
                Customer reviews will appear here once they are submitted and approved.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join thousands of satisfied property owners who chose Avacasa for their vacation real estate investments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300" asChild>
              <Link href="/properties">Browse Properties</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/10 transition-all duration-300   hover:text-white 
            " asChild>
              <Link href="/contact">Schedule Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </HomePageWrapper>
  )
} 
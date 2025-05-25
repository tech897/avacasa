"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { PropertyCard } from "@/components/property/property-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MapPin, Home, Map, Grid3X3 } from "lucide-react"
import { PropertyType, PropertyStatus } from "@/types"
import type { Property, PropertyFilters } from "@/types"
import dynamic from "next/dynamic"
import { useTracking } from "@/hooks/use-tracking"
import { OptimizedSearch } from "@/components/search/optimized-search"

// Dynamically import map component to avoid SSR issues
const PropertyMap = dynamic(() => import("@/components/property/property-map"), {
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse rounded-lg" />
})

export default function PropertiesPageContent() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [mapView, setMapView] = useState(false)
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 12
  })
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { trackPageView, trackSearch } = useTracking()

  // Parse URL parameters and set initial filters
  useEffect(() => {
    const urlFilters: PropertyFilters = {
      page: 1,
      limit: 12
    }

    // Handle property type parameter (both 'type' and 'propertyType')
    const typeParam = searchParams.get('type') || searchParams.get('propertyType')
    if (typeParam) {
      // Convert URL-friendly names to PropertyType enum values
      const typeMapping: Record<string, PropertyType> = {
        'villa': PropertyType.VILLA,
        'villas': PropertyType.VILLA,
        'holiday-home': PropertyType.HOLIDAY_HOME,
        'holiday-homes': PropertyType.HOLIDAY_HOME,
        'farmland': PropertyType.FARMLAND,
        'farmlands': PropertyType.FARMLAND,
        'plot': PropertyType.PLOT,
        'plots': PropertyType.PLOT,
        'apartment': PropertyType.APARTMENT,
        'apartments': PropertyType.APARTMENT
      }
      
      const propertyType = typeMapping[typeParam.toLowerCase()]
      if (propertyType) {
        urlFilters.propertyType = propertyType
      }
    }

    // Handle search parameter
    const searchParam = searchParams.get('search')
    if (searchParam) {
      urlFilters.search = searchParam
    }

    // Handle featured parameter
    const featuredParam = searchParams.get('featured')
    if (featuredParam === 'true') {
      urlFilters.featured = true
    } else if (featuredParam === 'false') {
      urlFilters.featured = false
    }

    // Handle location parameter
    const locationParam = searchParams.get('location')
    if (locationParam) {
      urlFilters.search = locationParam
    }

    setFilters(urlFilters)
  }, [searchParams])

  // Track page view on mount
  useEffect(() => {
    trackPageView('/properties')
  }, [trackPageView])

  // Fetch properties from API
  useEffect(() => {
    fetchProperties()
  }, [filters])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams()
      
      if (filters.search) searchParams.append('search', filters.search)
      if (filters.propertyType) searchParams.append('propertyType', filters.propertyType)
      if (filters.featured !== undefined) searchParams.append('featured', filters.featured.toString())
      if (filters.page) searchParams.append('page', filters.page.toString())
      if (filters.limit) searchParams.append('limit', filters.limit.toString())

      const response = await fetch(`/api/properties?${searchParams.toString()}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setProperties(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string, searchFilters?: any) => {
    const newFilters = { 
      ...filters, 
      search: query, 
      propertyType: searchFilters?.propertyType,
      page: 1 
    }
    
    setFilters(newFilters)
    updateURL(newFilters)
    
    // Track search
    trackSearch(query, {
      propertyType: searchFilters?.propertyType,
      source: 'properties_page'
    })
  }

  const handleFilterChange = (newFilters: Partial<PropertyFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    updateURL(updatedFilters)
    
    // Track filter usage
    trackSearch('', {
      ...updatedFilters,
      source: 'filter_change'
    })
  }

  // Helper function to update URL parameters
  const updateURL = (currentFilters: PropertyFilters) => {
    const params = new URLSearchParams()
    
    if (currentFilters.search) {
      params.set('search', currentFilters.search)
    }
    
    if (currentFilters.propertyType) {
      // Convert PropertyType enum back to URL-friendly format
      const typeMapping: Record<PropertyType, string> = {
        [PropertyType.VILLA]: 'villa',
        [PropertyType.HOLIDAY_HOME]: 'holiday-home',
        [PropertyType.FARMLAND]: 'farmland',
        [PropertyType.PLOT]: 'plot',
        [PropertyType.APARTMENT]: 'apartment'
      }
      params.set('type', typeMapping[currentFilters.propertyType])
    }
    
    if (currentFilters.featured !== undefined) {
      params.set('featured', currentFilters.featured.toString())
    }
    
    // Update URL without causing a page reload
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newURL, { scroll: false })
  }

  // Remove client-side filtering since we're now using API filtering
  const filteredProperties = properties

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <div className="bg-gray-50 border-b  top-16 z-40 mt-30">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 max-w-2xl">
              <OptimizedSearch 
                variant="page"
                placeholder="Search by property type, location, or keyword..."
                onSearch={handleSearch}
                showPropertyType={false}
                className="w-full"
              />
            </div>
            <Button 
              type="button"
              variant="outline"
              onClick={() => setMapView(!mapView)}
            >
              {mapView ? (
                <>
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Hide Map
                </>
              ) : (
                <>
                  <Map className="w-4 h-4 mr-2" />
                  Show Map
                </>
              )}
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.featured === undefined && !filters.propertyType ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ featured: undefined, propertyType: undefined })}
            >
              All Properties
            </Button>
            <Button
              variant={filters.featured === true ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ featured: true })}
            >
              Featured
            </Button>
            <Button
              variant={filters.propertyType === PropertyType.VILLA ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ propertyType: PropertyType.VILLA })}
            >
              Villas
            </Button>
            <Button
              variant={filters.propertyType === PropertyType.HOLIDAY_HOME ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ propertyType: PropertyType.HOLIDAY_HOME })}
            >
              Holiday Homes
            </Button>
            <Button
              variant={filters.propertyType === PropertyType.FARMLAND ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ propertyType: PropertyType.FARMLAND })}
            >
              Farmlands
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.search ? `Search Results for "${filters.search}"` : 'All Properties'}
            <span className="text-gray-500 font-normal ml-2">
              ({filteredProperties.length} properties)
            </span>
          </h1>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div className="flex gap-8">
          {/* Properties List */}
          <div className={`${mapView ? 'lg:w-1/2' : 'w-full'} transition-all duration-300`}>
            {loading ? (
              <div className={`grid grid-cols-1 ${mapView ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm h-96 animate-pulse" />
                ))}
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className={`grid grid-cols-1 ${mapView ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse all properties.
                </p>
                <Button onClick={() => {
                  const resetFilters = { page: 1, limit: 12 }
                  setFilters(resetFilters)
                  updateURL(resetFilters)
                }}>
                  View All Properties
                </Button>
              </div>
            )}
          </div>

          {/* Map View */}
          {mapView && (
            <div className="lg:w-1/2">
              <div className="sticky top-24 h-[600px] rounded-lg overflow-hidden shadow-lg">
                <PropertyMap properties={filteredProperties} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
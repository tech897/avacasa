"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Home,
  Map,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { PropertyType } from "@/types";
import type { Property, PropertyFilters } from "@/types";

interface SearchFilters {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  keywords?: string[];
  isNaturalLanguage?: boolean;
}
import dynamic from "next/dynamic";
import { useTracking } from "@/hooks/use-tracking";
import { OptimizedSearch } from "@/components/search/optimized-search";

// Dynamically import map component to avoid SSR issues
const PropertyMap = dynamic(
  () => import("@/components/property/property-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  }
);

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export default function PropertiesPageContent() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 50,
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { trackPageView, trackSearch } = useTracking();

  // Parse URL parameters and set initial filters
  useEffect(() => {
    const urlFilters: PropertyFilters = {
      page: 1,
      limit: 50,
    };

    // Handle property type parameter (both 'type' and 'propertyType')
    const typeParam =
      searchParams.get("type") || searchParams.get("propertyType");
    if (typeParam) {
      // Convert URL-friendly names to PropertyType enum values
      const typeMapping: Record<string, PropertyType> = {
        villa: PropertyType.VILLA,
        villas: PropertyType.VILLA,
        "holiday-home": PropertyType.HOLIDAY_HOME,
        "holiday-homes": PropertyType.HOLIDAY_HOME,
        farmland: PropertyType.FARMLAND,
        farmlands: PropertyType.FARMLAND,
        "managed-farmland": PropertyType.FARMLAND,
        "managed-farmlands": PropertyType.FARMLAND,
        plot: PropertyType.PLOT,
        plots: PropertyType.PLOT,
        "residential-plot": PropertyType.RESIDENTIAL_PLOT,
        "residential-plots": PropertyType.RESIDENTIAL_PLOT,
        apartment: PropertyType.APARTMENT,
        apartments: PropertyType.APARTMENT,
      };

      const propertyType = typeMapping[typeParam.toLowerCase()];
      if (propertyType) {
        urlFilters.propertyType = propertyType;
      }
    }

    // Handle search parameter
    const searchParam = searchParams.get("search");
    if (searchParam) {
      urlFilters.search = searchParam;
    }

    // Handle featured parameter
    const featuredParam = searchParams.get("featured");
    if (featuredParam === "true") {
      urlFilters.featured = true;
    } else if (featuredParam === "false") {
      urlFilters.featured = false;
    }

    // Handle location parameter (for natural language search)
    const locationParam = searchParams.get("location");
    if (locationParam) {
      urlFilters.location = locationParam;
    }

    // Handle bedrooms parameter
    const bedroomsParam = searchParams.get("bedrooms");
    if (bedroomsParam) {
      const bedrooms = parseInt(bedroomsParam);
      if (!isNaN(bedrooms) && bedrooms > 0) {
        urlFilters.bedrooms = bedrooms;
      }
    }

    // Handle price parameters
    const minPriceParam = searchParams.get("minPrice");
    if (minPriceParam) {
      const minPrice = parseFloat(minPriceParam);
      if (!isNaN(minPrice) && minPrice >= 0) {
        urlFilters.minPrice = minPrice;
      }
    }

    const maxPriceParam = searchParams.get("maxPrice");
    if (maxPriceParam) {
      const maxPrice = parseFloat(maxPriceParam);
      if (!isNaN(maxPrice) && maxPrice >= 0) {
        urlFilters.maxPrice = maxPrice;
      }
    }

    // Handle viewType parameter
    const viewTypeParam = searchParams.get("viewType");
    if (viewTypeParam) {
      urlFilters.viewType = viewTypeParam;
    }

    // Handle page parameter
    const pageParam = searchParams.get("page");
    if (pageParam) {
      const page = parseInt(pageParam);
      if (!isNaN(page) && page > 0) {
        urlFilters.page = page;
      }
    }

    console.log(
      "🔍 URL Search Params:",
      Object.fromEntries(searchParams.entries())
    );
    console.log("🎯 Parsed Filters:", urlFilters);
    setFilters(urlFilters);
  }, [searchParams]);

  // Track page view on mount
  useEffect(() => {
    trackPageView("/properties");
  }, [trackPageView]);

  // Fetch properties from API - stable function that uses current filters
  const fetchProperties = useCallback(
    async (currentFilters?: PropertyFilters, bounds?: MapBounds) => {
      setLoading(true);
      try {
        // Use provided filters or get current filters from state ref
        const filtersToUse = currentFilters || filters;
        console.log("🚀 Fetching properties with filters:", filtersToUse);
        const searchParams = new URLSearchParams();

        if (filtersToUse.search)
          searchParams.append("search", filtersToUse.search);
        if (filtersToUse.propertyType)
          searchParams.append("propertyType", filtersToUse.propertyType);
        if (filtersToUse.featured !== undefined)
          searchParams.append("featured", filtersToUse.featured.toString());
        if (filtersToUse.page)
          searchParams.append("page", filtersToUse.page.toString());
        if (filtersToUse.limit)
          searchParams.append("limit", filtersToUse.limit.toString());

        // Add natural language search parameters
        if (filtersToUse.location)
          searchParams.append("location", filtersToUse.location);
        if (filtersToUse.bedrooms)
          searchParams.append("bedrooms", filtersToUse.bedrooms.toString());
        if (filtersToUse.minPrice)
          searchParams.append("minPrice", filtersToUse.minPrice.toString());
        if (filtersToUse.maxPrice)
          searchParams.append("maxPrice", filtersToUse.maxPrice.toString());
        if (filtersToUse.viewType)
          searchParams.append("viewType", filtersToUse.viewType);

        // Only add bounds filtering if bounds are explicitly provided and valid
        if (
          bounds &&
          bounds.north &&
          bounds.south &&
          bounds.east &&
          bounds.west
        ) {
          searchParams.append("bounds", JSON.stringify(bounds));
        }

        const url = `/api/properties?${searchParams.toString()}`;
        console.log("🌐 Fetching from URL:", url);
        
        const response = await fetch(url);
        console.log("📡 Response status:", response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log("✅ API Response:", {
            success: result.success,
            dataCount: result.data?.length || 0,
            total: result.pagination?.total || 0,
            pagination: result.pagination
          });
          if (result.success) {
            setProperties(result.data);
            setPagination(result.pagination);
          }
        } else {
          const errorText = await response.text();
          console.error("❌ Failed to fetch properties:", response.status, errorText);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    },
    [] // Stable function - filters accessed via closure
  );

  // Debounced bounds change handler
  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      setMapBounds(bounds);

      // Clear existing timeout
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current);
      }

      // Set new timeout to update properties after user stops moving map
      boundsUpdateTimeoutRef.current = setTimeout(() => {
        if (mapView) {
          // Trigger property fetch with new bounds
          fetchProperties(filters, bounds);
        }
      }, 500); // 500ms delay
    },
    [mapView, fetchProperties]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Fetch properties when filters change (with a flag to prevent race conditions)
  useEffect(() => {
    console.log("🔄 Filters changed, fetching properties:", filters);
    fetchProperties(); 
  }, [filters]); // Use filters directly instead of fetchProperties to avoid circular updates

  const handleSearch = (query: string, searchFilters?: SearchFilters) => {
    // Convert string propertyType back to PropertyType enum if needed
    let propertyType: PropertyType | undefined = undefined;
    if (searchFilters?.propertyType) {
      const typeMapping: Record<string, PropertyType> = {
        VILLA: PropertyType.VILLA,
        HOLIDAY_HOME: PropertyType.HOLIDAY_HOME,
        FARMLAND: PropertyType.FARMLAND,
        PLOT: PropertyType.PLOT,
        APARTMENT: PropertyType.APARTMENT,
        RESIDENTIAL_PLOT: PropertyType.RESIDENTIAL_PLOT,
      };
      propertyType = typeMapping[searchFilters.propertyType];
    }

    // Create enhanced filters that include natural language parameters
    const newFilters = {
      ...filters,
      search: query,
      propertyType: propertyType,
      location: searchFilters?.location || undefined,
      bedrooms: searchFilters?.bedrooms || undefined,
      minPrice: searchFilters?.minPrice || undefined,
      maxPrice: searchFilters?.maxPrice || undefined,
      page: 1,
    };

    setFilters(newFilters);
    updateURL(newFilters);

    // Track search with additional natural language data
    trackSearch(query, {
      propertyType: propertyType,
      source: "properties_page",
      isNaturalLanguage: searchFilters?.isNaturalLanguage,
      bedrooms: searchFilters?.bedrooms,
      location: searchFilters?.location,
      minPrice: searchFilters?.minPrice,
      maxPrice: searchFilters?.maxPrice,
      keywords: searchFilters?.keywords,
    });
  };

  const handleFilterChange = (newFilters: Partial<PropertyFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset to page 1 on filter change
    setFilters(updatedFilters);
    updateURL(updatedFilters);

    // Track filter usage
    trackSearch("", {
      ...updatedFilters,
      source: "filter_change",
    });
  };

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    updateURL(updatedFilters); // Fix: Update URL with new page number
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);

    // Scroll to property card in list view if map is visible
    if (mapView) {
      const propertyElement = document.getElementById(
        `property-${property.id}`
      );
      if (propertyElement) {
        propertyElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  const handleMapToggle = () => {
    const newMapView = !mapView;
    setMapView(newMapView);

    // If disabling map view, fetch properties without bounds
    if (!newMapView) {
      fetchProperties(); // Use current filters from state
    }
    // If enabling map view, don't filter by bounds until bounds are actually set
    // The onBoundsChange will handle the initial bounds setting
  };

  // Helper function to update URL parameters
  const updateURL = (currentFilters: PropertyFilters) => {
    const params = new URLSearchParams();

    if (currentFilters.search) {
      params.set("search", currentFilters.search);
    }

    if (currentFilters.propertyType) {
      // Convert PropertyType enum back to URL-friendly format
      const typeMapping: Record<PropertyType, string> = {
        [PropertyType.VILLA]: "villa",
        [PropertyType.HOLIDAY_HOME]: "holiday-home",
        [PropertyType.FARMLAND]: "farmland",
        [PropertyType.PLOT]: "plot",
        [PropertyType.APARTMENT]: "apartment",
        [PropertyType.RESIDENTIAL_PLOT]: "residential-plot",
      };
      params.set("type", typeMapping[currentFilters.propertyType]);
    }

    if (currentFilters.featured !== undefined) {
      params.set("featured", currentFilters.featured.toString());
    }

    // Add natural language search parameters to URL
    if (currentFilters.location) {
      params.set("location", currentFilters.location);
    }

    if (currentFilters.bedrooms) {
      params.set("bedrooms", currentFilters.bedrooms.toString());
    }

    if (currentFilters.minPrice) {
      params.set("minPrice", currentFilters.minPrice.toString());
    }

    if (currentFilters.maxPrice) {
      params.set("maxPrice", currentFilters.maxPrice.toString());
    }

    if (currentFilters.viewType) {
      params.set("viewType", currentFilters.viewType);
    }

    // Add page parameter to URL (only if not page 1)
    if (currentFilters.page && currentFilters.page > 1) {
      params.set("page", currentFilters.page.toString());
    }

    // Update URL without causing a page reload
    const newURL = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newURL, { scroll: false });
  };

  // Memoized grid configuration based on map view
  const gridCols = useMemo(() => {
    return mapView
      ? "md:grid-cols-1 lg:grid-cols-2"
      : "md:grid-cols-2 lg:grid-cols-3";
  }, [mapView]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 border-b top-16 z-40 mt-30">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 max-w-2xl">
              <OptimizedSearch
                variant="page"
                placeholder="Try: '2bhk holiday home in goa under 2cr' or search by type, location..."
                onSearch={handleSearch}
                showPropertyType={false}
                enableNaturalLanguage={true}
                showParsedQuery={true}
                className="w-full"
              />
            </div>
            <Button type="button" variant="outline" onClick={handleMapToggle}>
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
            {mapView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchProperties(filters, mapBounds || undefined)}
                disabled={loading}
                title="Refresh properties in current map area"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={
                filters.featured === undefined && !filters.propertyType
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                handleFilterChange({
                  featured: undefined,
                  propertyType: undefined,
                })
              }
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
              variant={
                filters.propertyType === PropertyType.VILLA
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                handleFilterChange({ propertyType: PropertyType.VILLA })
              }
            >
              Villas
            </Button>
            <Button
              variant={
                filters.propertyType === PropertyType.HOLIDAY_HOME
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                handleFilterChange({ propertyType: PropertyType.HOLIDAY_HOME })
              }
            >
              Holiday Homes
            </Button>
            <Button
              variant={
                filters.propertyType === PropertyType.FARMLAND
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                handleFilterChange({ propertyType: PropertyType.FARMLAND })
              }
            >
              Managed Farmlands
            </Button>
            <Button
              variant={
                filters.propertyType === PropertyType.PLOT
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                handleFilterChange({ propertyType: PropertyType.PLOT })
              }
            >
              Plots
            </Button>
            <Button
              variant={
                filters.propertyType === PropertyType.APARTMENT
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                handleFilterChange({ propertyType: PropertyType.APARTMENT })
              }
            >
              Apartments
            </Button>
            <Button
              variant={
                filters.propertyType === PropertyType.RESIDENTIAL_PLOT
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() =>
                handleFilterChange({
                  propertyType: PropertyType.RESIDENTIAL_PLOT,
                })
              }
            >
              Residential Plots
            </Button>
          </div>

          {/* Map view indicator */}
          {mapView && mapBounds && (
            <div className="mt-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Showing properties in the current map area
              {pagination?.total && (
                <span className="ml-2 font-medium">
                  ({pagination.total} properties found)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {filters.search
              ? `Search Results for "${filters.search}"`
              : "All Properties"}
            <span className="text-gray-500 font-normal ml-2">
              ({pagination?.total || properties.length} properties)
            </span>
          </h1>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div
          className={`flex ${
            mapView ? "gap-8" : ""
          } transition-all duration-300`}
        >
          {/* Properties List */}
          <div
            className={`${
              mapView ? "lg:w-1/2" : "w-full"
            } transition-all duration-300`}
          >
            {loading ? (
              <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm h-96 animate-pulse"
                  />
                ))}
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      id={`property-${property.id}`}
                      className={`transition-all duration-200 ${
                        selectedProperty?.id === property.id
                          ? "ring-2 ring-blue-500 ring-opacity-50 transform scale-[1.02]"
                          : ""
                      }`}
                      onClick={() => handlePropertySelect(property)}
                    >
                      <PropertyCard
                        property={property}
                        isSelected={selectedProperty?.id === property.id}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center items-center mt-12 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex gap-1">
                      {[...Array(pagination.pages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === pagination.pages ||
                          (page >= filters.page - 1 && page <= filters.page + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={
                                page === filters.page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          );
                        } else if (
                          page === filters.page - 2 ||
                          page === filters.page + 2
                        ) {
                          return (
                            <span key={page} className="px-2">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === pagination.pages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Pagination Info */}
                {pagination && (
                  <div className="text-center mt-4 text-sm text-gray-600">
                    Showing {(filters.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      filters.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} properties
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-4">
                  {mapView
                    ? "Try zooming out or moving the map to see more properties."
                    : "Try adjusting your search criteria or browse all properties."}
                </p>
                <Button
                  onClick={() => {
                    const resetFilters = { page: 1, limit: 50 };
                    setFilters(resetFilters);
                    updateURL(resetFilters);
                    setSelectedProperty(null);
                    setMapBounds(null);
                  }}
                >
                  View All Properties
                </Button>
              </div>
            )}
          </div>

          {/* Map View */}
          {mapView && (
            <div className="lg:w-1/2">
              <div className="sticky top-24 h-[600px] rounded-lg overflow-hidden shadow-lg">
                <PropertyMap
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onPropertySelect={handlePropertySelect}
                  onBoundsChange={handleBoundsChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

//zoom out for perticular level
//search to location
// lat long for all properties for search function

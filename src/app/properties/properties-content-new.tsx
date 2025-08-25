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

interface SearchFilters {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  keywords?: string[];
  isNaturalLanguage?: boolean;
}

export default function PropertiesPageContent() {
  // Core state
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  // Navigation and tracking
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { trackPageView, trackSearch } = useTracking();

  // Refs for cleanup
  const boundsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // STEP 1: Parse URL parameters into a stable filters object
  const currentFilters = useMemo(() => {
    const filters: PropertyFilters = {
      page: 1,
      limit: 50,
    };

    // Parse all parameters
    const search = searchParams.get("search");
    if (search) filters.search = search;

    const location = searchParams.get("location");
    if (location) filters.location = location;

    const viewType = searchParams.get("viewType");
    if (viewType) filters.viewType = viewType;

    const featured = searchParams.get("featured");
    if (featured === "true") filters.featured = true;
    else if (featured === "false") filters.featured = false;

    const propertyTypeParam =
      searchParams.get("type") || searchParams.get("propertyType");
    if (propertyTypeParam) {
      const typeMapping: Record<string, PropertyType> = {
        villa: PropertyType.VILLA,
        villas: PropertyType.VILLA,
        "holiday-home": PropertyType.HOLIDAY_HOME,
        "holiday-homes": PropertyType.HOLIDAY_HOME,
        farmland: PropertyType.FARMLAND,
        farmlands: PropertyType.FARMLAND,
        plot: PropertyType.PLOT,
        plots: PropertyType.PLOT,
        apartment: PropertyType.APARTMENT,
        apartments: PropertyType.APARTMENT,
        "residential-plot": PropertyType.RESIDENTIAL_PLOT,
        "residential-plots": PropertyType.RESIDENTIAL_PLOT,
      };
      const mappedType = typeMapping[propertyTypeParam.toLowerCase()];
      if (mappedType) filters.propertyType = mappedType;
    }

    const bedrooms = searchParams.get("bedrooms");
    if (bedrooms) {
      const bedroomsNum = parseInt(bedrooms);
      if (!isNaN(bedroomsNum) && bedroomsNum > 0) {
        filters.bedrooms = bedroomsNum;
      }
    }

    const minPrice = searchParams.get("minPrice");
    if (minPrice) {
      const minPriceNum = parseFloat(minPrice);
      if (!isNaN(minPriceNum) && minPriceNum >= 0) {
        filters.minPrice = minPriceNum;
      }
    }

    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice);
      if (!isNaN(maxPriceNum) && maxPriceNum >= 0) {
        filters.maxPrice = maxPriceNum;
      }
    }

    const page = searchParams.get("page");
    if (page) {
      const pageNum = parseInt(page);
      if (!isNaN(pageNum) && pageNum > 0) {
        filters.page = pageNum;
      }
    }

    console.log("🎯 Current filters from URL:", filters);
    return filters;
  }, [searchParams]);

  // STEP 2: Fetch properties whenever currentFilters change
  const fetchProperties = useCallback(
    async (filters: PropertyFilters, bounds?: MapBounds) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      console.log("🚀 Fetching properties with filters:", filters);
      setLoading(true);

      try {
        const params = new URLSearchParams();

        // Add all filter parameters
        if (filters.search) params.append("search", filters.search);
        if (filters.location) params.append("location", filters.location);
        if (filters.viewType) params.append("viewType", filters.viewType);
        if (filters.propertyType)
          params.append("propertyType", filters.propertyType);
        if (filters.featured !== undefined)
          params.append("featured", filters.featured.toString());
        if (filters.bedrooms)
          params.append("bedrooms", filters.bedrooms.toString());
        if (filters.minPrice)
          params.append("minPrice", filters.minPrice.toString());
        if (filters.maxPrice)
          params.append("maxPrice", filters.maxPrice.toString());
        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());

        // Add bounds if provided
        if (bounds) {
          params.append("bounds", JSON.stringify(bounds));
        }

        const url = `/api/properties?${params.toString()}`;
        console.log("📡 API URL:", url);

        const response = await fetch(url, { signal });

        if (signal.aborted) return;

        if (response.ok) {
          const result = await response.json();
          console.log("✅ API Response:", {
            success: result.success,
            dataCount: result.data?.length || 0,
            total: result.pagination?.total || 0,
            filters: filters,
          });

          if (result.success && !signal.aborted) {
            setProperties(result.data);
            setPagination(result.pagination);
          }
        } else {
          console.error("❌ API request failed:", response.status);
          if (!signal.aborted) {
            setProperties([]);
            setPagination(null);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("❌ Fetch error:", error);
          setProperties([]);
          setPagination(null);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  // STEP 3: Fetch properties when filters change
  useEffect(() => {
    fetchProperties(currentFilters);
  }, [currentFilters, fetchProperties]);

  // STEP 4: Update URL when filters change programmatically
  const updateURL = useCallback(
    (newFilters: PropertyFilters) => {
      const params = new URLSearchParams();

      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.location) params.set("location", newFilters.location);
      if (newFilters.viewType) params.set("viewType", newFilters.viewType);
      if (newFilters.propertyType) {
        const typeMapping: Record<PropertyType, string> = {
          [PropertyType.VILLA]: "villa",
          [PropertyType.HOLIDAY_HOME]: "holiday-home",
          [PropertyType.FARMLAND]: "farmland",
          [PropertyType.PLOT]: "plot",
          [PropertyType.APARTMENT]: "apartment",
          [PropertyType.RESIDENTIAL_PLOT]: "residential-plot",
        };
        params.set("type", typeMapping[newFilters.propertyType]);
      }
      if (newFilters.featured !== undefined)
        params.set("featured", newFilters.featured.toString());
      if (newFilters.bedrooms)
        params.set("bedrooms", newFilters.bedrooms.toString());
      if (newFilters.minPrice)
        params.set("minPrice", newFilters.minPrice.toString());
      if (newFilters.maxPrice)
        params.set("maxPrice", newFilters.maxPrice.toString());
      if (newFilters.page && newFilters.page > 1)
        params.set("page", newFilters.page.toString());

      const newURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newURL, { scroll: false });
    },
    [pathname, router]
  );

  // Search handler
  const handleSearch = useCallback(
    (query: string, searchFilters?: SearchFilters) => {
      console.log("🔍 Search triggered:", query, searchFilters);

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

      const newFilters: PropertyFilters = {
        ...currentFilters,
        search: query || undefined,
        propertyType: propertyType || currentFilters.propertyType,
        location: searchFilters?.location || currentFilters.location,
        bedrooms: searchFilters?.bedrooms || currentFilters.bedrooms,
        minPrice: searchFilters?.minPrice || currentFilters.minPrice,
        maxPrice: searchFilters?.maxPrice || currentFilters.maxPrice,
        page: 1, // Reset to first page on new search
        // ALWAYS preserve viewType
        viewType: currentFilters.viewType,
      };

      console.log("🎯 New filters after search:", newFilters);
      updateURL(newFilters);

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
    },
    [currentFilters, updateURL, trackSearch]
  );

  // Filter change handler
  const handleFilterChange = useCallback(
    (filterUpdates: Partial<PropertyFilters>) => {
      const newFilters = {
        ...currentFilters,
        ...filterUpdates,
        page: 1,
        // ALWAYS preserve viewType unless explicitly changed
        viewType:
          filterUpdates.viewType !== undefined
            ? filterUpdates.viewType
            : currentFilters.viewType,
      };
      updateURL(newFilters);

      trackSearch("", {
        ...newFilters,
        source: "filter_change",
      });
    },
    [currentFilters, updateURL, trackSearch]
  );

  // Page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      const newFilters = {
        ...currentFilters,
        page,
        // ALWAYS preserve viewType
        viewType: currentFilters.viewType,
      };
      updateURL(newFilters);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentFilters, updateURL]
  );

  // Map bounds change handler
  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      setMapBounds(bounds);

      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current);
      }

      boundsUpdateTimeoutRef.current = setTimeout(() => {
        if (mapView) {
          fetchProperties(currentFilters, bounds);
        }
      }, 500);
    },
    [mapView, currentFilters, fetchProperties]
  );

  // Property selection handler
  const handlePropertySelect = useCallback(
    (property: Property) => {
      setSelectedProperty(property);

      if (mapView) {
        // Scroll to property on map if needed
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
    },
    [mapView]
  );

  // Track page view
  useEffect(() => {
    trackPageView("/properties");
  }, [trackPageView]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (boundsUpdateTimeoutRef.current) {
        clearTimeout(boundsUpdateTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Grid configuration
  const gridCols = useMemo(() => {
    return mapView
      ? "md:grid-cols-1 lg:grid-cols-2"
      : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  }, [mapView]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                All Properties
              </h1>
              <p className="text-gray-600 mt-1">
                Discover your perfect property from our curated collection
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <Button
                variant={mapView ? "default" : "ghost"}
                size="sm"
                onClick={() => setMapView(true)}
                className="flex items-center gap-2"
              >
                <Map className="h-4 w-4" />
                Map View
              </Button>
              <Button
                variant={!mapView ? "default" : "ghost"}
                size="sm"
                onClick={() => setMapView(false)}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                Grid View
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <OptimizedSearch
            onSearch={handleSearch}
            placeholder="Search properties by name, location, type..."
            className="max-w-4xl"
          />
        </div>

        {/* Current Filters Display */}
        {currentFilters.viewType && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-800 font-medium">
                  Filtered by view type:
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  {currentFilters.viewType}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange({ viewType: undefined })}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear Filter
              </Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>
              Showing properties in the current map area (
              {pagination?.total || 0} properties found)
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${mapView ? "lg:grid lg:grid-cols-2 lg:gap-8" : ""}`}>
          {/* Properties Grid */}
          <div className={`${mapView ? "order-2 lg:order-1" : ""}`}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                All Properties ({pagination?.total || 0} properties)
              </h2>

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

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(pagination.pages, 5))].map(
                          (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  pagination.page === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No properties found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => updateURL({ page: 1, limit: 50 })}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          {mapView && (
            <div className="order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="sticky top-24">
                <div className="h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
                  <PropertyMap
                    properties={properties}
                    selectedProperty={selectedProperty}
                    onPropertySelect={handlePropertySelect}
                    onBoundsChange={handleBoundsChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

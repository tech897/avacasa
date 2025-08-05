"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Search,
  Filter,
  Star,
  Users,
  Calendar,
  Map,
  Grid3X3,
} from "lucide-react";
import { PropertyType } from "@/types";
import type { Property, Location } from "@/types";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(
  () => import("@/components/property/property-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 animate-pulse rounded-lg" />
    ),
  }
);

interface LocationWithStats extends Location {
  avgRating: number;
  properties: Property[];
}

export default function LocationPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [location, setLocation] = useState<LocationWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapView, setMapView] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: undefined as PropertyType | undefined,
    priceRange: "all",
    sortBy: "featured",
  });

  useEffect(() => {
    if (!slug) return;

    fetchLocationData();
  }, [slug]);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/locations/${slug}`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error(result.error || "Failed to fetch location");
      }

      if (result.success) {
        setLocation(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch location");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load location"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-96 bg-gray-200" />
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3" />
          <div className="h-4 bg-gray-200 rounded mb-8 w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm">
                <div className="aspect-[4/3] bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Location
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchLocationData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!location) {
    notFound();
  }

  const filteredProperties = location.properties.filter((property) => {
    if (filters.propertyType && property.propertyType !== filters.propertyType)
      return false;
    return true;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (filters.sortBy) {
      case "featured":
        return b.featured ? 1 : -1;
      case "price_low":
        return a.price - b.price;
      case "price_high":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <Image
          src={location.image}
          alt={location.name}
          fill
          className="object-cover"
          priority
        />
        {/* Improved gradient overlay - lighter at top, darker at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* Text positioned to show more of the image */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <div className="max-w-3xl text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {location.name}
              </h1>
              {/* Truncated description for better image visibility */}
              <p className="text-base md:text-lg opacity-95 mb-4 line-clamp-2 leading-relaxed">
                {location.description}
              </p>
              <div className="flex items-center gap-4 md:gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{location.propertyCount} Properties</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{location.avgRating} Avg Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Year-round Destination</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Highlights */}
      {location.highlights && location.highlights.length > 0 && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">
              What makes {location.name} special
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {location.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Properties */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Property Type Filter */}
              <select
                value={filters.propertyType || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    propertyType: (e.target.value as PropertyType) || undefined,
                  }))
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                title="Filter by property type"
              >
                <option value="">All Types</option>
                <option value={PropertyType.VILLA}>Villas</option>
                <option value={PropertyType.HOLIDAY_HOME}>Holiday Homes</option>
                <option value={PropertyType.FARMLAND}>Managed Farmlands</option>
                <option value={PropertyType.PLOT}>Plots</option>
                <option value={PropertyType.APARTMENT}>Apartments</option>
                <option value={PropertyType.RESIDENTIAL_PLOT}>
                  Residential Plots
                </option>
              </select>

              {/* Sort Filter */}
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                title="Sort properties by"
              >
                <option value="featured">Featured First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {sortedProperties.length} properties found
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMapView(!mapView)}
              >
                {mapView ? (
                  <>
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    List View
                  </>
                ) : (
                  <>
                    <Map className="w-4 h-4 mr-2" />
                    Map View
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Properties List */}
          <div
            className={`${
              mapView ? "lg:w-1/2" : "w-full"
            } transition-all duration-300`}
          >
            <div
              className={`grid grid-cols-1 ${
                mapView
                  ? "md:grid-cols-1 lg:grid-cols-2"
                  : "md:grid-cols-2 lg:grid-cols-3"
              } gap-6`}
            >
              {sortedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {sortedProperties.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No Properties Found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn&apos;t find any properties matching your criteria in{" "}
                  {location.name}.
                </p>
                <Button
                  onClick={() =>
                    setFilters({
                      propertyType: undefined,
                      priceRange: "all",
                      sortBy: "featured",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {/* Map View */}
          {mapView && (
            <div className="lg:w-1/2">
              <div className="sticky top-24 h-[600px] rounded-lg overflow-hidden shadow-lg">
                <PropertyMap properties={sortedProperties} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Home,
  ArrowRight,
  ArrowLeft,
  Star,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import type { Property } from "@/types";

interface Location {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  coordinates: { lat: number; lng: number } | null;
  highlights: string[];
  amenities: Array<{ name: string; icon: string }>;
  propertyCount: number;
  featured: boolean;
}

export default function LocationDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [location, setLocation] = useState<Location | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (slug) {
      fetchLocation();
      fetchProperties();
    }
  }, [slug]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/locations/${slug}`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLocation(result.data);
        } else {
          setError("Location not found");
        }
      } else {
        setError("Failed to load location");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setError("An error occurred while loading the location");
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setPropertiesLoading(true);
      // Use the location slug to filter properties
      const response = await fetch(`/api/properties?location=${slug}&limit=50`);

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProperties(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setPropertiesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Location Not Found"}
          </h1>
          <p className="text-gray-600 mb-8">
            The location you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Button asChild>
            <Link href="/locations">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Locations
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <Image
          src={location.image}
          alt={location.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="mb-4">
                <Link
                  href="/locations"
                  className="inline-flex items-center text-white/80 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Locations
                </Link>
              </div>
              {location.featured && (
                <div className="mb-4">
                  <span className="inline-flex items-center bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 mr-1" />
                    Featured Destination
                  </span>
                </div>
              )}
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {location.name}
              </h1>
              <p className="text-xl text-white/90 mb-8">
                {location.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-white font-semibold">
                    {properties.length} Properties Available
                  </span>
                </div>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
                  asChild
                >
                  <Link href="/contact">
                    Get Expert Advice
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header with view toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Properties in {location.name}
                </h2>
                <p className="text-gray-600">
                  {properties.length} properties available • From luxury homes
                  to profitable farmland
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Location highlights */}
            {location.highlights && location.highlights.length > 0 && (
              <div className="mb-8 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Why {location.name}?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {location.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                      <span className="text-gray-700 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Properties Grid/List */}
            {propertiesLoading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm h-96 animate-pulse"
                  />
                ))}
              </div>
            ) : properties.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Home className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Properties Found
                </h3>
                <p className="text-gray-600 mb-6">
                  We don't have any properties listed in {location.name} yet.
                </p>
                <Button asChild>
                  <Link href="/contact">
                    Contact Us for Custom Search
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Map Section (if coordinates available) */}
      {location.coordinates && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Location
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {location.name} is strategically located for easy access and
                beautiful surroundings.
              </p>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-center text-gray-500">
                  <MapPin className="w-8 h-8 mr-3" />
                  <div>
                    <p className="text-sm">Coordinates</p>
                    <p className="font-medium">
                      {location.coordinates.lat.toFixed(4)},{" "}
                      {location.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Invest in {location.name}?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Connect with our experts to explore the best investment
            opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 transition-all duration-300"
              asChild
            >
              <Link href={`/properties?location=${location.slug}`}>
                View Properties
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300"
              asChild
            >
              <Link href="/contact">Contact Expert</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

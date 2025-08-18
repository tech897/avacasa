"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyImage } from "@/components/ui/optimized-image";
import {
  Heart,
  Share2,
  TrendingUp,
  MapPin,
  Bed,
  Bath,
  Square,
  Star,
  Eye,
  Calendar,
  ArrowRight,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Property } from "@/types";

interface RelatedPropertiesProps {
  currentProperty: Property;
  className?: string;
}

interface RelatedProperty extends Property {
  similarityScore: number;
  similarityReasons: string[];
  priceComparison: "lower" | "similar" | "higher";
  viewsThisWeek: number;
}

// Mock related properties data - In real app, this would come from recommendation API
const generateMockRelatedProperties = (
  currentProperty: Property
): RelatedProperty[] => {
  const baseProperties = [
    {
      id: "rel-1",
      title: "Serene Valley Villa",
      slug: "serene-valley-villa-goa",
      description:
        "Luxury 3BHK villa with private pool and garden in peaceful North Goa location. Perfect for families and investors.",
      price: 28500000,
      locationId: currentProperty.locationId,
      propertyType: currentProperty.propertyType,
      bedrooms: 3,
      bathrooms: 3,
      area: 1850,
      floors: 2,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      ],
      amenities: currentProperty.amenities || [],
      features: currentProperty.features || [],
      location: currentProperty.location,
      coordinates: { lat: 15.5937, lng: 73.746 },
      status: currentProperty.status,
      views: 234,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      similarityScore: 95,
      similarityReasons: [
        "Same location",
        "Similar size",
        "Same property type",
      ],
      priceComparison: "similar" as const,
      viewsThisWeek: 87,
    },
    {
      id: "rel-2",
      title: "Emerald Heights Farmhouse",
      slug: "emerald-heights-farmhouse-goa",
      description:
        "Stunning farmhouse with organic gardens and modern amenities. Great investment opportunity with high rental potential.",
      price: 32000000,
      locationId: currentProperty.locationId,
      propertyType: currentProperty.propertyType,
      bedrooms: 4,
      bathrooms: 4,
      area: 2200,
      floors: 2,
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      ],
      amenities: currentProperty.amenities || [],
      features: currentProperty.features || [],
      location: currentProperty.location,
      coordinates: { lat: 15.58, lng: 73.73 },
      status: currentProperty.status,
      views: 156,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      similarityScore: 88,
      similarityReasons: [
        "Same location",
        "Similar investment potential",
        "Premium amenities",
      ],
      priceComparison: "higher" as const,
      viewsThisWeek: 64,
    },
    {
      id: "rel-3",
      title: "Coastal Paradise Villa",
      slug: "coastal-paradise-villa-goa",
      description:
        "Beautiful beachside villa with panoramic ocean views. Perfect for holiday rentals and personal use.",
      price: 24500000,
      locationId: currentProperty.locationId,
      propertyType: currentProperty.propertyType,
      bedrooms: 2,
      bathrooms: 2,
      area: 1450,
      floors: 2,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
      ],
      amenities: currentProperty.amenities || [],
      features: currentProperty.features || [],
      location: { ...currentProperty.location, name: "Anjuna, Goa" },
      coordinates: { lat: 15.5732, lng: 73.7367 },
      status: currentProperty.status,
      views: 189,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      similarityScore: 82,
      similarityReasons: [
        "Similar price range",
        "Beach proximity",
        "Investment grade",
      ],
      priceComparison: "lower" as const,
      viewsThisWeek: 122,
    },
    {
      id: "rel-4",
      title: "Garden Retreat Bungalow",
      slug: "garden-retreat-bungalow-goa",
      description:
        "Charming bungalow surrounded by lush gardens. Ideal for those seeking tranquility and nature.",
      price: 21000000,
      locationId: currentProperty.locationId,
      propertyType: currentProperty.propertyType,
      bedrooms: 2,
      bathrooms: 2,
      area: 1320,
      floors: 1,
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
      ],
      amenities: currentProperty.amenities || [],
      features: currentProperty.features || [],
      location: currentProperty.location,
      coordinates: { lat: 15.585, lng: 73.752 },
      status: currentProperty.status,
      views: 145,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      similarityScore: 79,
      similarityReasons: [
        "Same area",
        "Similar lifestyle",
        "Good ROI potential",
      ],
      priceComparison: "lower" as const,
      viewsThisWeek: 43,
    },
    {
      id: "rel-5",
      title: "Luxury Riverside Estate",
      slug: "luxury-riverside-estate-goa",
      description:
        "Premium estate with river views and luxury amenities. Perfect for high-end investment and lifestyle.",
      price: 45000000,
      locationId: currentProperty.locationId,
      propertyType: currentProperty.propertyType,
      bedrooms: 5,
      bathrooms: 5,
      area: 3200,
      floors: 3,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
      ],
      amenities: currentProperty.amenities || [],
      features: currentProperty.features || [],
      location: { ...currentProperty.location, name: "Mandrem, Goa" },
      coordinates: { lat: 15.6167, lng: 73.7333 },
      status: currentProperty.status,
      views: 278,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      similarityScore: 75,
      similarityReasons: [
        "Luxury segment",
        "High appreciation",
        "Premium location",
      ],
      priceComparison: "higher" as const,
      viewsThisWeek: 95,
    },
    {
      id: "rel-6",
      title: "Modern Townhouse Complex",
      slug: "modern-townhouse-complex-goa",
      description:
        "Contemporary townhouse in gated community with shared amenities and professional management.",
      price: 18500000,
      locationId: currentProperty.locationId,
      propertyType: currentProperty.propertyType,
      bedrooms: 3,
      bathrooms: 2,
      area: 1650,
      floors: 2,
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      ],
      amenities: currentProperty.amenities || [],
      features: currentProperty.features || [],
      location: { ...currentProperty.location, name: "Reis Magos, Goa" },
      coordinates: { lat: 15.5983, lng: 73.8217 },
      status: currentProperty.status,
      views: 98,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      similarityScore: 71,
      similarityReasons: [
        "Managed community",
        "Modern amenities",
        "Good connectivity",
      ],
      priceComparison: "lower" as const,
      viewsThisWeek: 58,
    },
  ];

  return baseProperties.sort((a, b) => b.similarityScore - a.similarityScore);
};

export function RelatedProperties({
  currentProperty,
  className = "",
}: RelatedPropertiesProps) {
  const [relatedProperties, setRelatedProperties] = useState<RelatedProperty[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [filterBy, setFilterBy] = useState<
    "all" | "similar-price" | "same-location" | "trending"
  >("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const propertiesPerPage = 3;

  useEffect(() => {
    // In real app, this would be an API call
    const mockData = generateMockRelatedProperties(currentProperty);
    setRelatedProperties(mockData);
  }, [currentProperty]);

  const filteredProperties = relatedProperties.filter((property) => {
    switch (filterBy) {
      case "similar-price":
        return (
          Math.abs(property.price - currentProperty.price) /
            currentProperty.price <=
          0.3
        ); // Within 30%
      case "same-location":
        return property.location.name === currentProperty.location.name;
      case "trending":
        return property.viewsThisWeek > 70;
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const currentProperties = filteredProperties.slice(
    currentPage * propertiesPerPage,
    (currentPage + 1) * propertiesPerPage
  );

  const toggleFavorite = (propertyId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriceComparisonBadge = (
    comparison: "lower" | "similar" | "higher"
  ) => {
    switch (comparison) {
      case "lower":
        return (
          <Badge variant="outline" className="text-green-700 border-green-200">
            Price Advantage
          </Badge>
        );
      case "higher":
        return (
          <Badge variant="outline" className="text-blue-700 border-blue-200">
            Premium Option
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-700 border-gray-200">
            Similar Price
          </Badge>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Similar Properties
          </h2>
          <p className="text-gray-600 mt-1">
            Based on location, price, and property type •{" "}
            {filteredProperties.length} properties found
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterBy === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterBy("all")}
        >
          All Properties
        </Button>
        <Button
          variant={filterBy === "similar-price" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterBy("similar-price")}
        >
          Similar Price Range
        </Button>
        <Button
          variant={filterBy === "same-location" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterBy("same-location")}
        >
          Same Location
        </Button>
        <Button
          variant={filterBy === "trending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterBy("trending")}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Trending
        </Button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProperties.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="relative">
              {/* Property Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <PropertyImage
                  images={property.images || []}
                  alt={property.title}
                  className="group-hover:scale-105 transition-transform duration-300"
                />

                {/* Property Type & Featured Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="secondary" className="bg-white/90">
                    {property.propertyType.replace("_", " ")}
                  </Badge>
                  {property.featured && (
                    <Badge className="bg-yellow-500">Featured</Badge>
                  )}
                </div>

                {/* Price Comparison Badge */}
                <div className="absolute top-3 right-3">
                  {getPriceComparisonBadge(property.priceComparison)}
                </div>

                {/* Similarity Score */}
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-primary/90 text-white">
                    {property.similarityScore}% Match
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(property.id);
                    }}
                    className={`bg-white/90 hover:bg-white ${
                      favorites.has(property.id) ? "text-red-500" : ""
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(property.id) ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Property Details */}
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Title and Location */}
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{property.location.name}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(property.price)}
                  </div>

                  {/* Property Features */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" />
                      {property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3" />
                      {property.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Square className="w-3 h-3" />
                      {property.area} sqft
                    </span>
                  </div>

                  {/* Similarity Reasons */}
                  <div className="flex flex-wrap gap-1">
                    {property.similarityReasons
                      .slice(0, 2)
                      .map((reason, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {reason}
                        </Badge>
                      ))}
                    {property.similarityReasons.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{property.similarityReasons.length - 2} more
                      </Badge>
                    )}
                  </div>

                  {/* Social Proof & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {property.viewsThisWeek} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        This week
                      </span>
                    </div>

                    <Link href={`/properties/${property.slug}`}>
                      <Button variant="outline" size="sm">
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-600">
          Showing {currentPage * propertiesPerPage + 1} to{" "}
          {Math.min(
            (currentPage + 1) * propertiesPerPage,
            filteredProperties.length
          )}{" "}
          of {filteredProperties.length} properties
        </div>
      )}

      {/* View All CTA */}
      <div className="text-center">
        <Link
          href={`/properties?location=${currentProperty.location.name}&type=${currentProperty.propertyType}`}
        >
          <Button variant="outline" size="lg">
            View All Properties in {currentProperty.location.name}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

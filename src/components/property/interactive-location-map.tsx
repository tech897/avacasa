"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Navigation,
  Clock,
  Car,
  Train,
  Plane,
  GraduationCap,
  Hospital,
  ShoppingBag,
  Coffee,
  Fuel,
  Building,
  TreePine,
  Waves,
  Mountain,
  Star,
  TrendingUp,
  Calculator,
  Route,
} from "lucide-react";

interface Amenity {
  id: string;
  name: string;
  type:
    | "education"
    | "healthcare"
    | "shopping"
    | "restaurant"
    | "fuel"
    | "entertainment"
    | "transport";
  distance: string;
  walkTime: string;
  driveTime: string;
  rating?: number;
  coordinates: { lat: number; lng: number };
  description?: string;
}

interface CommuteDestination {
  name: string;
  distance: string;
  driveTime: string;
  publicTransport?: string;
  type: "airport" | "railway" | "business" | "landmark";
}

interface InteractiveLocationMapProps {
  propertyLocation: {
    name: string;
    coordinates: { lat: number; lng: number };
    address: string;
  };
  className?: string;
}

// Mock data - In real app, this would come from Google Places API or similar
const mockAmenities: Amenity[] = [
  {
    id: "1",
    name: "Siolim Primary School",
    type: "education",
    distance: "0.8 km",
    walkTime: "10 min",
    driveTime: "3 min",
    rating: 4.2,
    coordinates: { lat: 15.5937, lng: 73.756 },
    description: "Well-established local school with good facilities",
  },
  {
    id: "2",
    name: "Mapusa Medical Center",
    type: "healthcare",
    distance: "5.2 km",
    walkTime: "1h 5min",
    driveTime: "12 min",
    rating: 4.5,
    coordinates: { lat: 15.5909, lng: 73.8167 },
    description: "Modern healthcare facility with emergency services",
  },
  {
    id: "3",
    name: "Saturday Night Market",
    type: "shopping",
    distance: "3.1 km",
    walkTime: "35 min",
    driveTime: "8 min",
    rating: 4.7,
    coordinates: { lat: 15.5559, lng: 73.7644 },
    description: "Famous weekly market with local crafts and food",
  },
  {
    id: "4",
    name: "Gunpowder Restaurant",
    type: "restaurant",
    distance: "1.2 km",
    walkTime: "15 min",
    driveTime: "4 min",
    rating: 4.6,
    coordinates: { lat: 15.5937, lng: 73.746 },
    description: "Popular restaurant serving local Goan cuisine",
  },
  {
    id: "5",
    name: "Indian Oil Petrol Pump",
    type: "fuel",
    distance: "2.8 km",
    walkTime: "32 min",
    driveTime: "7 min",
    rating: 4.1,
    coordinates: { lat: 15.5837, lng: 73.766 },
    description: "24/7 fuel station with convenience store",
  },
  {
    id: "6",
    name: "Club Cabana Beach Resort",
    type: "entertainment",
    distance: "4.5 km",
    walkTime: "50 min",
    driveTime: "11 min",
    rating: 4.3,
    coordinates: { lat: 15.5537, lng: 73.736 },
    description: "Beach resort with restaurants and water sports",
  },
];

const mockCommuteDestinations: CommuteDestination[] = [
  {
    name: "Goa International Airport",
    distance: "42 km",
    driveTime: "55 min",
    publicTransport: "1h 45min via bus",
    type: "airport",
  },
  {
    name: "Thivim Railway Station",
    distance: "18 km",
    driveTime: "25 min",
    publicTransport: "45min via bus",
    type: "railway",
  },
  {
    name: "Panaji (Capital City)",
    distance: "25 km",
    driveTime: "35 min",
    publicTransport: "1h 10min via bus",
    type: "business",
  },
  {
    name: "Calangute Beach",
    distance: "12 km",
    driveTime: "18 min",
    publicTransport: "30min via bus",
    type: "landmark",
  },
  {
    name: "Baga Beach",
    distance: "15 km",
    driveTime: "22 min",
    publicTransport: "35min via bus",
    type: "landmark",
  },
  {
    name: "Mapusa Market",
    distance: "5.2 km",
    driveTime: "12 min",
    publicTransport: "20min via bus",
    type: "business",
  },
];

const amenityIcons = {
  education: GraduationCap,
  healthcare: Hospital,
  shopping: ShoppingBag,
  restaurant: Coffee,
  fuel: Fuel,
  entertainment: Building,
  transport: Train,
};

const destinationIcons = {
  airport: Plane,
  railway: Train,
  business: Building,
  landmark: Mountain,
};

export function InteractiveLocationMap({
  propertyLocation,
  className = "",
}: InteractiveLocationMapProps) {
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCommute, setShowCommute] = useState(false);

  const filteredAmenities =
    selectedCategory === "all"
      ? mockAmenities
      : mockAmenities.filter((amenity) => amenity.type === selectedCategory);

  const categoryStats = {
    education: mockAmenities.filter((a) => a.type === "education").length,
    healthcare: mockAmenities.filter((a) => a.type === "healthcare").length,
    shopping: mockAmenities.filter((a) => a.type === "shopping").length,
    restaurant: mockAmenities.filter((a) => a.type === "restaurant").length,
    entertainment: mockAmenities.filter((a) => a.type === "entertainment")
      .length,
    transport: mockAmenities.filter((a) => a.type === "transport").length,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Location Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Location & Neighborhood
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Location */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-primary/10 to-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {propertyLocation.name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {propertyLocation.address}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-700">
                    <TreePine className="w-4 h-4" />
                    <span>Peaceful residential area</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <Waves className="w-4 h-4" />
                    <span>Close to beaches</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-700">
                    <TrendingUp className="w-4 h-4" />
                    <span>High appreciation potential</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-primary">8.5%</div>
                  <div className="text-xs text-gray-600">Appreciation Rate</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-green-600">A+</div>
                  <div className="text-xs text-gray-600">Location Score</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-blue-600">92</div>
                  <div className="text-xs text-gray-600">Walkability</div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="lg:col-span-2">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                {/* This would be replaced with actual Google Maps or Mapbox */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Interactive Map</p>
                    <p className="text-sm text-gray-500">
                      Click on amenities to explore
                    </p>
                  </div>
                </div>

                {/* Mock markers */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="text-xs font-semibold bg-white px-2 py-1 rounded shadow-md mt-1">
                    Property
                  </div>
                </div>

                {/* Mock amenity markers */}
                {[
                  { top: "30%", left: "40%", label: "School" },
                  { top: "60%", left: "70%", label: "Hospital" },
                  { top: "40%", left: "80%", label: "Market" },
                  { top: "70%", left: "30%", label: "Restaurant" },
                ].map((marker, index) => (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ top: marker.top, left: marker.left }}
                  >
                    <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities and Commute Tabs */}
      <Tabs defaultValue="amenities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="amenities">Nearby Amenities</TabsTrigger>
          <TabsTrigger value="commute">Commute & Transport</TabsTrigger>
          <TabsTrigger value="insights">Area Insights</TabsTrigger>
        </TabsList>

        {/* Nearby Amenities Tab */}
        <TabsContent value="amenities" className="space-y-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All ({mockAmenities.length})
            </Button>
            {Object.entries(categoryStats).map(([category, count]) => {
              const Icon = amenityIcons[category as keyof typeof amenityIcons];
              return (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-1"
                >
                  <Icon className="w-3 h-3" />
                  {category} ({count})
                </Button>
              );
            })}
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAmenities.map((amenity) => {
              const Icon = amenityIcons[amenity.type];
              return (
                <Card
                  key={amenity.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedAmenity?.id === amenity.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedAmenity(amenity)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {amenity.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {amenity.distance}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {amenity.driveTime}
                          </span>
                          {amenity.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-yellow-400" />
                              {amenity.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Amenity Details */}
          {selectedAmenity && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {selectedAmenity.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedAmenity.description}
                    </p>

                    <div className="flex items-center gap-6 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Car className="w-4 h-4" />
                        Drive: {selectedAmenity.driveTime}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Navigation className="w-4 h-4" />
                        Walk: {selectedAmenity.walkTime}
                      </span>
                      {selectedAmenity.rating && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Star className="w-4 h-4 fill-current text-yellow-400" />
                          {selectedAmenity.rating}/5
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Route className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Commute & Transport Tab */}
        <TabsContent value="commute" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Destinations */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">
                Key Destinations
              </h4>
              <div className="space-y-3">
                {mockCommuteDestinations.map((destination, index) => {
                  const Icon = destinationIcons[destination.type];
                  return (
                    <Card key={index} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">
                              {destination.name}
                            </h5>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Car className="w-3 h-3" />
                                {destination.driveTime}
                              </span>
                              <span>•</span>
                              <span>{destination.distance}</span>
                              {destination.publicTransport && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Train className="w-3 h-3" />
                                    {destination.publicTransport}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Commute Calculator */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">
                Commute Calculator
              </h4>
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        To:
                      </label>
                      <select className="w-full mt-1 p-2 border border-gray-300 rounded-lg">
                        <option>Goa International Airport</option>
                        <option>Panaji (Capital)</option>
                        <option>Thivim Railway Station</option>
                        <option>Mapusa Market</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Travel Mode:
                      </label>
                      <div className="flex gap-2 mt-1">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Car className="w-4 h-4 mr-1" />
                          Drive
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Train className="w-4 h-4 mr-1" />
                          Public
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          55 min
                        </div>
                        <div className="text-sm text-gray-600">
                          Estimated travel time
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          42 km via NH66
                        </div>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Calculator className="w-4 h-4 mr-2" />
                      Get Detailed Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Area Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Investment Potential */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Investment Potential
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Property Appreciation
                  </span>
                  <span className="font-semibold text-green-600">
                    8.5% annually
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rental Demand</span>
                  <span className="font-semibold text-blue-600">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Development Plans
                  </span>
                  <span className="font-semibold text-purple-600">
                    Positive
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Avg Household Income
                  </span>
                  <span className="font-semibold">₹15-25L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Education Level</span>
                  <span className="font-semibold">High</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Tourism Footfall
                  </span>
                  <span className="font-semibold text-orange-600">
                    Peak Season
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Future Development */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Future Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900 mb-1">
                    Mopa Airport Connectivity
                  </div>
                  <div className="text-gray-600">
                    Improved access expected by 2025
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 mb-1">
                    Tourism Infrastructure
                  </div>
                  <div className="text-gray-600">
                    New resorts and attractions planned
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 mb-1">
                    Road Improvements
                  </div>
                  <div className="text-gray-600">
                    Highway expansion in progress
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

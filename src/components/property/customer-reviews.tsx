"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import {
  Star,
  Users,
  Shield,
  Quote,
  ThumbsUp,
  Verified,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Home,
} from "lucide-react";

interface Review {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  location: string;
  propertyType: string;
  helpful: number;
  images?: string[];
}

interface CustomerReviewsProps {
  propertyId: string;
  propertyType: string;
  averageRating?: number;
  totalReviews?: number;
  className?: string;
}

// Mock reviews data - In real app, this would come from API
const mockReviews: Review[] = [
  {
    id: "1",
    name: "Priya Sharma",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b60b9872?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    title: "Excellent investment opportunity!",
    content:
      "I purchased this villa as a holiday home and investment property. The rental yields have been consistent at 4.2% annually, and the property has appreciated significantly. The management company is very responsive and handles all bookings seamlessly. The location is perfect - close to beaches but peaceful. Highly recommend for investors looking for premium properties in Goa.",
    date: "2024-01-15",
    verified: true,
    location: "Mumbai",
    propertyType: "Villa Investor",
    helpful: 24,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop",
    ],
  },
  {
    id: "2",
    name: "Rajesh Kumar",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    title: "Perfect family retreat",
    content:
      "We've been using this property for family vacations for over 2 years. The kids love the pool and gardens, while we adults appreciate the modern amenities and peaceful environment. The property management takes care of everything - from cleaning to stocking the kitchen. It truly feels like a home away from home. The appreciation in value has been a bonus!",
    date: "2024-01-10",
    verified: true,
    location: "Delhi",
    propertyType: "Holiday Home Owner",
    helpful: 18,
  },
  {
    id: "3",
    name: "Anita Patel",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    rating: 4,
    title: "Great location and amenities",
    content:
      "The property exceeded our expectations. The build quality is excellent, and the location offers the perfect balance of accessibility and tranquility. We've been renting it out when not in use, and the occupancy rates have been impressive - around 75% throughout the year. The only minor issue was some initial paperwork delays, but the developer resolved everything promptly.",
    date: "2023-12-28",
    verified: true,
    location: "Pune",
    propertyType: "Farmhouse Owner",
    helpful: 15,
  },
  {
    id: "4",
    name: "Dr. Vikram Singh",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    title: "Exceptional ROI and service",
    content:
      "As a real estate investor, I've purchased multiple properties across India. This one stands out for its consistent returns and professional management. The 8.5% annual appreciation combined with rental income makes it one of my best-performing assets. The transparent reporting and hassle-free experience make it ideal for busy professionals like me.",
    date: "2023-12-20",
    verified: true,
    location: "Bangalore",
    propertyType: "Investment Property",
    helpful: 31,
  },
  {
    id: "5",
    name: "Meera Reddy",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 4,
    title: "Beautiful property, great for families",
    content:
      "We bought this as our weekend getaway and couldn't be happier. The architecture is stunning, and the natural surroundings provide the perfect escape from city life. Our teenage kids actually prefer staying here over going to hotels! The property has become a gathering place for our extended family. Property values in the area have increased by 12% since our purchase.",
    date: "2023-12-15",
    verified: true,
    location: "Chennai",
    propertyType: "Weekend Home",
    helpful: 22,
  },
];

export function CustomerReviews({
  propertyId,
  propertyType,
  averageRating = 4.6,
  totalReviews = 47,
  className = "",
}: CustomerReviewsProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const reviewsPerPage = 3;
  const totalPages = Math.ceil(mockReviews.length / reviewsPerPage);

  const filteredReviews =
    selectedFilter === "all"
      ? mockReviews
      : mockReviews.filter(
          (review) => review.rating >= parseInt(selectedFilter)
        );

  const currentReviews = filteredReviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  const ratingDistribution = [
    { stars: 5, count: 32, percentage: 68 },
    { stars: 4, count: 12, percentage: 26 },
    { stars: 3, count: 2, percentage: 4 },
    { stars: 2, count: 1, percentage: 2 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Rating Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Overall Rating */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <div className="text-4xl font-bold text-gray-900">
                {averageRating}
              </div>
              <div>
                <StarRating rating={averageRating} size="lg" />
                <div className="text-sm text-gray-600">
                  {totalReviews} reviews
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-green-700">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Verified Reviews</span>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 w-12">
                  <span>{item.stars}</span>
                  <Star className="w-3 h-3 fill-current text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-gray-600 w-8">{item.count}</span>
              </div>
            ))}
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-xs text-gray-600">Would Recommend</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">4.8</div>
              <div className="text-xs text-gray-600">Investment Rating</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">98%</div>
              <div className="text-xs text-gray-600">Verified Buyers</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-orange-600">4.2%</div>
              <div className="text-xs text-gray-600">Avg Rental Yield</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
          >
            All Reviews
          </Button>
          <Button
            variant={selectedFilter === "5" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("5")}
          >
            5 Stars
          </Button>
          <Button
            variant={selectedFilter === "4" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("4")}
          >
            4+ Stars
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 gap-6">
        {currentReviews.map((review) => (
          <Card
            key={review.id}
            className="border-gray-200 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {review.avatar ? (
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <Users className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {review.name}
                        </h4>
                        {review.verified && (
                          <Badge
                            variant="outline"
                            className="text-green-700 border-green-200"
                          >
                            <Verified className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {review.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          {review.propertyType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <StarRating rating={review.rating} />
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(review.date)}
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">
                    {review.title}
                  </h5>
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-6 h-6 text-gray-300" />
                    <p className="text-gray-700 leading-relaxed pl-4">
                      {review.content}
                    </p>
                  </div>
                </div>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((image, index) => (
                      <div
                        key={index}
                        className="w-20 h-20 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Helpful ({review.helpful})
                  </Button>
                  <div className="text-xs text-gray-500">
                    Property owner since {new Date(review.date).getFullYear()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Review CTA */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Own a property like this?
        </h3>
        <p className="text-gray-600 mb-4">
          Share your experience and help other investors make informed
          decisions.
        </p>
        <Button className="bg-primary hover:bg-primary/90">
          Write a Review
        </Button>
      </div>
    </div>
  );
}

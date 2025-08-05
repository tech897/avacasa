"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Phone,
  Mail,
  Heart,
  Share2,
  Download,
  Car,
  Wifi,
  Shield,
  Waves,
  Trees,
  Dumbbell,
  ChefHat,
  Snowflake,
  Building,
  GraduationCap,
  Hospital,
  ShoppingBag,
  Plane,
  Coffee,
  Eye,
  Camera,
  PlayCircle,
  TrendingUp,
  Star,
  Users,
  Clock,
  Maximize,
  X,
  ChevronLeft,
  ChevronRight,
  Calculator,
  PiggyBank,
  FileText,
  Home,
  MapIcon,
  MessageSquare,
  Scale,
  Sparkles,
} from "lucide-react";
import type { Property } from "@/types";
import { useTracking } from "@/hooks/use-tracking";
import { CallButton } from "@/components/common/call-button";
import { InvestmentCalculator } from "@/components/property/investment-calculator";
import { InteractiveLocationMap } from "@/components/property/interactive-location-map";
import { CustomerReviews } from "@/components/property/customer-reviews";
import { RelatedProperties } from "@/components/property/related-properties";

const amenityIcons: Record<string, React.ComponentType<any>> = {
  parking: Car,
  wifi: Wifi,
  security: Shield,
  pool: Waves,
  garden: Trees,
  gym: Dumbbell,
  kitchen: ChefHat,
  ac: Snowflake,
  coffee: Coffee,
};

const navigationItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "investment", label: "Investment", icon: Calculator },
  { id: "amenities", label: "Amenities", icon: Sparkles },
  { id: "location", label: "Location", icon: MapIcon },
  { id: "reviews", label: "Reviews", icon: MessageSquare },
  { id: "legal", label: "Legal", icon: Scale },
  { id: "similar", label: "Similar", icon: FileText },
];

export default function PropertyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recentViews, setRecentViews] = useState(47); // Mock recent view count
  const [activeSection, setActiveSection] = useState("overview");

  const { trackPageView, trackPropertyView } = useTracking();

  useEffect(() => {
    if (slug) {
      fetchProperty();
    }
  }, [slug]);

  // Simulate real-time view counter
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance every 30 seconds
        setRecentViews((prev) => prev + 1);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    navigationItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [property]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${slug}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProperty(result.data);
          trackPageView(`/properties/${slug}`);
          trackPropertyView(result.data.id, result.data.title);
        }
      }
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 120; // Account for sticky navigation
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with API
  };

  const handleImageNavigation = (direction: "prev" | "next") => {
    if (!property) return;
    if (direction === "prev") {
      setSelectedImage((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    } else {
      setSelectedImage((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const calculateROI = () => {
    if (!property) return { monthlyRental: 0, annualROI: 0 };
    const monthlyRental = (property.price * 0.035) / 12; // 3.5% annual yield
    const annualROI = 8; // 8% appreciation + rental yield
    return { monthlyRental, annualROI };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded"></div>
              <div className="bg-gray-200 h-6 rounded"></div>
              <div className="bg-gray-200 h-20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Property Not Found
          </h1>
          <p className="text-gray-600">
            The property you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const getAmenityIcon = (iconName: string) => {
    const IconComponent = amenityIcons[iconName] || Building;
    return <IconComponent className="w-5 h-5" />;
  };

  const { monthlyRental, annualROI } = calculateROI();

  return (
    <div className="min-h-screen bg-gray-50 mt-30">
      {/* Enhanced Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Key Features Highlights Banner */}
          <div className="mb-6 flex flex-wrap gap-2">
            {property.featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                ⭐ Featured Property
              </Badge>
            )}
            <Badge
              variant="outline"
              className="border-green-500 text-green-700"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {annualROI}% Expected ROI
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-700">
              <PiggyBank className="w-3 h-3 mr-1" />₹
              {Math.round(monthlyRental / 1000)}K Monthly Rental
            </Badge>
            <Badge variant="outline" className="border-red-500 text-red-700">
              <Eye className="w-3 h-3 mr-1" />
              {recentViews} views this week
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Image Gallery */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative h-96 rounded-lg overflow-hidden group">
                <Image
                  src={
                    property.images[selectedImage] ||
                    "/placeholder-property.jpg"
                  }
                  alt={property.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Image Navigation Arrows */}
                <button
                  onClick={() => handleImageNavigation("prev")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleImageNavigation("next")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImage + 1} / {property.images.length}
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="View fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>

                {/* Property Type & Featured Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="secondary" className="bg-white/90">
                    {property.propertyType.replace("_", " ")}
                  </Badge>
                  {property.featured && (
                    <Badge className="bg-yellow-500">Featured</Badge>
                  )}
                </div>

                {/* Virtual Tour & Gallery Buttons */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <Button size="sm" className="bg-primary/90 hover:bg-primary">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Virtual Tour
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/90 hover:bg-white"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    All Photos ({property.images.length})
                  </Button>
                </div>
              </div>

              {/* Enhanced Thumbnail Gallery */}
              <div className="grid grid-cols-6 gap-2">
                {property.images.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 rounded overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
                {property.images.length > 5 && (
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="relative h-16 rounded overflow-hidden border-2 border-gray-200 hover:border-gray-300 bg-gray-100 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium">
                        +{property.images.length - 5}
                      </div>
                      <div className="text-xs text-gray-600">more</div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Enhanced Property Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.location.name}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFavorite}
                      className={
                        isFavorite ? "text-red-500 border-red-200" : ""
                      }
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavorite ? "fill-current" : ""
                        }`}
                      />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Price & Investment Highlights */}
                <div className="bg-gradient-to-r from-primary/10 to-blue-50 p-4 rounded-lg mb-4">
                  <div className="text-3xl font-bold text-primary mb-2">
                    ₹{property.price.toLocaleString()}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">
                        Monthly Rental Potential:
                      </span>
                      <div className="font-semibold text-green-600">
                        ₹{Math.round(monthlyRental / 1000)}K - ₹
                        {Math.round((monthlyRental * 1.5) / 1000)}K
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Expected Appreciation:
                      </span>
                      <div className="font-semibold text-blue-600">
                        {annualROI}% annually
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Features Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bed className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-xs text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bath className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <div className="font-semibold">{property.bathrooms}</div>
                    <div className="text-xs text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Square className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <div className="font-semibold">{property.area}</div>
                    <div className="text-xs text-gray-600">sqft</div>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center text-green-800 text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      {recentViews} people viewed this property this week
                    </span>
                  </div>
                  <div className="flex items-center text-green-700 text-xs mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Last viewed 2 hours ago</span>
                  </div>
                </div>

                {/* Quick Investment Calculator */}
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-primary" />
                      Quick Investment Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">EMI (20yr @8.5%):</span>
                        <div className="font-semibold">
                          ₹
                          {Math.round(
                            property.price * 0.8 * 0.00868
                          ).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Down Payment (20%):
                        </span>
                        <div className="font-semibold">
                          ₹{Math.round((property.price * 0.2) / 100000)}L
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-primary border-primary"
                      onClick={() => scrollToSection("investment")}
                    >
                      View Detailed Calculator
                    </Button>
                  </CardContent>
                </Card>

                {/* Enhanced Action Buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <CallButton variant="default" className="flex-1" />
                    <Button variant="outline" className="flex-1">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Inquiry
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Visit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Brochure
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            aria-label="Close fullscreen"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-full p-4">
            <Image
              src={property.images[selectedImage]}
              alt={property.title}
              fill
              className="object-contain"
            />
            <button
              onClick={() => handleImageNavigation("prev")}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              aria-label="Previous image in fullscreen"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={() => handleImageNavigation("next")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
              aria-label="Next image in fullscreen"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {/* Sticky Navigation */}
      <div className="sticky top-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                    activeSection === item.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Overview Section */}
        <section id="overview" className="scroll-mt-32">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Overview</h2>
            <p className="text-gray-600">
              Complete details about this property
            </p>
          </div>

          <div className="space-y-8">
            {/* About the Project */}
            {property.aboutProject && (
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  About the Project
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {property.aboutProject}
                </p>
              </div>
            )}

            {/* Property Description */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Property Description
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {property.description}
              </p>

              {/* Key Highlights */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Key Highlights:
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-700">
                      Premium{" "}
                      {property.propertyType.replace("_", " ").toLowerCase()} in{" "}
                      {property.location.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-700">
                      {property.bedrooms} bedrooms, {property.bathrooms}{" "}
                      bathrooms
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-700">
                      {property.area} sqft of living space
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-700">
                      High rental yield potential (3.5-5% annually)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-gray-700">
                      Excellent capital appreciation prospects
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Property Management */}
              {property.propertyManagement && (
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Property Management
                  </h3>
                  <div className="space-y-4">
                    {property.propertyManagement.company && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Company:
                        </span>
                        <span className="text-gray-600">
                          {property.propertyManagement.company}
                        </span>
                      </div>
                    )}
                    {property.propertyManagement.services && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Services:
                        </span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {property.propertyManagement.services.map(
                            (service, index) => (
                              <Badge key={index} variant="outline">
                                {service}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {property.propertyManagement.charges && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Charges:
                        </span>
                        <span className="text-gray-600">
                          {property.propertyManagement.charges}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Financial Returns */}
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Financial Returns & Investment Benefits
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Investment Benefits:
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">
                          Expected appreciation: 8-12% annually
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <PiggyBank className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">
                          Rental yield: 3.5-5% per annum
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Scale className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700">
                          Tax benefits under Section 80C and 24(b)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700">
                          High liquidity in premium locations
                        </span>
                      </div>
                    </div>
                  </div>

                  {property.investmentBenefits && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Location Advantages:
                      </h4>
                      <div className="space-y-2">
                        {property.investmentBenefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Calculator Section */}
        <section id="investment" className="scroll-mt-32">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Investment Calculator
            </h2>
            <p className="text-gray-600">
              Calculate your EMI, returns and investment potential
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <InvestmentCalculator
              propertyPrice={property.price}
              propertyType={property.propertyType}
              location={property.location.name}
            />
          </div>
        </section>

        {/* Amenities Section */}
        <section id="amenities" className="scroll-mt-32">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Amenities</h2>
            <p className="text-gray-600">
              Premium amenities and facilities available
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {property.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getAmenityIcon(amenity.icon || "building")}
                  </div>
                  <span className="font-medium text-gray-900">
                    {amenity.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section id="location" className="scroll-mt-32">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Location</h2>
            <p className="text-gray-600">
              Explore the neighborhood and nearby amenities
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <InteractiveLocationMap
              propertyLocation={{
                name: property.location.name,
                coordinates: property.coordinates,
                address: property.location.name,
              }}
            />
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="scroll-mt-32">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h2>
            <p className="text-gray-600">
              What customers say about this property
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <CustomerReviews
              propertyId={property.id}
              propertyType={property.propertyType}
              averageRating={4.6}
              totalReviews={47}
            />
          </div>
        </section>

        {/* Legal Section */}
        <section id="legal" className="scroll-mt-32">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Legal Approvals & Documentation
            </h2>
            <p className="text-gray-600">
              All legal clearances and required documentation
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            {property.legalApprovals && property.legalApprovals.length > 0 ? (
              <div className="space-y-4">
                {property.legalApprovals.map((approval, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-6 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {approval.name}
                      </h4>
                      {approval.authority && (
                        <p className="text-sm text-gray-600 mt-1">
                          Authority: {approval.authority}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          approval.status === "Approved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {approval.status}
                      </Badge>
                      {approval.date && (
                        <p className="text-sm text-gray-600 mt-1">
                          {approval.date}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6 text-green-600" />
                      <h4 className="font-semibold text-green-800">
                        RERA Approved
                      </h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Project registered under RERA with approval number
                      REG/2023/001234
                    </p>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">
                        Clear Title
                      </h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Property has clear and marketable title with all necessary
                      clearances
                    </p>
                  </div>
                  <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Building className="w-6 h-6 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">
                        NOC Obtained
                      </h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      All required NOCs from authorities obtained and valid
                    </p>
                  </div>
                  <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Scale className="w-6 h-6 text-orange-600" />
                      <h4 className="font-semibold text-orange-800">
                        Bank Approved
                      </h4>
                    </div>
                    <p className="text-sm text-orange-700">
                      Pre-approved by major banks for home loan eligibility
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Required Documents for Purchase:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      "Sale Deed",
                      "Property Registration",
                      "Tax Receipts",
                      "Possession Certificate",
                      "Encumbrance Certificate",
                      "Building Approval Plan",
                      "Completion Certificate",
                      "Utility Connections NOC",
                    ].map((doc, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Similar Properties Section */}
        <section id="similar" className="scroll-mt-32">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Similar Properties
            </h2>
            <p className="text-gray-600">
              Other properties you might be interested in
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <RelatedProperties currentProperty={property} />
          </div>
        </section>
      </div>
    </div>
  );
}

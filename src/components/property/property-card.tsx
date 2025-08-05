"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Maximize, Share2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, getWhatsAppLink } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import type { Property } from "@/types";

interface PropertyCardProps {
  property: Property;
  showFavorite?: boolean;
  showShare?: boolean;
  isSelected?: boolean;
}

export function PropertyCard({
  property,
  showFavorite = true,
  showShare = true,
  isSelected = false,
}: PropertyCardProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const whatsappMessage = `Hi! I'm interested in ${
    property.title
  } listed at ${formatCurrency(
    property.price
  )}. Could you provide more details?`;
  const whatsappLink = getWhatsAppLink(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    whatsappMessage
  );

  // Check if property is favorited on mount
  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, property.id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch("/api/user/favorites");
      if (response.ok) {
        const data = await response.json();
        const isFav = data.favorites.some(
          (fav: any) => fav.propertyId === property.id
        );
        setIsFavorited(isFav);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Could show login modal here
      alert("Please sign in to save favorites");
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch("/api/user/favorites", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ propertyId: property.id }),
        });

        if (response.ok) {
          setIsFavorited(false);
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/user/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ propertyId: property.id }),
        });

        if (response.ok) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: `${window.location.origin}/properties/${property.slug}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback to copying URL
      const url = `${window.location.origin}/properties/${property.slug}`;
      navigator.clipboard.writeText(url);
      alert("Property link copied to clipboard!");
    }
  };

  return (
    <Card
      className={`group overflow-hidden hover:shadow-xl transition-all duration-300 ease-out border-0 bg-white rounded-2xl ${
        isSelected
          ? "ring-2 ring-blue-500 shadow-xl transform scale-[1.02] bg-blue-50/30"
          : ""
      }`}
    >
      <div className="relative">
        <Link href={`/properties/${property.slug}`}>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={
                property.images[0] ||
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              }
              alt={property.title}
              width={400}
              height={300}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Light gradient overlay - just enough for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        </Link>

        {/* Top Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-gray-900/80 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
            Farm View
          </span>
          <span className="bg-gray-900/80 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
            3 Tier Security
          </span>
          <span className="bg-gray-900/80 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
            Assured Yield
          </span>
        </div>

        {/* Heart and Share Icons */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {showShare && (
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/95 hover:bg-white shadow-lg border-0 rounded-full w-7 h-7 backdrop-blur-sm"
              onClick={handleShare}
            >
              <Share2 className="w-3.5 h-3.5 text-gray-700" />
            </Button>
          )}
          {showFavorite && (
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/95 hover:bg-white shadow-lg border-0 rounded-full w-7 h-7 backdrop-blur-sm"
              onClick={toggleFavorite}
              disabled={favoriteLoading}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorited ? "text-red-500 fill-current" : "text-gray-700"
                } ${favoriteLoading ? "animate-pulse" : ""}`}
              />
            </Button>
          )}
        </div>

        {/* Compact Property Details Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Minimal background for text clarity */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl" />

          <div className="relative z-10">
            <Link href={`/properties/${property.slug}`}>
              <h3 className="text-lg font-bold mb-1 line-clamp-1 group-hover:text-gray-200 transition-colors duration-300 text-white drop-shadow-lg">
                {property.title}
              </h3>
            </Link>

            <div className="flex items-center text-white/90 mb-2 drop-shadow-md">
              <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span className="text-sm font-medium">
                {property.location.name}
              </span>
            </div>

            {/* Compact Price and Area Info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-white mb-0.5 drop-shadow-lg">
                  {formatCurrency(property.price)}
                </p>
                <p className="text-xs text-white/80 font-medium drop-shadow-md">
                  {property.area} sqft | Farmplot | 12 Acres
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MapPin, Bed, Bath, Maximize, Share2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, getWhatsAppLink } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import type { Property } from "@/types"

interface PropertyCardProps {
  property: Property
  showFavorite?: boolean
  showShare?: boolean
  isSelected?: boolean
}

export function PropertyCard({ property, showFavorite = true, showShare = true, isSelected = false }: PropertyCardProps) {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const whatsappMessage = `Hi! I'm interested in ${property.title} listed at ${formatCurrency(property.price)}. Could you provide more details?`
  const whatsappLink = getWhatsAppLink(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "", whatsappMessage)

  // Check if property is favorited on mount
  useEffect(() => {
    if (user) {
      checkFavoriteStatus()
    }
  }, [user, property.id])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const data = await response.json()
        const isFav = data.favorites.some((fav: any) => fav.propertyId === property.id)
        setIsFavorited(isFav)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      // Could show login modal here
      alert('Please sign in to save favorites')
      return
    }

    setFavoriteLoading(true)
    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch('/api/user/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ propertyId: property.id })
        })

        if (response.ok) {
          setIsFavorited(false)
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ propertyId: property.id })
        })

        if (response.ok) {
          setIsFavorited(true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: `${window.location.origin}/properties/${property.slug}`
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      const url = `${window.location.origin}/properties/${property.slug}`
      navigator.clipboard.writeText(url)
      alert('Property link copied to clipboard!')
    }
  }

  return (
    <Card className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 border-0 bg-white ${
      isSelected 
        ? 'ring-2 ring-blue-500 shadow-xl transform scale-[1.02] bg-blue-50/30' 
        : ''
    }`}>
      <div className="relative">
        <Link href={`/properties/${property.slug}`}>
          <div className="aspect-[4/3] overflow-hidden">
            <Image
              src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
              alt={property.title}
              width={400}
              height={300}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
        </Link>
        
        {/* Overlay badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
            {property.propertyType.replace('_', ' ')}
          </span>
          {property.featured && (
            <span className="bg-gray-700 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
              Featured
            </span>
          )}
          {property.status !== 'AVAILABLE' && (
            <span className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
              {property.status.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {showFavorite && (
            <Button 
              size="icon" 
              variant="secondary" 
              className="bg-white/90 hover:bg-white shadow-lg border-0 rounded-full w-10 h-10"
              onClick={toggleFavorite}
              disabled={favoriteLoading}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'} ${favoriteLoading ? 'animate-pulse' : ''}`} />
            </Button>
          )}
          {showShare && (
            <Button 
              size="icon" 
              variant="secondary" 
              className="bg-white/90 hover:bg-white shadow-lg border-0 rounded-full w-10 h-10"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </Button>
          )}
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(property.price)}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <Link href={`/properties/${property.slug}`}>
          <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300 text-gray-900">
            {property.title}
          </h3>
        </Link>
        
        <div className="flex items-center text-gray-500 mb-4">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm truncate">{property.location.name}</span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-5 leading-relaxed">
          {property.description}
        </p>

        {/* Property features */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-5 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4 text-gray-400" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-gray-400" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="w-4 h-4 text-gray-400" />
            <span>{property.area} sqft</span>
          </div>
        </div>

        {/* Amenities preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                >
                  {typeof amenity === 'string' ? amenity : amenity.name}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-3">
        <Button variant="outline" className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300" asChild>
          <Link href={`/properties/${property.slug}`}>
            View Details
          </Link>
        </Button>
        <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300" asChild>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            Inquire Now
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
} 
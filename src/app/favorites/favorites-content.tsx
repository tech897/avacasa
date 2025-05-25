"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useTracking } from '@/hooks/use-tracking'
import { PropertyCard } from '@/components/property/property-card'
import { Button } from '@/components/ui/button'
import { Heart, Home, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Property } from '@/types'

interface FavoriteProperty {
  id: string
  propertyId: string
  createdAt: string
  property: Property
}

export default function FavoritesPageContent() {
  const { user } = useAuth()
  const { trackPageView } = useTracking()
  const router = useRouter()
  
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trackPageView('/favorites')
  }, [trackPageView])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (propertyId: string) => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ propertyId })
      })

      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.propertyId !== propertyId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-gray-600">
            Properties you've saved for later. Keep track of your dream homes and investment opportunities.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-t-lg" />
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-4 w-2/3" />
                  <div className="h-4 bg-gray-200 rounded mb-4" />
                  <div className="flex gap-4 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 rounded flex-1" />
                    <div className="h-10 bg-gray-200 rounded flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No Favorites Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring our properties and save your favorites to keep track of the ones you love.
            </p>
            <Button asChild>
              <Link href="/properties">
                <Home className="w-4 h-4 mr-2" />
                Browse Properties
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} in your favorites
              </p>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="relative">
                  <PropertyCard 
                    property={favorite.property} 
                    showFavorite={true}
                    showShare={true}
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => removeFavorite(favorite.propertyId)}
                      className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                      title="Remove from favorites"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Ready to Take the Next Step?
                </h3>
                <p className="text-gray-600 mb-6">
                  Contact us to schedule a visit or get more information about your favorite properties.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link href="/contact">
                      Schedule Consultation
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/properties">
                      Browse More Properties
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 
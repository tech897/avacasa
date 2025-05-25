"use client"

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatCurrency } from '@/lib/utils'
import type { Property } from '@/types/index'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Create custom price marker icon
const createPriceIcon = (price: number, featured: boolean = false) => {
  const priceText = formatCurrency(price).replace('₹', '')
  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div class="relative">
        <div class="bg-white ${featured ? 'border-2 border-primary' : 'border border-gray-300'} rounded-full px-3 py-1 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
          <span class="text-sm font-semibold ${featured ? 'text-primary' : 'text-gray-900'}">₹${priceText}</span>
        </div>
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${featured ? 'border-t-primary' : 'border-t-white'}"></div>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 40],
  })
}

interface PropertyMapProps {
  properties: Property[]
  selectedProperty?: Property | null
  onPropertySelect?: (property: Property) => void
}

export default function PropertyMap({ 
  properties, 
  selectedProperty, 
  onPropertySelect 
}: PropertyMapProps) {
  const mapRef = useRef<any>(null)

  // Calculate map center and zoom based on properties
  const getMapBounds = () => {
    if (properties.length === 0) {
      return { center: [12.9716, 77.5946], zoom: 6 } // Default to Bangalore
    }

    if (properties.length === 1) {
      return { 
        center: [properties[0].coordinates.lat, properties[0].coordinates.lng], 
        zoom: 12 
      }
    }

    const lats = properties.map(p => p.coordinates.lat)
    const lngs = properties.map(p => p.coordinates.lng)
    
    const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2
    const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2
    
    return { center: [centerLat, centerLng], zoom: 8 }
  }

  const { center, zoom } = getMapBounds()

  useEffect(() => {
    // Add custom CSS for price markers
    const style = document.createElement('style')
    style.textContent = `
      .custom-price-marker {
        background: transparent !important;
        border: none !important;
      }
      .leaflet-popup-content-wrapper {
        border-radius: 12px;
        padding: 0;
      }
      .leaflet-popup-content {
        margin: 0;
        border-radius: 12px;
        overflow: hidden;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="h-full w-full">
      <MapContainer
        ref={mapRef}
        center={center as [number, number]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.coordinates.lat, property.coordinates.lng]}
            icon={createPriceIcon(property.price, property.featured)}
            eventHandlers={{
              click: () => onPropertySelect?.(property),
            }}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div className="w-64 p-0">
                <div className="relative aspect-[4/3] mb-3">
                  <img
                    src={property.images[0] || `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                    alt={property.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  {property.featured && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="px-3 pb-3">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {property.location.name}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{property.bedrooms} beds</span>
                      <span>{property.bathrooms} baths</span>
                      <span>{property.area} sqft</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(property.price)}
                    </span>
                    <button 
                      className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`/properties/${property.slug}`, '_blank')
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
} 
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatCurrency } from "@/lib/utils";
import type { Property } from "@/types/index";
import { PropertyImage } from "@/components/ui/optimized-image";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Format price for compact display on map markers
const formatCompactPrice = (price: number): string => {
  if (price >= 10000000) {
    // 1 crore or more
    return `${(price / 10000000).toFixed(1)}Cr`.replace(".0", "");
  } else if (price >= 100000) {
    // 1 lakh or more
    return `${(price / 100000).toFixed(1)}L`.replace(".0", "");
  } else if (price >= 1000) {
    // 1 thousand or more
    return `${(price / 1000).toFixed(1)}K`.replace(".0", "");
  } else {
    return price.toString();
  }
};

// Create custom price marker icon
const createPriceIcon = (
  price: number,
  featured: boolean = false,
  isSelected: boolean = false
) => {
  const compactPrice = formatCompactPrice(price);
  // Calculate width based on text length, with min and max constraints
  const textLength = compactPrice.length;
  const minWidth = 50;
  const maxWidth = 120;
  const dynamicWidth = Math.max(
    minWidth,
    Math.min(maxWidth, textLength * 8 + 30)
  );

  return L.divIcon({
    className: "custom-price-marker",
    html: `
      <div class="relative">
        <div class="bg-white ${
          featured
            ? "border-2 border-primary"
            : isSelected
            ? "border-2 border-blue-500"
            : "border border-gray-300"
        } rounded-full px-3 py-1.5 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer ${
      isSelected ? "ring-2 ring-blue-300" : ""
    }" style="min-width: ${dynamicWidth}px; white-space: nowrap;">
          <span class="text-sm font-semibold ${
            featured
              ? "text-primary"
              : isSelected
              ? "text-blue-600"
              : "text-gray-900"
          } block text-center">₹${compactPrice}</span>
        </div>
        <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
          featured
            ? "border-t-primary"
            : isSelected
            ? "border-t-blue-500"
            : "border-t-white"
        }"></div>
      </div>
    `,
    iconSize: [dynamicWidth, 45],
    iconAnchor: [dynamicWidth / 2, 45],
  });
};

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect?: (property: Property) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  center?: [number, number];
  zoom?: number;
}

// Component to handle map events
function MapEventHandler({
  onBoundsChange,
  onMapReady,
}: {
  onBoundsChange?: (bounds: MapBounds) => void;
  onMapReady?: (map: L.Map) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        const mapBounds: MapBounds = {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        };
        onBoundsChange(mapBounds);
      }
    },
    zoomend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        const mapBounds: MapBounds = {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        };
        onBoundsChange(mapBounds);
      }
    },
  });

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
}

export default function PropertyMap({
  properties,
  selectedProperty,
  onPropertySelect,
  onBoundsChange,
  center: propCenter,
  zoom: propZoom,
}: PropertyMapProps) {
  const mapRef = useRef<any>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Calculate map center and zoom based on properties if not provided
  const getMapBounds = useCallback(() => {
    // If specific center and zoom are provided, use them
    if (propCenter && propZoom) {
      return { center: propCenter, zoom: propZoom };
    }

    // Filter properties that have valid coordinates
    const validProperties = properties.filter(
      (p) => p.coordinates && p.coordinates.lat && p.coordinates.lng
    );

    if (validProperties.length === 0) {
      return { center: [12.9716, 77.5946], zoom: 6 }; // Default to Bangalore
    }

    if (validProperties.length === 1) {
      return {
        center: [
          validProperties[0].coordinates.lat,
          validProperties[0].coordinates.lng,
        ],
        zoom: 12,
      };
    }

    const lats = validProperties.map((p) => p.coordinates.lat);
    const lngs = validProperties.map((p) => p.coordinates.lng);

    const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
    const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;

    return { center: [centerLat, centerLng], zoom: 8 };
  }, [properties, propCenter, propZoom]);

  const { center, zoom } = getMapBounds();

  // Handle initial bounds change when map is ready
  const handleMapReady = useCallback(
    (map: L.Map) => {
      setMapInstance(map);
      if (onBoundsChange) {
        const bounds = map.getBounds();
        const mapBounds: MapBounds = {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        };
        onBoundsChange(mapBounds);
      }
    },
    [onBoundsChange]
  );

  // Fit map to show selected property
  useEffect(() => {
    if (selectedProperty && selectedProperty.coordinates && mapInstance) {
      const { lat, lng } = selectedProperty.coordinates;
      mapInstance.setView([lat, lng], 15, { animate: true });
    }
  }, [selectedProperty, mapInstance]);

  useEffect(() => {
    // Add custom CSS for price markers
    const style = document.createElement("style");
    style.textContent = `
      .custom-price-marker {
        background: transparent !important;
        border: none !important;
      }
      .custom-price-marker:hover {
        z-index: 1000 !important;
      }
      .custom-price-marker div {
        display: flex;
        align-items: center;
        justify-content: center;
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
      .leaflet-popup-close-button {
        display: none !important;
      }
      /* Enhanced popup image styles */
      .custom-popup .group\/image:hover img {
        transform: scale(1.05);
      }
      .custom-popup .group\/image {
        overflow: hidden;
      }
      /* Smooth popup animations */
      .leaflet-popup {
        animation: popup-fade-in 0.3s ease-out;
      }
      @keyframes popup-fade-in {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      /* Ensure price text is properly centered and doesn't wrap */
      .custom-price-marker span {
        line-height: 1.2;
        letter-spacing: -0.025em;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        ref={mapRef}
        center={center as [number, number]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapEventHandler
          onBoundsChange={onBoundsChange}
          onMapReady={handleMapReady}
        />

        {properties
          .filter(
            (property) =>
              property.coordinates &&
              property.coordinates.lat &&
              property.coordinates.lng
          )
          .map((property) => {
            const isSelected = selectedProperty?.id === property.id;
            return (
              <Marker
                key={property.id}
                position={[property.coordinates.lat, property.coordinates.lng]}
                icon={createPriceIcon(
                  property.price,
                  property.featured,
                  isSelected
                )}
                zIndexOffset={isSelected ? 1000 : property.featured ? 100 : 0}
                eventHandlers={{
                  click: () => onPropertySelect?.(property),
                }}
              >
                <Popup
                  className="custom-popup"
                  closeButton={false}
                  autoClose={false}
                >
                  <div className="w-64 p-0">
                    <div
                      className="relative aspect-[4/3] mb-3 cursor-pointer group/image overflow-hidden rounded-t-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/properties/${property.slug}`, "_blank");
                      }}
                    >
                      <PropertyImage
                        images={property.images || []}
                        alt={property.title}
                        className="transition-transform duration-300 group-hover/image:scale-105"
                      />
                      {/* Overlay with view details hint */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-900 transform translate-y-2 group-hover/image:translate-y-0 transition-transform duration-300">
                          <svg
                            className="w-4 h-4 inline mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          View Details
                        </div>
                      </div>

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
                            e.stopPropagation();
                            window.open(
                              `/properties/${property.slug}`,
                              "_blank"
                            );
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Map control overlay */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-white rounded-lg shadow-md p-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Featured</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {properties.length} properties shown
          </div>
        </div>
      </div>
    </div>
  );
}

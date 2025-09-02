"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, MapPin, Home, ChevronDown, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Location {
  id: string;
  name: string;
  slug: string;
  type: "major" | "minor";
  majorLocationId?: string;
  majorLocationName?: string;
  propertyCount: number;
}

interface PropertyType {
  key: string;
  label: string;
}

interface PriceRange {
  min?: number;
  max?: number;
  label: string;
}

interface SearchFilters {
  locationIds: string[];
  propertyType: string;
  priceRange: PriceRange | null;
}

interface DropdownSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (filters: SearchFilters) => void;
  variant?: "hero" | "page";
}

// Property types as per database enum
const propertyTypes: PropertyType[] = [
  { key: "", label: "All Properties" },
  { key: "HOLIDAY_HOME", label: "Holiday Homes" },
  { key: "FARMLAND", label: "Managed Farmlands" },
  { key: "PLOT", label: "Plots" },
  { key: "VILLA", label: "Villas" },
  { key: "APARTMENT", label: "Apartments" },
  { key: "RESIDENTIAL_PLOT", label: "Residential Plots" },
];

// Price ranges in INR
const priceRanges: PriceRange[] = [
  { max: 2500000, label: "Under ₹25 Lakhs" },
  { min: 2500000, max: 5000000, label: "₹25L - ₹50L" },
  { min: 5000000, max: 7500000, label: "₹50L - ₹75L" },
  { min: 7500000, max: 10000000, label: "₹75L - ₹1 Cr" },
  { min: 10000000, max: 20000000, label: "₹1 Cr - ₹2 Cr" },
  { min: 20000000, label: "Above ₹2 Cr" },
];

export function DropdownSearch({
  placeholder = "Search by location, property type, price range...",
  className = "",
  onSearch,
  variant = "hero",
}: DropdownSearchProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<PriceRange | null>(null);

  // Dropdown states
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] =
    useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  // Location search
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Manual price inputs
  const [manualMinPrice, setManualMinPrice] = useState("");
  const [manualMaxPrice, setManualMaxPrice] = useState("");

  // Portal mounting state
  const [isMounted, setIsMounted] = useState(false);

  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const propertyTypeDropdownRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // Set mounted state and fetch locations
  useEffect(() => {
    setIsMounted(true);
    fetchLocations();
  }, []);

  // Close dropdowns when clicking outside and handle repositioning
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (
        propertyTypeDropdownRef.current &&
        !propertyTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPropertyTypeDropdown(false);
      }
      if (
        priceDropdownRef.current &&
        !priceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPriceDropdown(false);
      }
    };

    const handleScroll = () => {
      // Close dropdowns on scroll to prevent misalignment
      setShowLocationDropdown(false);
      setShowPropertyTypeDropdown(false);
      setShowPriceDropdown(false);
    };

    const handleResize = () => {
      // Close dropdowns on resize to prevent misalignment
      setShowLocationDropdown(false);
      setShowPropertyTypeDropdown(false);
      setShowPriceDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/search/locations");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLocations(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter locations based on search query
  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  // Group locations by major/minor
  const majorLocations = filteredLocations.filter(
    (loc) => loc.type === "major"
  );
  const minorLocations = filteredLocations.filter(
    (loc) => loc.type === "minor"
  );

  // Handle location selection
  const handleLocationSelect = useCallback(
    (locationId: string, isMajor: boolean) => {
      console.log("Location selected:", locationId, "isMajor:", isMajor);

      if (isMajor) {
        // If major location selected, also select all its minor locations
        const relatedMinorIds = locations
          .filter((loc) => loc.majorLocationId === locationId)
          .map((loc) => loc.id);

        const allIds = [locationId, ...relatedMinorIds];

        // Toggle selection
        const isSelected = selectedLocationIds.includes(locationId);
        if (isSelected) {
          setSelectedLocationIds((prev) =>
            prev.filter((id) => !allIds.includes(id))
          );
        } else {
          setSelectedLocationIds((prev) => [...new Set([...prev, ...allIds])]);
        }
      } else {
        // Minor location selection
        const isSelected = selectedLocationIds.includes(locationId);
        if (isSelected) {
          setSelectedLocationIds((prev) =>
            prev.filter((id) => id !== locationId)
          );
        } else {
          setSelectedLocationIds((prev) => [...prev, locationId]);
        }
      }
    },
    [locations, selectedLocationIds]
  );

  // Handle search
  const handleSearch = useCallback(() => {
    const filters: SearchFilters = {
      locationIds: selectedLocationIds,
      propertyType: selectedPropertyType,
      priceRange: selectedPriceRange,
    };

    // Create search URL parameters
    const params = new URLSearchParams();

    if (selectedLocationIds.length > 0) {
      params.set("locations", selectedLocationIds.join(","));
    }

    if (selectedPropertyType) {
      params.set("propertyType", selectedPropertyType);
    }

    if (selectedPriceRange) {
      if (selectedPriceRange.min) {
        params.set("minPrice", selectedPriceRange.min.toString());
      }
      if (selectedPriceRange.max) {
        params.set("maxPrice", selectedPriceRange.max.toString());
      }
    }

    const searchUrl = `/properties?${params.toString()}`;

    if (onSearch) {
      onSearch(filters);
    } else {
      router.push(searchUrl);
    }

    // Close all dropdowns
    setShowLocationDropdown(false);
    setShowPropertyTypeDropdown(false);
    setShowPriceDropdown(false);
  }, [
    selectedLocationIds,
    selectedPropertyType,
    selectedPriceRange,
    onSearch,
    router,
  ]);

  // Get selected location names for display
  const getSelectedLocationNames = () => {
    const selected = locations.filter((loc) =>
      selectedLocationIds.includes(loc.id)
    );
    if (selected.length === 0) return "Location";
    if (selected.length === 1) return selected[0].name;
    return `${selected.length} locations`;
  };

  // Get selected property type label
  const getSelectedPropertyTypeLabel = () => {
    const type = propertyTypes.find((pt) => pt.key === selectedPropertyType);
    return type ? type.label : "Property type";
  };

  // Get selected price range label
  const getSelectedPriceLabel = () => {
    return selectedPriceRange ? selectedPriceRange.label : "Price";
  };

  // Helper function to get dropdown position
  const getDropdownPosition = useCallback(
    (
      ref: React.RefObject<HTMLDivElement | null>,
      align: "left" | "right" = "left"
    ) => {
      if (!ref.current) return {};

      const rect = ref.current.getBoundingClientRect();
      const style: React.CSSProperties = {
        position: "fixed",
        top: rect.bottom + 4,
        zIndex: 999999,
      };

      if (align === "right") {
        style.right = window.innerWidth - rect.right;
        style.width = 400; // Fixed width for price dropdown
      } else {
        style.left = rect.left;
        style.width = rect.width;
      }

      return style;
    },
    []
  );

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-lg">
        {/* Location Dropdown */}
        <div className="relative flex-1" ref={locationDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setShowLocationDropdown(!showLocationDropdown);
              setShowPropertyTypeDropdown(false);
              setShowPriceDropdown(false);
            }}
            className="w-full px-4 py-3 text-left border-r border-gray-200 hover:bg-gray-50 transition-colors rounded-l-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span
                className={
                  selectedLocationIds.length > 0
                    ? "text-gray-900"
                    : "text-gray-500"
                }
              >
                {getSelectedLocationNames()}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showLocationDropdown &&
            isMounted &&
            createPortal(
              <div
                data-dropdown-content
                className="bg-white border border-gray-200 rounded-lg shadow-2xl max-h-96 overflow-hidden"
                style={getDropdownPosition(locationDropdownRef)}
              >
                {/* Search input */}
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      placeholder="Search locations"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Location list */}
                <div className="max-h-64 overflow-y-auto" data-dropdown-content>
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading locations...
                    </div>
                  ) : filteredLocations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No locations found
                    </div>
                  ) : (
                    <>
                      {/* Major locations */}
                      {majorLocations.map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLocationSelect(location.id, true);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center">
                              {selectedLocationIds.includes(location.id) && (
                                <Check className="w-3 h-3 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {location.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {location.propertyCount} properties
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}

                      {/* Minor locations */}
                      {minorLocations.map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLocationSelect(location.id, false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center">
                              {selectedLocationIds.includes(location.id) && (
                                <Check className="w-3 h-3 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="text-gray-900">
                                {location.name}
                              </div>
                              {location.majorLocationName && (
                                <div className="text-sm text-gray-500">
                                  in {location.majorLocationName}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>,
              document.body
            )}
        </div>

        {/* Property Type Dropdown */}
        <div className="relative" ref={propertyTypeDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setShowPropertyTypeDropdown(!showPropertyTypeDropdown);
              setShowLocationDropdown(false);
              setShowPriceDropdown(false);
            }}
            className="px-4 py-3 text-left border-r border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-between min-w-[160px]"
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-400" />
              <span
                className={
                  selectedPropertyType ? "text-gray-900" : "text-gray-500"
                }
              >
                {getSelectedPropertyTypeLabel()}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showPropertyTypeDropdown &&
            isMounted &&
            createPortal(
              <div
                data-dropdown-content
                className="bg-white border border-gray-200 rounded-lg shadow-2xl"
                style={getDropdownPosition(propertyTypeDropdownRef)}
              >
                {propertyTypes.map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedPropertyType(type.key);
                      setShowPropertyTypeDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center justify-between"
                  >
                    <span className="text-gray-900">{type.label}</span>
                    {selectedPropertyType === type.key && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>,
              document.body
            )}
        </div>

        {/* Price Dropdown */}
        <div className="relative" ref={priceDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setShowPriceDropdown(!showPriceDropdown);
              setShowLocationDropdown(false);
              setShowPropertyTypeDropdown(false);
            }}
            className="px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between min-w-[140px]"
          >
            <span
              className={selectedPriceRange ? "text-gray-900" : "text-gray-500"}
            >
              {getSelectedPriceLabel()}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showPriceDropdown &&
            isMounted &&
            createPortal(
              <div
                data-dropdown-content
                className="bg-white border border-gray-200 rounded-lg shadow-2xl w-[400px]"
                style={getDropdownPosition(priceDropdownRef, "right")}
              >
                {/* Quick price selection */}
                <div className="p-4" data-dropdown-content>
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Quick price selection
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {priceRanges.map((range, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedPriceRange(range);
                            setShowPriceDropdown(false);
                          }}
                          className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                            selectedPriceRange === range
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual price entry */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Enter price manually
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Min Price, ₹
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          value={manualMinPrice}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          onChange={(e) => {
                            setManualMinPrice(e.target.value);
                            const minValue = e.target.value
                              ? parseInt(e.target.value)
                              : undefined;
                            const maxValue = manualMaxPrice
                              ? parseInt(manualMaxPrice)
                              : undefined;

                            if (minValue || maxValue) {
                              const formatPrice = (price: number) => {
                                if (price >= 10000000)
                                  return `${(price / 10000000).toFixed(1)}Cr`;
                                if (price >= 100000)
                                  return `${(price / 100000).toFixed(1)}L`;
                                return `${price}`;
                              };

                              setSelectedPriceRange({
                                min: minValue,
                                max: maxValue,
                                label: `₹${
                                  minValue ? formatPrice(minValue) : "0"
                                } - ₹${maxValue ? formatPrice(maxValue) : "∞"}`,
                              });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Max Price, ₹
                        </label>
                        <input
                          type="number"
                          placeholder="∞"
                          value={manualMaxPrice}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          onChange={(e) => {
                            setManualMaxPrice(e.target.value);
                            const maxValue = e.target.value
                              ? parseInt(e.target.value)
                              : undefined;
                            const minValue = manualMinPrice
                              ? parseInt(manualMinPrice)
                              : undefined;

                            if (minValue || maxValue) {
                              const formatPrice = (price: number) => {
                                if (price >= 10000000)
                                  return `${(price / 10000000).toFixed(1)}Cr`;
                                if (price >= 100000)
                                  return `${(price / 100000).toFixed(1)}L`;
                                return `${price}`;
                              };

                              setSelectedPriceRange({
                                min: minValue,
                                max: maxValue,
                                label: `₹${
                                  minValue ? formatPrice(minValue) : "0"
                                } - ₹${maxValue ? formatPrice(maxValue) : "∞"}`,
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedPriceRange(null);
                        setManualMinPrice("");
                        setManualMaxPrice("");
                        setShowPriceDropdown(false);
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPriceDropdown(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      {/* Clear filters */}
      {(selectedLocationIds.length > 0 ||
        selectedPropertyType ||
        selectedPriceRange) && (
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedLocationIds([]);
              setSelectedPropertyType("");
              setSelectedPriceRange(null);
              setManualMinPrice("");
              setManualMaxPrice("");
            }}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

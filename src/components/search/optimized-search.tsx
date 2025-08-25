"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  Home,
  Trees,
  Square,
  Building,
  Loader2,
  X,
  Brain,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Suggestion {
  type: "location" | "property_type" | "property";
  id: string;
  title: string;
  subtitle: string;
  value: string;
  slug?: string;
  key?: string;
  icon: string;
}

interface ParsedQuery {
  bedrooms?: number;
  propertyType?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  keywords?: string[];
  confidence: number;
}

interface SearchFilters {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  keywords?: string[];
  isNaturalLanguage?: boolean;
}

interface OptimizedSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string, filters?: SearchFilters) => void;
  showPropertyType?: boolean;
  variant?: "hero" | "page";
  enableNaturalLanguage?: boolean;
  showParsedQuery?: boolean;
}

const iconMap = {
  "map-pin": MapPin,
  home: Home,
  trees: Trees,
  square: Square,
  building: Building,
};

export function OptimizedSearch({
  placeholder = "Search properties by name, location, type...",
  className = "",
  onSearch,
  showPropertyType = true,
  variant = "hero",
  enableNaturalLanguage = true,
  showParsedQuery = true,
}: OptimizedSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  // Property types for the dropdown
  const propertyTypes = [
    { key: "", label: "All Properties" },
    { key: "VILLA", label: "Villas" },
    { key: "HOLIDAY_HOME", label: "Holiday Homes" },
    { key: "FARMLAND", label: "Managed Farmlands" },
    { key: "PLOT", label: "Plots" },
    { key: "APARTMENT", label: "Apartments" },
    { key: "RESIDENTIAL_PLOT", label: "Residential Plots" },
  ];

  // Simple and reliable search handler
  const handleSearch = useCallback(
    (searchQuery?: string, propertyTypeFilter?: string) => {
      const searchTerm = searchQuery || query;
      console.log("🔍 SEARCH TRIGGERED:", {
        searchTerm,
        propertyTypeFilter,
        selectedPropertyType,
        onSearch: !!onSearch,
      });

      // Don't search if empty
      if (!searchTerm.trim()) {
        console.log("❌ Empty search term, returning");
        return;
      }

      // Create search URL parameters
      const params = new URLSearchParams();
      params.set("search", searchTerm.trim());

      // Add property type if specified
      if (propertyTypeFilter) {
        params.set("propertyType", propertyTypeFilter);
      } else if (selectedPropertyType) {
        params.set("propertyType", selectedPropertyType);
      }

      const searchUrl = `/properties?${params.toString()}`;
      console.log("🚀 NAVIGATING TO:", searchUrl);

      // Always navigate to properties page with search parameters
      if (onSearch) {
        console.log("🔄 Using onSearch callback");
        onSearch(searchTerm.trim(), {
          propertyType: propertyTypeFilter || selectedPropertyType,
        });
      } else {
        console.log("🔄 Using router navigation");
        router.push(searchUrl);
      }

      setShowSuggestions(false);
    },
    [query, selectedPropertyType, onSearch, router]
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 FORM SUBMITTED with query:", query);
    handleSearch();
  };

  // Handle input change with debouncing for suggestions
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce suggestions
    if (value.trim().length > 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Fetch suggestions
  const fetchSuggestions = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 3) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.data || []);
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.value);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Navigate based on suggestion type
    if (suggestion.type === "location" && suggestion.slug) {
      router.push(`/locations/${suggestion.slug}`);
    } else if (suggestion.type === "property" && suggestion.slug) {
      router.push(`/properties/${suggestion.slug}`);
    } else {
      // General search
      handleSearch(
        suggestion.value,
        suggestion.type === "property_type" ? suggestion.key : undefined
      );
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => {
                  const IconComponent =
                    iconMap[suggestion.icon as keyof typeof iconMap] || Home;
                  return (
                    <button
                      key={`${suggestion.type}-${suggestion.id}`}
                      type="button"
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                        index === selectedIndex ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {suggestion.title}
                          </div>
                          {suggestion.subtitle && (
                            <div className="text-sm text-gray-500 truncate">
                              {suggestion.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {/* Property Type Dropdown (if enabled) */}
          {showPropertyType && (
            <select
              value={selectedPropertyType}
              onChange={(e) => setSelectedPropertyType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900 min-w-40"
            >
              {propertyTypes.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label}
                </option>
              ))}
            </select>
          )}

          {/* Search Button */}
          <Button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}

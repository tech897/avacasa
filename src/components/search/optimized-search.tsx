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
  amenities?: string[];
  features?: string[];
  keywords?: string[];
  originalQuery: string;
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
  variant?: "hero" | "header" | "page";
  enableNaturalLanguage?: boolean;
  showParsedQuery?: boolean;
}

const iconMap = {
  "map-pin": MapPin,
  home: Home,
  tree: Trees,
  square: Square,
  building: Building,
};

export function OptimizedSearch({
  placeholder = "Search property type, location, or keyword...",
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
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  const [isNaturalLanguage, setIsNaturalLanguage] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const parseDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Detect if query looks like natural language
  const detectNaturalLanguage = (searchTerm: string): boolean => {
    const nlPatterns = [
      /\d+\s*bhk/i, // "2 bhk", "3bhk"
      /\d+\s*bedroom/i, // "2 bedroom"
      /under|below|above|over|between/i, // Price patterns
      /\d+\s*(crore|lakh|cr|lac)/i, // Indian currency
      /in\s+\w+/i, // "in goa", "in bangalore"
      /holiday\s+home|managed\s+farm|farm\s*land|villa|apartment|residential\s+plot|plot/i, // Property types
    ];

    return (
      nlPatterns.some((pattern) => pattern.test(searchTerm)) &&
      searchTerm.split(" ").length >= 3
    );
  };

  // Parse natural language query
  const parseNaturalLanguage = useCallback(
    async (searchTerm: string) => {
      if (
        !enableNaturalLanguage ||
        !searchTerm.trim() ||
        searchTerm.length < 10
      ) {
        setParsedQuery(null);
        setIsNaturalLanguage(false);
        return;
      }

      const isNL = detectNaturalLanguage(searchTerm);
      setIsNaturalLanguage(isNL);

      if (!isNL) {
        setParsedQuery(null);
        return;
      }

      try {
        setParseLoading(true);
        const response = await fetch("/api/search/natural-language", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchTerm }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setParsedQuery(data.data.parsed);
          }
        }
      } catch (error) {
        console.error("Natural language parsing error:", error);
      } finally {
        setParseLoading(false);
      }
    },
    [enableNaturalLanguage]
  );

  // Debounced natural language parsing
  const debouncedNLParse = useCallback(
    (searchTerm: string) => {
      if (parseDebounceRef.current) {
        clearTimeout(parseDebounceRef.current);
      }

      parseDebounceRef.current = setTimeout(() => {
        parseNaturalLanguage(searchTerm);
      }, 500); // 500ms delay for NL parsing
    },
    [parseNaturalLanguage]
  );

  // Debounced search function
  const debouncedSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchTerm)}&limit=8`,
        { signal: abortControllerRef.current.signal }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.data);
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Search suggestions error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous debounces
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (parseDebounceRef.current) {
      clearTimeout(parseDebounceRef.current);
    }

    // Set new debounces
    debounceRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 300); // 300ms debounce for suggestions

    // Natural language parsing with longer delay
    if (enableNaturalLanguage) {
      debouncedNLParse(value);
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

  // Handle search submission
  const handleSearch = (searchQuery?: string, propertyTypeFilter?: string) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) return;

    // If we have a parsed natural language query, use its parameters
    if (isNaturalLanguage && parsedQuery && parsedQuery.confidence > 30) {
      const params = new URLSearchParams();

      if (parsedQuery.location) params.set("location", parsedQuery.location);
      if (parsedQuery.propertyType)
        params.set("propertyType", parsedQuery.propertyType);
      if (parsedQuery.bedrooms)
        params.set("bedrooms", parsedQuery.bedrooms.toString());
      if (parsedQuery.minPrice)
        params.set("minPrice", parsedQuery.minPrice.toString());
      if (parsedQuery.maxPrice)
        params.set("maxPrice", parsedQuery.maxPrice.toString());
      // Only include keywords as search if they exist and are different from the original query
      if (parsedQuery.keywords && parsedQuery.keywords.length > 0) {
        const keywordSearch = parsedQuery.keywords.join(" ");
        if (keywordSearch.toLowerCase() !== searchTerm.toLowerCase()) {
          params.set("search", keywordSearch);
        }
      }

      if (onSearch) {
        // For natural language, don't pass the original search term, only use parsed keywords
        const searchKeywords =
          parsedQuery.keywords && parsedQuery.keywords.length > 0
            ? parsedQuery.keywords.join(" ")
            : "";

        onSearch(searchKeywords, {
          location: parsedQuery.location,
          propertyType: parsedQuery.propertyType,
          bedrooms: parsedQuery.bedrooms,
          minPrice: parsedQuery.minPrice,
          maxPrice: parsedQuery.maxPrice,
          keywords: parsedQuery.keywords,
          isNaturalLanguage: true,
        });
      } else {
        router.push(`/properties?${params.toString()}`);
      }
    } else {
      // Fallback to regular search
      const params = new URLSearchParams();
      params.set("search", searchTerm);

      if (propertyTypeFilter) {
        params.set("propertyType", propertyTypeFilter);
      } else if (selectedPropertyType) {
        params.set("propertyType", selectedPropertyType);
      }

      if (onSearch) {
        onSearch(searchTerm, {
          propertyType: propertyTypeFilter || selectedPropertyType,
        });
      } else {
        router.push(`/properties?${params.toString()}`);
      }
    }

    setShowSuggestions(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (parseDebounceRef.current) {
        clearTimeout(parseDebounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Home;
    return IconComponent;
  };

  // Format price for display
  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(1)} L`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(1)} K`;
    }
    return price.toString();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className={`
          ${
            variant === "hero"
              ? "bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-full p-3 sm:p-2 shadow-2xl"
              : variant === "header"
              ? "flex gap-2"
              : "bg-white rounded-lg shadow-sm border p-2"
          }
        `}
      >
        <div
          className={`
          flex items-stretch gap-3
          ${variant === "hero" ? "flex-col lg:flex-row lg:gap-0" : "flex-row"}
        `}
        >
          {/* Search Input */}
          <div
            className={`
            flex-1 relative
            ${
              variant === "hero"
                ? "px-4 sm:px-6 py-3 lg:py-4 lg:border-r border-gray-200"
                : "px-3 py-2"
            }
          `}
          >
            <div className="text-left">
              {variant === "hero" && (
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Property Type & Keyword
                </label>
              )}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className={`
                    w-full bg-transparent border-0 focus:outline-none
                    ${
                      variant === "hero"
                        ? "text-gray-900 placeholder-gray-500 text-sm lg:text-base"
                        : "text-gray-900 placeholder-gray-500 text-sm"
                    }
                  `}
                />
                {(isLoading || parseLoading) && (
                  <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
                {isNaturalLanguage &&
                  enableNaturalLanguage &&
                  !parseLoading &&
                  !isLoading && (
                    <Brain className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500" />
                  )}
                {query && !isLoading && !parseLoading && !isNaturalLanguage && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSuggestions([]);
                      setShowSuggestions(false);
                      setParsedQuery(null);
                      setIsNaturalLanguage(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Property Type Filter (for hero variant) */}
          {showPropertyType && variant === "hero" && (
            <div className="px-4 sm:px-6 py-3 lg:py-4 min-w-0">
              <div className="text-left">
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Property Type
                </label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="w-full bg-transparent border-0 focus:outline-none text-gray-900 text-sm lg:text-base"
                >
                  {propertyTypes.map((type) => (
                    <option key={type.key} value={type.key}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Search Button */}
          <div
            className={`
            ${
              variant === "hero"
                ? "lg:pl-3 lg:pr-2 lg:flex lg:items-center"
                : "flex items-center"
            }
          `}
          >
            <Button
              type="submit"
              className={`
                ${
                  variant === "hero"
                    ? "w-full lg:w-auto h-12 lg:h-12 lg:w-12 rounded-xl lg:rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg transition-all duration-300 hover:scale-105 border-0 flex items-center justify-center gap-2 lg:gap-0"
                    : variant === "header"
                    ? "h-10 px-4"
                    : "h-10 px-6"
                }
              `}
            >
              <Search className="w-4 h-4" />
              {variant !== "hero" && <span className="ml-2">Search</span>}
              {variant === "hero" && <span className="lg:hidden">Search</span>}
            </Button>
          </div>
        </div>
      </form>

      {/* Natural Language Parsed Query Display */}
      {showParsedQuery &&
        isNaturalLanguage &&
        parsedQuery &&
        parsedQuery.confidence > 30 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 z-40">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  Natural Language Detected ({parsedQuery.confidence}%
                  confidence)
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  {parsedQuery.bedrooms && (
                    <div>• Bedrooms: {parsedQuery.bedrooms}</div>
                  )}
                  {parsedQuery.propertyType && (
                    <div>
                      • Type:{" "}
                      {parsedQuery.propertyType.replace("_", " ").toLowerCase()}
                    </div>
                  )}
                  {parsedQuery.location && (
                    <div>• Location: {parsedQuery.location}</div>
                  )}
                  {(parsedQuery.minPrice || parsedQuery.maxPrice) && (
                    <div>
                      • Price:{" "}
                      {parsedQuery.minPrice && parsedQuery.maxPrice
                        ? `₹${formatPrice(
                            parsedQuery.minPrice
                          )} - ₹${formatPrice(parsedQuery.maxPrice)}`
                        : parsedQuery.maxPrice
                        ? `Under ₹${formatPrice(parsedQuery.maxPrice)}`
                        : `Above ₹${formatPrice(parsedQuery.minPrice!)}`}
                    </div>
                  )}
                  {parsedQuery.keywords && parsedQuery.keywords.length > 0 && (
                    <div>• Keywords: {parsedQuery.keywords.join(", ")}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => {
            const IconComponent = getIconComponent(suggestion.icon);
            return (
              <button
                key={`${suggestion.type}-${suggestion.id}`}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`
                  w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-200
                  ${
                    index === selectedIndex ? "bg-gray-100" : "hover:bg-gray-50"
                  }
                  ${index === 0 ? "rounded-t-xl" : ""}
                  ${index === suggestions.length - 1 ? "rounded-b-xl" : ""}
                `}
              >
                <div className="flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {suggestion.subtitle}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={`
                    text-xs px-2 py-1 rounded-full
                    ${
                      suggestion.type === "location"
                        ? "bg-blue-100 text-blue-700"
                        : suggestion.type === "property_type"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  `}
                  >
                    {suggestion.type === "location"
                      ? "Location"
                      : suggestion.type === "property_type"
                      ? "Type"
                      : "Property"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

interface PropertyTypeMapping {
  [key: string]: string;
}

interface PriceUnit {
  [key: string]: number;
}

export class SearchParser {
  private propertyTypeMap: PropertyTypeMapping = {
    // Main property types - Holiday homes are typically villas in our database
    "holiday home": "VILLA",
    "holiday homes": "VILLA",
    "vacation home": "VILLA",
    "vacation homes": "VILLA",
    "resort home": "VILLA",

    villa: "VILLA",
    villas: "VILLA",
    "independent house": "VILLA",
    bungalow: "VILLA",
    bungalows: "VILLA",

    farmland: "FARMLAND",
    farmlands: "FARMLAND",
    "farm land": "FARMLAND",
    "farm house": "FARMLAND",
    "agriculture land": "FARMLAND",
    "agricultural land": "FARMLAND",

    plot: "PLOT",
    plots: "PLOT",
    land: "PLOT",
    site: "PLOT",
    sites: "PLOT",

    apartment: "APARTMENT",
    apartments: "APARTMENT",
    flat: "APARTMENT",
    flats: "APARTMENT",
    condo: "APARTMENT",
    condos: "APARTMENT",

    "residential plot": "RESIDENTIAL_PLOT",
    "residential plots": "RESIDENTIAL_PLOT",
    "residential land": "RESIDENTIAL_PLOT",
    "residential site": "RESIDENTIAL_PLOT",
  };

  private priceUnits: PriceUnit = {
    crore: 10000000,
    crores: 10000000,
    cr: 10000000,
    lakh: 100000,
    lakhs: 100000,
    lacs: 100000,
    lac: 100000,
    thousand: 1000,
    k: 1000,
    million: 1000000,
    billions: 1000000000,
  };

  private bedroomPatterns = [
    // BHK patterns
    /(\d+)\s*bhk/gi,
    /(\d+)\s*bk/gi,
    /(\d+)\s*b\.?h\.?k\.?/gi,

    // Bedroom patterns
    /(\d+)\s*bedroom/gi,
    /(\d+)\s*bedrooms/gi,
    /(\d+)\s*bed/gi,
    /(\d+)\s*beds/gi,
    /(\d+)\s*br/gi,

    // Text patterns
    /one\s+bedroom/gi,
    /two\s+bedroom/gi,
    /three\s+bedroom/gi,
    /four\s+bedroom/gi,
    /five\s+bedroom/gi,
    /six\s+bedroom/gi,

    // Alternative patterns
    /single\s+bedroom/gi,
    /double\s+bedroom/gi,
    /triple\s+bedroom/gi,
  ];

  private pricePatterns = [
    // Under/below patterns
    /(?:under|below|less\s+than|maximum|max|up\s+to)\s+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k|million)/gi,

    // Above/minimum patterns
    /(?:above|over|more\s+than|minimum|min|starting\s+from|from)\s+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k|million)/gi,

    // Between patterns
    /(?:between|from)\s+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k|million)\s+(?:to|-|and)\s+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k|million)/gi,

    // Budget patterns
    /(?:budget|price|cost)\s+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k|million)/gi,

    // Simple amount patterns
    /(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k|million)/gi,
  ];

  private locationPatterns = [
    // In/at location patterns
    /(?:in|at|near|around)\s+([a-zA-Z\s]+?)(?:\s+(?:area|city|district|state|region))?(?:\s|$|,|\.|!|\?)/gi,

    // Location-specific patterns
    /([a-zA-Z\s]+?)(?:\s+(?:properties|property|homes|villas|plots|apartments))/gi,
  ];

  private amenityPatterns = [
    /swimming\s+pool/gi,
    /gym/gi,
    /parking/gi,
    /garden/gi,
    /security/gi,
    /lift/gi,
    /elevator/gi,
    /balcony/gi,
    /terrace/gi,
    /club\s+house/gi,
    /playground/gi,
    /wifi/gi,
    /internet/gi,
    /ac/gi,
    /air\s+conditioning/gi,
    /furnished/gi,
    /semi\s+furnished/gi,
    /unfurnished/gi,
  ];

  public parse(query: string): ParsedQuery {
    const normalizedQuery = query.toLowerCase().trim();
    const result: ParsedQuery = {
      originalQuery: query,
      confidence: 0,
    };

    let confidence = 0;

    // Parse bedrooms
    const bedrooms = this.extractBedrooms(normalizedQuery);
    if (bedrooms) {
      result.bedrooms = bedrooms;
      confidence += 20;
    }

    // Parse property type
    const propertyType = this.extractPropertyType(normalizedQuery);
    if (propertyType) {
      result.propertyType = propertyType;
      confidence += 25;
    }

    // Parse location
    const location = this.extractLocation(normalizedQuery);
    if (location) {
      result.location = location;
      confidence += 20;
    }

    // Parse price range
    const priceRange = this.extractPriceRange(normalizedQuery);
    if (priceRange.minPrice || priceRange.maxPrice) {
      result.minPrice = priceRange.minPrice;
      result.maxPrice = priceRange.maxPrice;
      confidence += 15;
    }

    // Parse amenities
    const amenities = this.extractAmenities(normalizedQuery);
    if (amenities.length > 0) {
      result.amenities = amenities;
      confidence += 10;
    }

    // Extract remaining keywords
    const keywords = this.extractKeywords(normalizedQuery, result);
    if (keywords.length > 0) {
      result.keywords = keywords;
      confidence += 10;
    }

    result.confidence = Math.min(confidence, 100);

    return result;
  }

  private extractBedrooms(query: string): number | undefined {
    // Try each bedroom pattern
    for (const pattern of this.bedroomPatterns) {
      const match = pattern.exec(query);
      if (match) {
        const num = parseInt(match[1]);
        if (num > 0 && num <= 10) {
          return num;
        }
      }
      pattern.lastIndex = 0; // Reset regex
    }

    // Check for text numbers
    const textNumbers: { [key: string]: number } = {
      one: 1,
      single: 1,
      two: 2,
      double: 2,
      three: 3,
      triple: 3,
      four: 4,
      five: 5,
      six: 6,
    };

    for (const [text, num] of Object.entries(textNumbers)) {
      if (query.includes(text)) {
        return num;
      }
    }

    return undefined;
  }

  private extractPropertyType(query: string): string | undefined {
    // Sort by length to match longer phrases first
    const sortedTypes = Object.keys(this.propertyTypeMap).sort(
      (a, b) => b.length - a.length
    );

    for (const type of sortedTypes) {
      if (query.includes(type)) {
        return this.propertyTypeMap[type];
      }
    }

    return undefined;
  }

  private extractLocation(query: string): string | undefined {
    // Common Indian locations and cities for real estate
    const commonLocations = [
      "goa",
      "bangalore",
      "mumbai",
      "delhi",
      "chennai",
      "hyderabad",
      "pune",
      "kolkata",
      "coorg",
      "kodagu",
      "mysore",
      "ooty",
      "lonavala",
      "mahabaleshwar",
      "shimla",
      "manali",
      "mussoorie",
      "nainital",
      "darjeeling",
      "gangtok",
      "munnar",
      "wayanad",
      "chikmagalur",
      "sakleshpur",
      "yercaud",
      "kodaikanal",
      "coonoor",
      "karjat",
      "khandala",
      "alibag",
      "kashid",
      "diveagar",
      "gokarna",
      "hampi",
      "badami",
    ];

    // First check for exact matches with common locations
    for (const location of commonLocations) {
      if (query.includes(location)) {
        return location.charAt(0).toUpperCase() + location.slice(1);
      }
    }

    // Try location patterns
    for (const pattern of this.locationPatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(query);
      if (match && match[1]) {
        const location = match[1].trim();
        // Filter out common non-location words
        const excludeWords = [
          "properties",
          "property",
          "homes",
          "villas",
          "plots",
          "apartments",
          "with",
          "having",
          "good",
          "best",
          "new",
          "old",
        ];
        if (
          !excludeWords.includes(location.toLowerCase()) &&
          location.length > 2
        ) {
          return (
            location.charAt(0).toUpperCase() + location.slice(1).toLowerCase()
          );
        }
      }
    }

    return undefined;
  }

  private extractPriceRange(query: string): {
    minPrice?: number;
    maxPrice?: number;
  } {
    const result: { minPrice?: number; maxPrice?: number } = {};

    // Under/below patterns
    const underPattern =
      /(?:under|below|less\s+than|maximum|max|up\s+to)\s+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k|million)/gi;
    let match = underPattern.exec(query);
    if (match) {
      const amount = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      result.maxPrice = amount * (this.priceUnits[unit] || 1);
    }

    // Above/minimum patterns
    const abovePattern =
      /(?:above|over|more\s+than|minimum|min|starting\s+from|from)\s+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k|million)/gi;
    match = abovePattern.exec(query);
    if (match) {
      const amount = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      result.minPrice = amount * (this.priceUnits[unit] || 1);
    }

    // Between patterns
    const betweenPattern =
      /(?:between|from)\s+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k|million)\s+(?:to|-|and)\s+(?:rs\.?\s*)?(\d+(?:\.\d+)?)\s*(crore|crores|cr|lakh|lakhs|lac|lacs|thousand|k|million)/gi;
    match = betweenPattern.exec(query);
    if (match) {
      const minAmount = parseFloat(match[1]);
      const minUnit = match[2].toLowerCase();
      const maxAmount = parseFloat(match[3]);
      const maxUnit = match[4].toLowerCase();

      result.minPrice = minAmount * (this.priceUnits[minUnit] || 1);
      result.maxPrice = maxAmount * (this.priceUnits[maxUnit] || 1);
    }

    return result;
  }

  private extractAmenities(query: string): string[] {
    const amenities: string[] = [];

    for (const pattern of this.amenityPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(query)) {
        const amenity = pattern.source
          .replace(/\\s\+/g, " ")
          .replace(/\\\\/g, "");
        amenities.push(amenity);
      }
    }

    return [...new Set(amenities)]; // Remove duplicates
  }

  private extractKeywords(query: string, parsed: ParsedQuery): string[] {
    let remainingQuery = query.toLowerCase();

    // Remove already parsed parts
    if (parsed.bedrooms) {
      remainingQuery = remainingQuery.replace(
        /\d+\s*(?:bhk|bedroom|bed|br)/gi,
        ""
      );
    }
    if (parsed.propertyType) {
      for (const [key, value] of Object.entries(this.propertyTypeMap)) {
        if (value === parsed.propertyType) {
          remainingQuery = remainingQuery.replace(new RegExp(key, "gi"), "");
        }
      }
    }
    if (parsed.location) {
      remainingQuery = remainingQuery.replace(
        new RegExp(parsed.location, "gi"),
        ""
      );
    }

    // Remove price-related terms
    remainingQuery = remainingQuery.replace(
      /(?:under|below|above|over|between|from|to|rs\.?|\d+(?:\.\d+)?\s*(?:crore|lakh|thousand|cr|k))/gi,
      ""
    );

    // Remove common stop words
    const stopWords = [
      "in",
      "at",
      "near",
      "with",
      "having",
      "and",
      "or",
      "the",
      "a",
      "an",
      "is",
      "are",
      "for",
      "of",
      "to",
      "from",
    ];
    const words = remainingQuery
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 && !stopWords.includes(word) && !word.match(/^\d+$/)
      );

    return [...new Set(words)];
  }

  // Helper method to convert parsed query back to search parameters
  public toSearchParams(parsed: ParsedQuery): URLSearchParams {
    const params = new URLSearchParams();

    if (parsed.location) {
      params.set("location", parsed.location);
    }
    if (parsed.propertyType) {
      params.set("propertyType", parsed.propertyType);
    }
    if (parsed.bedrooms) {
      params.set("bedrooms", parsed.bedrooms.toString());
    }
    if (parsed.minPrice) {
      params.set("minPrice", parsed.minPrice.toString());
    }
    if (parsed.maxPrice) {
      params.set("maxPrice", parsed.maxPrice.toString());
    }
    if (parsed.keywords && parsed.keywords.length > 0) {
      params.set("search", parsed.keywords.join(" "));
    }

    return params;
  }

  // Helper method to generate human-readable summary
  public summarize(parsed: ParsedQuery): string {
    const parts: string[] = [];

    if (parsed.bedrooms) {
      parts.push(`${parsed.bedrooms} bedroom`);
    }
    if (parsed.propertyType) {
      const readableType = parsed.propertyType.toLowerCase().replace("_", " ");
      parts.push(readableType);
    }
    if (parsed.location) {
      parts.push(`in ${parsed.location}`);
    }
    if (parsed.minPrice || parsed.maxPrice) {
      if (parsed.minPrice && parsed.maxPrice) {
        parts.push(
          `₹${this.formatPrice(parsed.minPrice)} - ₹${this.formatPrice(
            parsed.maxPrice
          )}`
        );
      } else if (parsed.maxPrice) {
        parts.push(`under ₹${this.formatPrice(parsed.maxPrice)}`);
      } else if (parsed.minPrice) {
        parts.push(`above ₹${this.formatPrice(parsed.minPrice)}`);
      }
    }

    return parts.join(", ") || "General search";
  }

  private formatPrice(price: number): string {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(1)} L`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(1)} K`;
    }
    return price.toString();
  }
}

// Export a singleton instance
export const searchParser = new SearchParser();

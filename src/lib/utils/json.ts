/**
 * Safe JSON parsing utilities to prevent crashes from invalid JSON data
 */

export type SafeParseResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      fallback: T;
    };

/**
 * Safely parse JSON with fallback value
 */
export function safeJsonParse<T>(
  value: string | null | undefined,
  fallback: T,
  validator?: (data: any) => data is T
): T {
  if (!value || typeof value !== "string") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);

    // Use validator if provided
    if (validator && !validator(parsed)) {
      console.warn("JSON parse validation failed:", { value, parsed });
      return fallback;
    }

    return parsed;
  } catch (error) {
    console.warn("JSON parse error:", {
      value,
      error: error instanceof Error ? error.message : error,
    });

    // Try to handle common cases where plain text was stored instead of JSON
    if (Array.isArray(fallback)) {
      // For arrays, try to split by comma
      if (value.includes(",")) {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean) as T;
      } else if (value.trim()) {
        return [value.trim()] as T;
      }
    } else if (typeof fallback === "object" && fallback !== null) {
      // For objects, return object with the value
      return { value: value.trim() } as T;
    }

    return fallback;
  }
}

/**
 * Parse array from JSON or comma-separated string
 */
export function parseArray(value: string | null | undefined): string[] {
  return safeJsonParse(value, [], (data): data is string[] =>
    Array.isArray(data)
  );
}

/**
 * Parse object from JSON with fallback
 */
export function parseObject<T extends Record<string, any>>(
  value: string | null | undefined,
  fallback: T = {} as T
): T {
  return safeJsonParse(
    value,
    fallback,
    (data): data is T =>
      typeof data === "object" && data !== null && !Array.isArray(data)
  );
}

/**
 * Parse coordinates from JSON
 */
export function parseCoordinates(
  value: string | null | undefined
): { lat: number; lng: number } | null {
  const parsed = safeJsonParse(
    value,
    null,
    (data): data is { lat: number; lng: number } =>
      typeof data === "object" &&
      data !== null &&
      typeof data.lat === "number" &&
      typeof data.lng === "number"
  );

  return parsed;
}

/**
 * Parse nearby infrastructure with proper structure
 */
export function parseNearbyInfrastructure(value: string | null | undefined) {
  const defaultStructure = {
    educational: [] as Array<{ name: string; distance: string }>,
    healthcare: [] as Array<{ name: string; distance: string }>,
    shopping: [] as Array<{ name: string; distance: string }>,
    transportation: [] as Array<{ name: string; distance: string }>,
    attractions: [] as Array<{ name: string; distance?: string }>,
  };

  if (!value) return defaultStructure;

  try {
    const parsed = JSON.parse(value);

    // Convert string fields to proper arrays with objects
    const result = { ...defaultStructure };

    if (parsed.education && typeof parsed.education === "string") {
      result.educational = parsed.education
        .split(",")
        .filter((item: string) => item.trim())
        .map((item: string) => ({
          name: item.trim(),
          distance: "Contact for details",
        }));
    }

    if (parsed.healthcare && typeof parsed.healthcare === "string") {
      result.healthcare = parsed.healthcare
        .split(",")
        .filter((item: string) => item.trim())
        .map((item: string) => ({
          name: item.trim(),
          distance: "Contact for details",
        }));
    }

    if (parsed.shopping && typeof parsed.shopping === "string") {
      result.shopping = parsed.shopping
        .split(",")
        .filter((item: string) => item.trim())
        .map((item: string) => ({
          name: item.trim(),
          distance: "Contact for details",
        }));
    }

    // Handle transportation differently as it might have nested structure
    if (parsed.transport && typeof parsed.transport === "object") {
      result.transportation = [
        ...(parsed.transport.airport
          ? [
              {
                name: `Airport: ${parsed.transport.airport}`,
                distance: "Contact for details",
              },
            ]
          : []),
        ...(parsed.transport.bus
          ? [
              {
                name: `Bus: ${parsed.transport.bus}`,
                distance: "Contact for details",
              },
            ]
          : []),
        ...(parsed.transport.train
          ? [
              {
                name: `Train: ${parsed.transport.train}`,
                distance: "Contact for details",
              },
            ]
          : []),
        ...(parsed.transport.highway
          ? [
              {
                name: `Highway: ${parsed.transport.highway}`,
                distance: "Contact for details",
              },
            ]
          : []),
      ];
    }

    if (parsed.attractions && Array.isArray(parsed.attractions)) {
      result.attractions = parsed.attractions;
    }

    return result;
  } catch (error) {
    console.warn("Failed to parse nearby infrastructure:", { value, error });
    return defaultStructure;
  }
}

/**
 * Safely stringify JSON
 */
export function safeJsonStringify(value: any): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn("JSON stringify error:", { value, error });
    return "{}";
  }
}

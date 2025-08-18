/**
 * API-specific types for better type safety
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationData;
  meta?: Record<string, any>;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  featured?: boolean;
  search?: string;
  viewType?: string;
  bounds?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UnitConfiguration {
  type?: string;
  size?: string;
  price?: string;
}

export interface LegalApprovals {
  legal?: string;
  rera?: string;
}

export interface RegistrationCosts {
  stampDuty?: string;
  registration?: string;
  maintenance?: string;
}

export interface NearbyInfrastructure {
  educational: Array<{
    name: string;
    distance: string;
  }>;
  healthcare: Array<{
    name: string;
    distance: string;
  }>;
  shopping: Array<{
    name: string;
    distance: string;
  }>;
  transportation: Array<{
    name: string;
    distance: string;
  }>;
  attractions: Array<{
    name: string;
    distance?: string;
  }>;
}

export interface PropertySearchParams {
  q?: string;
  location?: string;
  type?: string;
  bedrooms?: string;
  minPrice?: string;
  maxPrice?: string;
  viewType?: string;
  page?: string;
  limit?: string;
  featured?: string;
  bounds?: string;
}

export interface BlogFilters {
  category?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: string;
  source?: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  iat: number;
  exp: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  validation?: ValidationError[];
}


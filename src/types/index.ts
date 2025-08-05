export interface Location {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  highlights: string[];
  amenities: Amenity[];
  featured: boolean;
  propertyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  location: Location;
  locationId: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floors: number;
  images: string[];
  amenities: Amenity[];
  features: Feature[];
  coordinates: {
    lat: number;
    lng: number;
  };
  status: PropertyStatus;
  featured: boolean;
  views: number;

  // New comprehensive fields
  unitConfiguration?: UnitConfiguration;
  aboutProject?: string;
  legalApprovals?: LegalApproval[];
  registrationCosts?: RegistrationCosts;
  propertyManagement?: PropertyManagement;
  financialReturns?: FinancialReturns;
  investmentBenefits?: string[];
  nearbyInfrastructure?: NearbyInfrastructure;
  plotSize?: string;
  constructionStatus?: string;
  possessionDate?: string;
  emiOptions?: EMIOptions;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];

  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  propertyId: string;
  property?: {
    id: string;
    title: string;
    location: string;
  };
  userId?: string;
  rating: number;
  review: string;
  name: string;
  email?: string;
  verified: boolean;
  helpful: number;
  status: RatingStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  property?: Property;
  name: string;
  email: string;
  phone: string;
  message?: string;
  preferredDate?: string;
  visitType: VisitType;
  budget?: string;
  status: InquiryStatus;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage: string;
  featured: boolean;
  publishedAt?: string;
  status: PostStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export interface Feature {
  id: string;
  name: string;
  icon?: string;
}

// Enums
export enum PropertyType {
  HOLIDAY_HOME = "HOLIDAY_HOME",
  FARMLAND = "FARMLAND",
  PLOT = "PLOT",
  VILLA = "VILLA",
  APARTMENT = "APARTMENT",
  RESIDENTIAL_PLOT = "RESIDENTIAL_PLOT",
}

export enum PropertyStatus {
  AVAILABLE = "AVAILABLE",
  SOLD = "SOLD",
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
}

export enum InquiryStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  SCHEDULED = "SCHEDULED",
  VISITED = "VISITED",
  INTERESTED = "INTERESTED",
  NEGOTIATING = "NEGOTIATING",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST",
}

export enum VisitType {
  SITE_VISIT = "SITE_VISIT",
  VIRTUAL_TOUR = "VIRTUAL_TOUR",
  OFFICE_MEETING = "OFFICE_MEETING",
  CALL_BACK = "CALL_BACK",
}

export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum RatingStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  FLAGGED = "FLAGGED",
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  success: boolean;
  message?: string;
}

// Form Types
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type?: string;
}

export interface InquiryFormData {
  name: string;
  email: string;
  phone: string;
  message?: string;
  preferredDate?: string;
  visitType: VisitType;
  budget?: string;
}

export interface NewsletterFormData {
  email: string;
  name?: string;
  interests?: string[];
}

// Filter Types
export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  featured?: boolean;
  viewType?: string; // Filter by view type (Lake View, Forest View, etc.)
  page: number;
  limit: number;
  sortBy?: "price" | "area" | "created" | "featured";
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
}

export interface NewsletterForm {
  email: string;
}

// New interfaces for comprehensive property details
export interface UnitConfiguration {
  [key: string]: {
    area: string;
    price: string;
    availability: string;
  };
}

export interface LegalApproval {
  name: string;
  status: string;
  date?: string;
  authority?: string;
}

export interface RegistrationCosts {
  stampDuty?: string;
  registrationFee?: string;
  legalCharges?: string;
  otherCharges?: string;
  total?: string;
}

export interface PropertyManagement {
  company?: string;
  services?: string[];
  contact?: string;
  charges?: string;
}

export interface FinancialReturns {
  expectedROI?: string;
  rentalYield?: string;
  appreciationRate?: string;
  paybackPeriod?: string;
}

export interface NearbyInfrastructure {
  educational?: InfrastructureItem[];
  healthcare?: InfrastructureItem[];
  transportation?: InfrastructureItem[];
  entertainment?: InfrastructureItem[];
  shopping?: InfrastructureItem[];
}

export interface InfrastructureItem {
  name: string;
  distance: string;
  type?: string;
}

export interface EMIOptions {
  bankPartners?: string[];
  interestRates?: string;
  maxTenure?: string;
  processingFee?: string;
}

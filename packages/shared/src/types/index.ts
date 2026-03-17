// ============================================================================
// Shared type definitions for all Payload CMS collections and globals
// ============================================================================

/** Rich text content stored as Lexical editor JSON nodes */
export type RichText = Record<string, unknown>[];

/** Relationship reference — Payload uses number IDs with PostgreSQL */
export type RelationshipRef = string | number;

// ----------------------------------------------------------------------------
// Base fields — present on every Payload collection document
// ----------------------------------------------------------------------------

export interface PayloadBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Collections
// ----------------------------------------------------------------------------

export interface User extends PayloadBase {
  email: string;
  // password is handled internally by Payload auth
}

export interface Media extends PayloadBase {
  alt: string;
  caption?: string | null;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
}

export interface ServiceCategory extends PayloadBase {
  name: string;
  slug: string;
  label?: string | null;
  headline?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  heroImage?: Media | RelationshipRef | null;
  color?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface ServiceBenefit {
  benefit?: string | null;
  id?: string | null;
}

export interface Service extends PayloadBase {
  title: string;
  slug: string;
  category: ServiceCategory | RelationshipRef;
  shortDescription?: string | null;
  longDescription?: RichText | null;
  startingPrice?: string | null;
  icon?: string | null;
  heroImage?: Media | RelationshipRef | null;
  benefits?: ServiceBenefit[] | null;
  ctaText?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface ServiceArea extends PayloadBase {
  cityName: string;
  slug: string;
  state?: string | null;
  lat: number;
  lng: number;
  radiusMiles?: number | null;
  responseTime?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface Certification {
  name?: string | null;
  file?: Media | RelationshipRef | null;
  fileType?: 'image' | 'pdf' | null;
  expiryDate?: string | null;
  isVerified?: boolean | null;
  id?: string | null;
}

export interface Specialty {
  specialty?: string | null;
  id?: string | null;
}

export interface TeamMember extends PayloadBase {
  name: string;
  role: string;
  experience?: string | null;
  bio?: string | null;
  photo: Media | RelationshipRef;
  specialties?: Specialty[] | null;
  certifications?: Certification[] | null;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface Review extends PayloadBase {
  customerName: string;
  starRating: number;
  reviewText: string;
  reviewDate?: string | null;
  source?: 'website' | 'google' | 'yelp' | 'manual' | null;
  isApproved: boolean;
  isFeatured: boolean;
}

export interface FAQ extends PayloadBase {
  question: string;
  answer: RichText;
  category?: 'general' | 'pricing' | 'services' | 'emergency' | null;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface GalleryItem extends PayloadBase {
  title: string;
  beforeImage: Media | RelationshipRef;
  afterImage: Media | RelationshipRef;
  description?: string | null;
  service?: Service | RelationshipRef | null;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface QuoteRequest extends PayloadBase {
  name: string;
  phone: string;
  email?: string | null;
  serviceType?: 'residential' | 'commercial' | 'automotive' | null;
  service?: Service | RelationshipRef | null;
  location?: string | null;
  photo?: Media | RelationshipRef | null;
  notes?: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  honeypot?: string | null;
}

export interface VehicleMake extends PayloadBase {
  name: string;
  logo?: Media | RelationshipRef | null;
  isActive: boolean;
  sortOrder?: number | null;
}

export interface VehicleModel extends PayloadBase {
  name: string;
  make: VehicleMake | RelationshipRef;
  supportedServices?: (Service | RelationshipRef)[] | null;
  isActive: boolean;
}

// ----------------------------------------------------------------------------
// Globals
// ----------------------------------------------------------------------------

export interface Address {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

export interface BusinessHours {
  day?: string | null;
  hours?: string | null;
  id?: string | null;
}

export interface SiteSettings {
  id: number;
  businessName?: string | null;
  tagline?: string | null;
  logo?: Media | RelationshipRef | null;
  phone?: string | null;
  email?: string | null;
  address?: Address | null;
  hours?: BusinessHours[] | null;
  responseTime?: string | null;
  defaultSeoTitle?: string | null;
  defaultSeoDescription?: string | null;
  analyticsId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageSection {
  sectionType?:
  | 'hero'
  | 'services'
  | 'reviews'
  | 'gallery'
  | 'quote'
  | 'vehicle-verifier'
  | 'team'
  | 'map'
  | 'faq'
  | 'contact'
  | 'visitor-counter'
  | null;
  heading?: string | null;
  subheading?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
  id?: string | null;
}

export interface HomepageLayout {
  id: number;
  sections?: HomepageSection[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItem {
  label?: string | null;
  href?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
  id?: string | null;
}

export interface Navigation {
  id: number;
  items?: NavigationItem[] | null;
  createdAt: string;
  updatedAt: string;
}

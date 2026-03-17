/**
 * Payload CMS API client.
 * Falls back to hardcoded data when the CMS is unreachable.
 */

const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3001';

interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  hasNextPage: boolean;
}

async function fetchCms<T>(path: string): Promise<T> {
  const res = await fetch(`${CMS_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`CMS ${res.status}: ${path}`);
  return res.json();
}

// ── Globals ──

export async function fetchSiteSettings() {
  return fetchCms<Record<string, unknown>>('/api/globals/site-settings');
}

export async function fetchHeroSettings() {
  return fetchCms<Record<string, unknown>>('/api/globals/hero-settings');
}

export async function fetchSectionsSettings() {
  return fetchCms<Record<string, unknown>>('/api/globals/sections-settings');
}

export async function fetchHomepageLayout() {
  return fetchCms<{ sections?: Array<Record<string, unknown>> }>('/api/globals/homepage-layout');
}

export async function fetchNavigation() {
  return fetchCms<{ items?: Array<Record<string, unknown>> }>('/api/globals/navigation');
}

// ── Collections ──

export async function fetchServices() {
  return fetchCms<PayloadListResponse<Record<string, unknown>>>('/api/services?limit=100&depth=1&where[isActive][equals]=true&sort=sortOrder');
}

export async function fetchServiceCategories() {
  return fetchCms<PayloadListResponse<Record<string, unknown>>>('/api/service-categories?limit=50&depth=0&where[isActive][equals]=true&sort=sortOrder');
}

export async function fetchReviews() {
  return fetchCms<PayloadListResponse<Record<string, unknown>>>('/api/reviews?limit=50&depth=0&where[isApproved][equals]=true&sort=-reviewDate');
}

export async function fetchFaqs() {
  return fetchCms<PayloadListResponse<Record<string, unknown>>>('/api/faqs?limit=50&depth=0&where[isActive][equals]=true&sort=sortOrder');
}

export async function fetchTeamMembers() {
  return fetchCms<PayloadListResponse<Record<string, unknown>>>('/api/team-members?limit=20&depth=1&where[isActive][equals]=true&sort=sortOrder');
}

export async function fetchServiceAreas() {
  return fetchCms<PayloadListResponse<Record<string, unknown>>>('/api/service-areas?limit=100&depth=0&where[isActive][equals]=true&sort=sortOrder');
}

export async function fetchGalleryItems() {
  return fetchCms<PayloadListResponse<Record<string, unknown>>>('/api/gallery-items?limit=50&depth=1&where[isActive][equals]=true&sort=sortOrder');
}

export async function fetchVehicleMakes() {
  return fetchCms<PayloadListResponse<Record<string, unknown>>>('/api/vehicle-makes?limit=50&depth=0&where[isActive][equals]=true&sort=sortOrder');
}

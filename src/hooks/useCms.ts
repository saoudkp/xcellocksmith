/**
 * React Query hooks for CMS data.
 * Each hook fetches from Payload and falls back to hardcoded data on error.
 */
import { useQuery } from '@tanstack/react-query';
import {
  fetchSiteSettings,
  fetchHeroSettings,
  fetchSectionsSettings,
  fetchHomepageLayout,
  fetchNavigation,
  fetchServices,
  fetchReviews,
  fetchFaqs,
  fetchTeamMembers,
  fetchServiceAreas,
  fetchGalleryItems,
  fetchVehicleMakes,
} from '@/lib/cms';
import {
  defaultBrand,
  defaultContact,
  defaultNavItems,
  defaultSections,
  type BrandConfig,
  type ContactConfig,
  type NavItem,
  type SectionConfig,
} from '@/data/siteConfig';
import type { RichContent } from '@/components/cms/RichTextHeading';
import { services as staticServices, type Service, type ServiceCategory } from '@/data/services';
import { reviews as staticReviews, type Review } from '@/data/reviews';
import { faqs as staticFaqs, type FAQ } from '@/data/faqs';
import { teamMembers as staticTeam, type TeamMember } from '@/data/team';
import { locations as staticLocations, type Location } from '@/data/locations';
import { vehicleMakes as staticVehicleMakes, type VehicleMake } from '@/data/vehicles';

// ---------------------------------------------------------------------------
// Minimal Lexical JSON type for rich text fields (frontend-only)
// ---------------------------------------------------------------------------

/** Serialised Lexical editor state — matches the shape stored by Payload richText fields. */
export interface LexicalJSON {
  root: {
    type: 'root';
    children: Array<{
      type: string;
      children: Array<{
        type: string;
        text?: string;
        version: number;
        format?: number;
        style?: string;
      }>;
      version: number;
    }>;
    version: number;
  };
}

const STALE = 5 * 60 * 1000; // 5 min

/** Detect if we're inside the Payload admin live preview iframe */
const isLivePreview = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

/** In live preview, use a short stale time so invalidations trigger refetches quickly */
const QUERY_STALE = isLivePreview ? 2_000 : STALE;

// ── Site Settings (brand + contact) ──

export function useSiteSettings() {
  return useQuery({
    queryKey: ['cms', 'site-settings'],
    queryFn: fetchSiteSettings,
    staleTime: QUERY_STALE,
    retry: 1,
  });
}

// ── Hero Settings ──

export interface StyledText {
  text: string;
  color: string;
  font: string;
}

export interface HeroBadge {
  text: string;
  icon: string;
}

export interface HeroCategoryLink {
  label: string;
  icon: string;
  color: string;
  href?: string;
}

export interface HeroConfig {
  headlineLine1: StyledText;
  headlineAccent: StyledText;
  headlineLine2: StyledText;
  subtitle: StyledText;
  subtitleBold: StyledText;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  ctaPrimaryColor: string;
  badges: HeroBadge[];
  responseLabel: StyledText;
  categoryLinks: HeroCategoryLink[];
}

const defaultHero: HeroConfig = {
  headlineLine1: { text: "Cleveland's Fastest", color: '#ffffff', font: 'font-display' },
  headlineAccent: { text: '24/7 Emergency', color: '#3b82f6', font: 'font-display' },
  headlineLine2: { text: 'Locksmith', color: '#ffffff', font: 'font-display' },
  subtitle: { text: 'Locked out? We handle residential, commercial & automotive emergencies.', color: '#ffffff', font: 'font-sans' },
  subtitleBold: { text: '20–30 min arrival.', color: '#ffffff', font: 'font-display' },
  ctaPrimaryText: 'Call Now',
  ctaSecondaryText: 'Get a Free Quote',
  ctaPrimaryColor: '#ef4444',
  badges: [
    { text: '24/7', icon: 'Clock' },
    { text: 'Licensed', icon: 'Shield' },
    { text: '5-Star', icon: 'Star' },
    { text: 'Ohio', icon: 'Award' },
  ],
  responseLabel: { text: 'Guaranteed response', color: '#ffffff', font: 'font-display' },
  categoryLinks: [
    { label: 'Residential', icon: 'Home', color: '#22c55e' },
    { label: 'Commercial', icon: 'Building2', color: '#3b82f6' },
    { label: 'Automotive', icon: 'Car', color: '#ef4444' },
  ],
};

function parseStyledText(raw: unknown, fallback: StyledText): StyledText {
  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Record<string, unknown>;
  return {
    text: (obj.text as string) || fallback.text,
    color: (obj.color as string) || fallback.color,
    font: (obj.font as string) || fallback.font,
  };
}

export function useHeroSettings(): HeroConfig {
  const { data } = useQuery({
    queryKey: ['cms', 'hero-settings'],
    queryFn: fetchHeroSettings,
    staleTime: QUERY_STALE,
    retry: 1,
  });

  if (!data) return defaultHero;

  const badges = (data.badges as Array<Record<string, unknown>> | undefined) || [];
  const catLinks = (data.categoryLinks as Array<Record<string, unknown>> | undefined) || [];

  return {
    headlineLine1: parseStyledText(data.headlineLine1, defaultHero.headlineLine1),
    headlineAccent: parseStyledText(data.headlineAccent, defaultHero.headlineAccent),
    headlineLine2: parseStyledText(data.headlineLine2, defaultHero.headlineLine2),
    subtitle: parseStyledText(data.subtitle, defaultHero.subtitle),
    subtitleBold: parseStyledText(data.subtitleBold, defaultHero.subtitleBold),
    ctaPrimaryText: (data.ctaPrimaryText as string) || defaultHero.ctaPrimaryText,
    ctaSecondaryText: (data.ctaSecondaryText as string) || defaultHero.ctaSecondaryText,
    ctaPrimaryColor: (data.ctaPrimaryColor as string) || defaultHero.ctaPrimaryColor,
    badges: badges.length > 0
      ? badges.map((b) => ({ text: (b.text as string) || '', icon: (b.icon as string) || 'Star' }))
      : defaultHero.badges,
    responseLabel: parseStyledText(data.responseLabel, defaultHero.responseLabel),
    categoryLinks: catLinks.length > 0
      ? catLinks.map((c) => ({
          label: (c.label as string) || '',
          icon: (c.icon as string) || 'Key',
          color: (c.color as string) || '#3b82f6',
          href: (c.href as string) || undefined,
        }))
      : defaultHero.categoryLinks,
  };
}

// ── Services Settings ──

export interface ServicesCategoryConfig {
  label: string;
  description: string;
  color: string;
  icon: string;
}

export interface ServicesConfig {
  sectionHeader: {
    heading: string;
    headingAccent: string;
    description: string;
    /** Rich text for heading — from WysiwygField or legacy Lexical. */
    richHeading?: RichContent;
    /** Rich text for accented word. */
    richAccent?: RichContent;
    /** Rich text for description. */
    richDescription?: RichContent;
  };
  residential: ServicesCategoryConfig;
  commercial: ServicesCategoryConfig;
  automotive: ServicesCategoryConfig;
}

const defaultServices: ServicesConfig = {
  sectionHeader: {
    heading: 'Complete Locksmith',
    headingAccent: 'Services',
    description: '29 professional locksmith services across residential, commercial & automotive — all backed by transparent pricing and our no-hidden-fees guarantee.',
  },
  residential: {
    label: 'Residential',
    description: 'Home lockouts, lock installation, rekeying, smart locks & more',
    color: '#22c55e',
    icon: 'Home',
  },
  commercial: {
    label: 'Commercial',
    description: 'Business security, access control, master key systems & more',
    color: '#3b82f6',
    icon: 'Building2',
  },
  automotive: {
    label: 'Automotive',
    description: 'Car lockouts, key programming, ignition repair & more',
    color: '#ef4444',
    icon: 'Car',
  },
};

export function useServicesSettings(): ServicesConfig {
  const { data } = useQuery({
    queryKey: ['cms', 'sections-settings'],
    queryFn: fetchSectionsSettings,
    staleTime: QUERY_STALE,
    retry: 1,
  });

  if (!data) return defaultServices;

  const sectionHeader = (data.services as Record<string, unknown>) || {};
  const residential = (data.residential as Record<string, unknown>) || {};
  const commercial = (data.commercial as Record<string, unknown>) || {};
  const automotive = (data.automotive as Record<string, unknown>) || {};

  return {
    sectionHeader: {
      heading: (sectionHeader.heading as string) || defaultServices.sectionHeader.heading,
      headingAccent: (sectionHeader.headingAccent as string) || defaultServices.sectionHeader.headingAccent,
      description: (sectionHeader.description as string) || defaultServices.sectionHeader.description,
      ...(sectionHeader.richHeading ? { richHeading: sectionHeader.richHeading as RichContent } : {}),
      ...(sectionHeader.richAccent ? { richAccent: sectionHeader.richAccent as RichContent } : {}),
      ...(sectionHeader.richDescription ? { richDescription: sectionHeader.richDescription as RichContent } : {}),
    },
    residential: {
      label: (residential.label as string) || defaultServices.residential.label,
      description: (residential.description as string) || defaultServices.residential.description,
      color: (residential.color as string) || defaultServices.residential.color,
      icon: (residential.icon as string) || defaultServices.residential.icon,
    },
    commercial: {
      label: (commercial.label as string) || defaultServices.commercial.label,
      description: (commercial.description as string) || defaultServices.commercial.description,
      color: (commercial.color as string) || defaultServices.commercial.color,
      icon: (commercial.icon as string) || defaultServices.commercial.icon,
    },
    automotive: {
      label: (automotive.label as string) || defaultServices.automotive.label,
      description: (automotive.description as string) || defaultServices.automotive.description,
      color: (automotive.color as string) || defaultServices.automotive.color,
      icon: (automotive.icon as string) || defaultServices.automotive.icon,
    },
  };
}

export function useBrand(): BrandConfig {
  const { data } = useSiteSettings();
  if (!data?.businessName) return defaultBrand;
  const phone = (data.phone as string) || defaultBrand.phoneDisplay;
  return {
    name: (data.businessName as string) || defaultBrand.name,
    tagline: (data.tagline as string) || defaultBrand.tagline,
    logoUrl: defaultBrand.logoUrl,
    phoneNumber: `tel:${phone.replace(/\D/g, '')}`,
    phoneDisplay: phone,
    responseTime: (data.responseTime as string) || defaultBrand.responseTime,
  };
}

export function useContact(): ContactConfig {
  const { data } = useSiteSettings();
  if (!data?.phone) return defaultContact;
  const phone = (data.phone as string) || defaultContact.phoneDisplay;
  const addr = data.address as Record<string, string> | undefined;
  return {
    phone: `tel:${phone.replace(/\D/g, '')}`,
    phoneDisplay: phone,
    email: (data.email as string) || defaultContact.email,
    address: addr
      ? `${addr.city || 'Cleveland'}, ${addr.state || 'OH'} & surrounding areas`
      : defaultContact.address,
    hours: defaultContact.hours,
  };
}


// ── Navigation ──

export function useNavigation(): NavItem[] {
  const { data } = useQuery({
    queryKey: ['cms', 'navigation'],
    queryFn: fetchNavigation,
    staleTime: QUERY_STALE,
    retry: 1,
  });
  if (!data?.items?.length) return defaultNavItems;
  return (data.items as Array<Record<string, unknown>>)
    .filter((i) => i.isActive !== false)
    .sort((a, b) => ((a.sortOrder as number) || 0) - ((b.sortOrder as number) || 0))
    .map((i, idx) => ({
      id: `nav-${idx}`,
      href: (i.href as string) || '#',
      label: (i.label as string) || '',
      isActive: true,
      order: (i.sortOrder as number) || idx,
    }));
}

// ── Homepage Sections ──

export function useSections(): SectionConfig[] {
  const { data } = useQuery({
    queryKey: ['cms', 'homepage-layout'],
    queryFn: fetchHomepageLayout,
    staleTime: QUERY_STALE,
    retry: 1,
  });
  if (!data?.sections?.length) return defaultSections;
  return (data.sections as Array<Record<string, unknown>>)
    .filter((s) => s.isActive !== false)
    .sort((a, b) => ((a.sortOrder as number) || 0) - ((b.sortOrder as number) || 0))
    .map((s) => ({
      id: (s.id as string) || (s.sectionType as string) || 'unknown',
      type: (s.sectionType as SectionConfig['type']) || 'hero',
      isActive: true,
      order: (s.sortOrder as number) || 0,
      heading: s.heading as string | undefined,
      subheading: s.subheading as string | undefined,
    }));
}

// ── Services ──

export function useServices(): Service[] {
  const { data } = useQuery({
    queryKey: ['cms', 'services'],
    queryFn: fetchServices,
    staleTime: QUERY_STALE,
    retry: 1,
  });
  if (!data?.docs?.length) return staticServices;
  const cmsUrl = import.meta.env.VITE_CMS_URL || 'http://localhost:3001';
  return data.docs.map((s) => {
    // Extract plain text from Lexical richText longDescription
    let longDesc = '';
    if (s.longDescription && typeof s.longDescription === 'object') {
      try {
        const root = (s.longDescription as Record<string, unknown>).root as Record<string, unknown>;
        const children = root?.children as Array<Record<string, unknown>>;
        longDesc = children
          ?.map((p) =>
            (p.children as Array<Record<string, unknown>>)
              ?.map((c) => c.text as string)
              .join('')
          )
          .join(' ') || '';
      } catch { /* ignore */ }
    } else if (typeof s.longDescription === 'string') {
      longDesc = s.longDescription;
    }

    // Extract benefits array
    const benefits = ((s.benefits as Array<Record<string, unknown>>) || [])
      .map((b) => (b.benefit as string) || '')
      .filter(Boolean);

    // Hero image URL
    const heroImg = (s.heroImage as Record<string, unknown>)?.url as string || '';
    const heroImageUrl = heroImg.startsWith('/') ? `${cmsUrl}${heroImg}` : heroImg;

    return {
      id: String(s.id),
      title: (s.title as string) || '',
      slug: (s.slug as string) || '',
      category: (((s.category as Record<string, unknown>)?.slug as string) || 'residential') as ServiceCategory,
      shortDescription: (s.shortDescription as string) || '',
      icon: (s.icon as string) || 'Key',
      isActive: true,
      longDescription: longDesc || undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      ctaText: (s.ctaText as string) || undefined,
      heroImageUrl: heroImageUrl || undefined,
    };
  });
}

// ── Reviews ──

export function useReviews(): Review[] {
  const { data } = useQuery({
    queryKey: ['cms', 'reviews'],
    queryFn: fetchReviews,
    staleTime: QUERY_STALE,
    retry: 1,
  });
  if (!data?.docs?.length) return staticReviews;
  return data.docs.map((r) => ({
    id: String(r.id),
    customerName: (r.customerName as string) || '',
    starRating: (r.starRating as number) || 5,
    reviewDate: (r.reviewDate as string) || new Date().toISOString().split('T')[0],
    reviewText: (r.reviewText as string) || '',
  }));
}

// ── FAQs ──

export function useFaqs(): FAQ[] {
  const { data } = useQuery({
    queryKey: ['cms', 'faqs'],
    queryFn: fetchFaqs,
    staleTime: QUERY_STALE,
    retry: 1,
  });
  if (!data?.docs?.length) return staticFaqs;
  return data.docs.map((f) => {
    // answer is richText (Lexical JSON) — extract plain text for now
    let answer = '';
    if (typeof f.answer === 'string') {
      answer = f.answer;
    } else if (f.answer && typeof f.answer === 'object') {
      // Lexical root → children → text nodes
      try {
        const root = (f.answer as Record<string, unknown>).root as Record<string, unknown>;
        const children = root?.children as Array<Record<string, unknown>>;
        answer = children
          ?.map((p) =>
            (p.children as Array<Record<string, unknown>>)
              ?.map((c) => c.text as string)
              .join('')
          )
          .join(' ') || '';
      } catch {
        answer = '';
      }
    }
    return {
      id: String(f.id),
      question: (f.question as string) || '',
      answer,
    };
  });
}

// ── Team Members ──

export function useTeamMembers(): { members: TeamMember[]; isLoading: boolean } {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cms', 'team-members'],
    queryFn: fetchTeamMembers,
    staleTime: QUERY_STALE,
    retry: 1,
  });
  // Only fall back to static data on error, not while loading
  if (isLoading) return { members: [], isLoading: true };
  if (isError || !data?.docs?.length) return { members: staticTeam, isLoading: false };
  const cmsUrl = import.meta.env.VITE_CMS_URL || 'http://localhost:3001';
  const resolveUrl = (url: string) => (url && url.startsWith('/') ? `${cmsUrl}${url}` : url);
  return {
    isLoading: false,
    members: data.docs.map((m) => ({
      id: String(m.id),
      name: (m.name as string) || '',
      role: (m.role as string) || '',
      experience: (m.experience as string) || '',
      bio: (m.bio as string) || '',
      certifications: ((m.certifications as Array<Record<string, unknown>>) || []).map((c) => ({
        name: (c.name as string) || '',
        fileUrl: resolveUrl(((c.file as Record<string, unknown>)?.url as string) || ''),
        fileType: (c.fileType as 'image' | 'pdf') || 'image',
      })),
      specialties: ((m.specialties as Array<Record<string, unknown>>) || []).map(
        (s) => (s.specialty as string) || ''
      ),
      photoUrl: resolveUrl(((m.photo as Record<string, unknown>)?.url as string) || ''),
      isActive: true,
    })),
  };
}

// ── Service Areas / Locations ──

export function useLocations(): Location[] {
  const { data } = useQuery({
    queryKey: ['cms', 'service-areas'],
    queryFn: fetchServiceAreas,
    staleTime: QUERY_STALE,
    retry: 1,
  });
  if (!data?.docs?.length) return staticLocations;
  return data.docs.map((l) => ({
    id: String(l.id),
    cityName: (l.cityName as string) || '',
    slug: (l.slug as string) || '',
    seoMetaTitle: (l.seoTitle as string) || '',
    seoMetaDescription: (l.seoDescription as string) || '',
    lat: (l.lat as number) || 0,
    lng: (l.lng as number) || 0,
    isActive: true,
  }));
}


// ── Vehicle Makes & Models ──

export function useVehicleMakes(): VehicleMake[] {
  const { data } = useQuery({
    queryKey: ['cms', 'vehicle-makes'],
    queryFn: fetchVehicleMakes,
    staleTime: QUERY_STALE,
    retry: 1,
  });

  if (!data?.docs?.length) return staticVehicleMakes;

  return data.docs.map((make) => {
    const inlineModels = (make.models as Array<Record<string, unknown>>) || [];
    return {
      id: String(make.id),
      name: (make.name as string) || '',
      logoUrl: (make.logoUrl as string) || ((make.logo as Record<string, unknown>)?.url as string) || '',
      models: inlineModels
        .filter((m) => m.isActive !== false)
        .map((m) => ({
          id: String(m.id || m.name),
          name: (m.name as string) || '',
          supportedServices: ((m.supportedServices as Array<Record<string, unknown>>) || []).map(
            (s) => (s.service as string) || ''
          ),
        })),
    };
  });
}

// ── Gallery Items ──

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  before: string;
  after: string;
  description?: string;
}

export function useGalleryItems(): GalleryItem[] | null {
  const { data } = useQuery({
    queryKey: ['cms', 'gallery-items'],
    queryFn: fetchGalleryItems,
    staleTime: QUERY_STALE,
    retry: 1,
  });

  if (!data?.docs?.length) return null;

  const cmsUrl = import.meta.env.VITE_CMS_URL || 'http://localhost:3001';

  return data.docs
    .filter((g) => g.isActive !== false)
    .sort((a, b) => ((a.sortOrder as number) || 0) - ((b.sortOrder as number) || 0))
    .map((g) => {
      const beforeUrl = (g.beforeImage as Record<string, unknown>)?.url as string || '';
      const afterUrl = (g.afterImage as Record<string, unknown>)?.url as string || '';
      return {
        id: String(g.id),
        title: (g.title as string) || '',
        category: (g.category as string) || '',
        subcategory: (g.subcategory as string) || '',
        before: beforeUrl.startsWith('/') ? `${cmsUrl}${beforeUrl}` : beforeUrl,
        after: afterUrl.startsWith('/') ? `${cmsUrl}${afterUrl}` : afterUrl,
        description: (g.description as string) || undefined,
      };
    });
}

// ── Sections Settings ──

export interface SectionHeading {
  heading: string;
  subheading: string;
  /** Rich text for heading — from WysiwygField or legacy Lexical. */
  richHeading?: RichContent;
  /** Rich text for subheading. */
  richSubheading?: RichContent;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  color: string;
}

export interface SectionsConfig {
  reviews: SectionHeading;
  gallery: SectionHeading;
  quote: SectionHeading;
  vehicleVerifier: SectionHeading;
  team: SectionHeading;
  serviceArea: SectionHeading;
  faq: SectionHeading;
  contact: SectionHeading & { socialLinks: SocialLink[] };
}

const defaultSectionsHeadings: SectionsConfig = {
  reviews: {
    heading: 'What Our Customers Say',
    subheading: 'Real reviews from real Cleveland area customers',
  },
  gallery: {
    heading: 'Before & After Gallery',
    subheading: 'Browse our work across residential, automotive & commercial locksmithing. Click a category to see all projects.',
  },
  quote: {
    heading: 'Get a Free Quote in Seconds',
    subheading: "Tell us what you need and we'll give you an upfront price — no surprises, no hidden fees.",
  },
  vehicleVerifier: {
    heading: 'Vehicle Compatibility Check',
    subheading: 'Select your vehicle make and model to verify which automotive locksmith services we support.',
  },
  team: {
    heading: 'Meet Our Expert Team',
    subheading: 'Licensed, certified, and background-checked professionals with decades of combined locksmith experience serving Cleveland and surrounding communities.',
  },
  serviceArea: {
    heading: 'Our Service Area',
    subheading: 'Serving Cleveland and 24 surrounding communities with fast 20–30 minute response times.',
  },
  faq: {
    heading: 'Frequently Asked Questions',
    subheading: "Get answers to the most common locksmith questions. Still have questions? Call us 24/7.",
  },
  contact: {
    heading: 'Get in Touch',
    subheading: "Reach us anytime — we're always just a call, text, or message away.",
    socialLinks: [],
  },
};

export function useSectionsSettings(): SectionsConfig {
  const { data } = useQuery({
    queryKey: ['cms', 'sections-settings'],
    queryFn: fetchSectionsSettings,
    staleTime: QUERY_STALE,
    retry: 1,
  });

  if (!data) return defaultSectionsHeadings;

  const parseSection = (key: string): SectionHeading => {
    const section = (data[key] as Record<string, unknown>) || {};
    return {
      heading: (section.heading as string) || defaultSectionsHeadings[key as keyof SectionsConfig].heading,
      subheading: (section.subheading as string) || defaultSectionsHeadings[key as keyof SectionsConfig].subheading,
      ...(section.richHeading ? { richHeading: section.richHeading as RichContent } : {}),
      ...(section.richSubheading ? { richSubheading: section.richSubheading as RichContent } : {}),
    };
  };

  const contactData = (data.contact as Record<string, unknown>) || {};
  const socialLinks = (contactData.socialLinks as Array<Record<string, unknown>>) || [];

  return {
    reviews: parseSection('reviews'),
    gallery: parseSection('gallery'),
    quote: parseSection('quote'),
    vehicleVerifier: parseSection('vehicleVerifier'),
    team: parseSection('team'),
    serviceArea: parseSection('serviceArea'),
    faq: parseSection('faq'),
    contact: {
      heading: (contactData.heading as string) || defaultSectionsHeadings.contact.heading,
      subheading: (contactData.subheading as string) || defaultSectionsHeadings.contact.subheading,
      ...(contactData.richHeading ? { richHeading: contactData.richHeading as RichContent } : {}),
      ...(contactData.richSubheading ? { richSubheading: contactData.richSubheading as RichContent } : {}),
      socialLinks: socialLinks.map((link) => ({
        platform: (link.platform as string) || '',
        url: (link.url as string) || '',
        icon: (link.icon as string) || 'Globe',
        color: (link.color as string) || '#3b82f6',
      })),
    },
  };
}

// ── CMS Ready (loading gate for initial page render) ──

export function useCmsReady(): boolean {
  const siteSettings = useQuery({
    queryKey: ['cms', 'site-settings'],
    queryFn: fetchSiteSettings,
    staleTime: QUERY_STALE,
    retry: 1,
  });
  const heroSettings = useQuery({
    queryKey: ['cms', 'hero-settings'],
    queryFn: fetchHeroSettings,
    staleTime: QUERY_STALE,
    retry: 1,
  });
  const homepageLayout = useQuery({
    queryKey: ['cms', 'homepage-layout'],
    queryFn: fetchHomepageLayout,
    staleTime: QUERY_STALE,
    retry: 1,
  });

  // Ready when all critical queries have settled (success or error)
  return !siteSettings.isLoading && !heroSettings.isLoading && !homepageLayout.isLoading;
}

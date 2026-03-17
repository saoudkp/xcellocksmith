/**
 * Data mapper functions that transform existing static data files
 * into Payload CMS collection-compatible records for seeding.
 */

import { services } from '../../../../src/data/services'
import { locations } from '../../../../src/data/locations'
import { reviews } from '../../../../src/data/reviews'
import { faqs } from '../../../../src/data/faqs'
import { teamMembers } from '../../../../src/data/team'
import { vehicleMakes } from '../../../../src/data/vehicles'

/**
 * Inline service details — extracted from serviceDetails.ts without image imports.
 * The original file uses frontend asset imports (import ... from "@/assets/...")
 * which don't work in the CMS context, so we duplicate the text data here.
 */
const serviceDetailsMap: Record<
  string,
  { longDescription: string; benefits: string[]; ctaText: string }
> = {
  'house-lockout-services': {
    longDescription:
      'Getting locked out of your home is stressful, especially late at night or in bad weather. Our certified technicians arrive within 20–30 minutes with professional tools to open your door without damaging your locks, door frame, or finish. We serve all of Greater Cleveland 24/7/365 — no extra charge for nights, weekends, or holidays.',
    benefits: [
      'No damage to locks or doors',
      '20–30 minute response time',
      'No hidden fees — price quoted upfront',
      'Available 24/7 including holidays',
    ],
    ctaText: 'Locked Out? Call Now for Immediate Help',
  },
  'lock-installation-replacement': {
    longDescription:
      'Whether you\'re upgrading an old lock or installing one on a brand-new door, our technicians recommend and install top-rated brands like Schlage, Kwikset, and Medeco. We match the right lock grade to your security needs and ensure perfect alignment for years of trouble-free use.',
    benefits: [
      'Top-brand locks installed',
      'Grade-1 and Grade-2 options',
      'Perfect fit guaranteed',
      'Free security assessment included',
    ],
    ctaText: 'Upgrade Your Home Security Today',
  },
  'lock-repair': {
    longDescription:
      'Stuck, jammed, or broken locks are more than an inconvenience — they\'re a security risk. Our locksmiths diagnose and repair all lock types including deadbolts, mortise locks, and smart locks. We carry common parts on our service vehicles so most repairs are completed in a single visit.',
    benefits: [
      'Same-visit repairs',
      'All lock types serviced',
      'Parts carried on-board',
      'Warranty on all repairs',
    ],
    ctaText: 'Fix Your Broken Lock — Call Now',
  },
  'lock-rekeying': {
    longDescription:
      'Rekeying is the most cost-effective way to secure your home after moving in, losing a key, or ending a roommate arrangement. We change the internal pins so old keys no longer work, and provide you with fresh new keys — all without replacing the entire lock hardware.',
    benefits: [
      'Fraction of replacement cost',
      'Old keys instantly disabled',
      'Same-day service available',
      'Multiple locks rekeyed to one key',
    ],
    ctaText: 'Rekey Your Locks for Peace of Mind',
  },
  'key-duplication-spare-keys': {
    longDescription:
      'Don\'t wait until you\'re locked out. Get spare keys cut with precision for every door in your home. We duplicate standard keys, high-security keys, and restricted keyway keys on-site using professional-grade machines.',
    benefits: [
      'Precision-cut duplicates',
      'High-security keys available',
      'On-site cutting',
      'Bulk discounts for multiple keys',
    ],
    ctaText: 'Get Spare Keys Cut Today',
  },
  'high-security-locks': {
    longDescription:
      'Protect your home against picking, bumping, and drilling attacks with UL-listed high-security locks from Medeco, Mul-T-Lock, and ASSA ABLOY. These locks feature patented key control, hardened steel components, and pick-resistant pin systems.',
    benefits: [
      'Pick, bump & drill resistant',
      'Patented key control',
      'UL-listed hardware',
      'Insurance premium reduction',
    ],
    ctaText: 'Upgrade to Maximum Security',
  },
  'smart-lock-installation': {
    longDescription:
      'Go keyless with smart lock installation. We install and configure locks from August, Yale, Schlage Encode, and more. Control access from your phone, set auto-lock schedules, grant temporary guest codes, and integrate with Alexa or Google Home.',
    benefits: [
      'Keyless convenience',
      'Remote access & monitoring',
      'Temporary guest codes',
      'Smart home integration',
    ],
    ctaText: 'Go Keyless — Schedule Installation',
  },
  'deadbolt-installation-repair': {
    longDescription:
      'A quality deadbolt is your first line of defense. We install single-cylinder, double-cylinder, and smart deadbolts with reinforced strike plates and 3-inch screws for maximum kick-in resistance.',
    benefits: [
      'Reinforced strike plates',
      'Kick-in resistant installation',
      'Multiple deadbolt styles',
      'Same-day service',
    ],
    ctaText: 'Reinforce Your Door Security',
  },
  'mailbox-gate-locks': {
    longDescription:
      'Protect your mail from theft and secure your property perimeter with professional mailbox and gate lock installation. We service USPS-approved mailbox locks, gate latches, and padlocks for fences and sheds.',
    benefits: [
      'USPS-approved options',
      'Weather-resistant hardware',
      'Gate & fence solutions',
      'Padlock keyed-alike service',
    ],
    ctaText: 'Secure Your Property Perimeter',
  },
  'master-key-systems-residential': {
    longDescription:
      'Simplify your keychain with a master key system. One key opens every door in your home while each family member can have unique keys for specific areas. Perfect for multi-unit properties or homes with many entry points.',
    benefits: [
      'One key for all doors',
      'Individual sub-keys available',
      'Scalable system design',
      'Professional installation',
    ],
    ctaText: 'Simplify Your Access — Get a Quote',
  },
  'commercial-lockout-services': {
    longDescription:
      'Every minute your business is locked up costs money. Our commercial lockout team arrives fast with specialized tools for office doors, storefronts, warehouses, and industrial facilities. We work quickly and cleanly to minimize downtime.',
    benefits: [
      'Rapid commercial response',
      'Specialized business tools',
      'Minimal downtime',
      'After-hours availability',
    ],
    ctaText: 'Get Your Business Open — Call Now',
  },
  'business-lock-installation-repair': {
    longDescription:
      'Commercial properties demand Grade-1 locks that withstand heavy daily use. We install and repair commercial-grade hardware from Corbin Russwin, BEST, and Sargent for offices, storefronts, and warehouses.',
    benefits: [
      'Grade-1 commercial hardware',
      'Heavy-duty daily use rated',
      'Top commercial brands',
      'ADA-compliant options',
    ],
    ctaText: 'Protect Your Business Today',
  },
  'commercial-rekeying': {
    longDescription:
      'Employee turnover, security breaches, or lost keys? Rekey all your business locks efficiently in one visit. We can also set up a restricted keyway so keys cannot be copied without your authorization.',
    benefits: [
      'One-visit full rekeying',
      'Restricted keyway available',
      'Employee access management',
      'Cost-effective security reset',
    ],
    ctaText: 'Reset Your Business Security',
  },
  'master-key-system-design': {
    longDescription:
      'Design a hierarchical access system where managers have master keys, department heads have sub-masters, and employees have individual keys. We engineer systems for buildings of any size with full documentation.',
    benefits: [
      'Custom hierarchy design',
      'Full documentation provided',
      'Scalable for any building',
      'Restricted key duplication',
    ],
    ctaText: 'Design Your Access System',
  },
  'access-control-systems': {
    longDescription:
      'Upgrade from keys to electronic access control. We install and maintain keypad entry, proximity card readers, biometric scanners, and cloud-managed systems that let you control who enters, when, and track every access event.',
    benefits: [
      'Keypad, card & biometric options',
      'Cloud-managed access logs',
      'Time-based access rules',
      'Integration with security systems',
    ],
    ctaText: 'Modernize Your Access Control',
  },
  'high-security-commercial-locks': {
    longDescription:
      'For banks, jewelry stores, data centers, and high-value properties, we install maximum-security hardware with anti-pick, anti-drill, and anti-snap protections plus patented key control systems.',
    benefits: [
      'Maximum security rating',
      'Patented key control',
      'Insurance-grade hardware',
      'Tamper-evident features',
    ],
    ctaText: 'Maximum Security for Your Business',
  },
  'office-storefront-locks': {
    longDescription:
      'From aluminum storefront doors to solid-core office doors, we install the right lock for every commercial door type including mortise locks, cylindrical locks, and glass door locks.',
    benefits: [
      'All door types supported',
      'Storefront specialists',
      'Glass door solutions',
      'ADA-compliant hardware',
    ],
    ctaText: 'Professional Lock Solutions',
  },
  'panic-bars-exit-devices': {
    longDescription:
      'Stay code-compliant with professionally installed panic bars and exit devices. We install, repair, and maintain push bars, rim exit devices, and vertical rod assemblies per NFPA and local fire codes.',
    benefits: [
      'Fire code compliant',
      'Professional installation',
      'Repair & maintenance',
      'Multiple device types',
    ],
    ctaText: 'Stay Compliant — Get Installed Today',
  },
  'file-cabinet-desk-locks': {
    longDescription:
      'Protect sensitive documents, employee files, and valuable equipment with secure file cabinet and desk locks. We open, repair, rekey, and replace locks on all major furniture brands.',
    benefits: [
      'All furniture brands',
      'Open locked cabinets',
      'Rekey existing locks',
      'High-security upgrades',
    ],
    ctaText: 'Secure Your Sensitive Documents',
  },
  'key-control-restricted-keys': {
    longDescription:
      'Prevent unauthorized key duplication with patented restricted key systems. Keys can only be cut by authorized dealers with proper credentials, giving you complete control over who has access.',
    benefits: [
      'Unauthorized duplication impossible',
      'Complete access control',
      'Audit trail available',
      'Dealer-only key cutting',
    ],
    ctaText: 'Take Control of Your Keys',
  },
  'car-lockout-services': {
    longDescription:
      'Locked your keys in the car? Our mobile automotive locksmiths reach you fast anywhere in Greater Cleveland. We use professional auto-entry tools that won\'t scratch your paint, damage weatherstripping, or trigger your alarm.',
    benefits: [
      'No vehicle damage guaranteed',
      'All makes and models',
      'Parking lot & roadside service',
      '20–30 minute arrival',
    ],
    ctaText: 'Locked Out of Your Car? Call Now',
  },
  'car-key-replacement': {
    longDescription:
      'Lost all your car keys? No need for an expensive dealer visit or tow. We cut and program new keys on-site for most makes and models at a fraction of dealership prices. Transponder, remote-head, and smart keys all available.',
    benefits: [
      '60-70% less than dealer',
      'On-site programming',
      'All key types available',
      'No tow needed',
    ],
    ctaText: 'Get New Car Keys — Save vs Dealer',
  },
  'transponder-key-programming': {
    longDescription:
      'Modern vehicles use transponder chips for anti-theft protection. We program new transponder keys and clone existing ones using professional-grade equipment compatible with Ford, GM, Toyota, Honda, Nissan, and more.',
    benefits: [
      'Professional-grade equipment',
      'Most makes & models',
      'Anti-theft chip programming',
      'Fraction of dealer cost',
    ],
    ctaText: 'Program Your Transponder Key',
  },
  'remote-key-fob-programming': {
    longDescription:
      'Get your remote key fob, smart key, or push-to-start fob programmed without visiting the dealer. We program OEM and aftermarket remotes for keyless entry, trunk release, and panic button functions.',
    benefits: [
      'OEM & aftermarket fobs',
      'Keyless entry programming',
      'Push-to-start capable',
      'Same-day service',
    ],
    ctaText: 'Program Your Key Fob Today',
  },
  'ignition-repair-replacement': {
    longDescription:
      'If your key won\'t turn, gets stuck, or the ignition cylinder is worn out, we repair and replace ignition systems on-site. No tow truck needed — we come to you with all necessary parts and equipment.',
    benefits: [
      'On-site ignition repair',
      'No tow required',
      'Worn cylinder replacement',
      'Key extraction included',
    ],
    ctaText: 'Fix Your Ignition — Call Now',
  },
  'ignition-key-cutting-rebuilding': {
    longDescription:
      'We precision-cut new ignition keys using your vehicle\'s key code and rebuild worn ignition cylinders to factory specifications. This restores smooth key operation and reliable starting.',
    benefits: [
      'Precision key code cutting',
      'Cylinder rebuilding',
      'Factory-spec restoration',
      'Smooth operation guaranteed',
    ],
    ctaText: 'Get Your Ignition Restored',
  },
  'broken-key-extraction': {
    longDescription:
      'A broken key stuck in your lock or ignition needs professional extraction to avoid further damage. Our technicians use specialized extraction tools to safely remove broken fragments and can cut a new key on the spot.',
    benefits: [
      'Safe fragment removal',
      'No lock damage',
      'New key cut on-site',
      'Works on all lock types',
    ],
    ctaText: 'Extract Your Broken Key Now',
  },
  'key-decoding-vin-key-generation': {
    longDescription:
      'When all keys are lost, we can generate a new key using your Vehicle Identification Number (VIN). This process creates a factory-correct key without needing the original — saving you a dealer visit and tow.',
    benefits: [
      'No original key needed',
      'VIN-based generation',
      'Factory-correct cut',
      'Saves dealer & tow costs',
    ],
    ctaText: 'Generate a Key from Your VIN',
  },
  'automotive-lock-rekeying': {
    longDescription:
      'After a theft attempt or lost keys, rekeying your vehicle\'s door and trunk locks ensures old keys no longer work. We rekey to match your new ignition key for single-key convenience.',
    benefits: [
      'Old keys disabled',
      'Matched to ignition key',
      'Theft recovery security',
      'Cost-effective solution',
    ],
    ctaText: 'Rekey Your Vehicle Locks',
  },
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wraps a plain text string in Lexical richText JSON format
 * compatible with Payload CMS's lexical editor.
 */
export function toLexicalRichText(text: string): Record<string, unknown> {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ---------------------------------------------------------------------------
// Service Categories (3)
// ---------------------------------------------------------------------------

export interface ServiceCategorySeed {
  name: string
  slug: string
  isActive: boolean
}

export function getServiceCategories(): ServiceCategorySeed[] {
  return [
    { name: 'Residential', slug: 'residential', isActive: true },
    { name: 'Commercial', slug: 'commercial', isActive: true },
    { name: 'Automotive', slug: 'automotive', isActive: true },
  ]
}

// ---------------------------------------------------------------------------
// Services (29) — merged from services.ts + serviceDetails
// ---------------------------------------------------------------------------

export interface ServiceSeed {
  title: string
  slug: string
  categorySlug: string
  shortDescription: string
  longDescription: Record<string, unknown> | undefined
  icon: string
  isActive: boolean
  benefits: Array<{ benefit: string }> | undefined
  ctaText: string | undefined
}

export function getServices(): ServiceSeed[] {
  return services.map((svc) => {
    const detail = serviceDetailsMap[svc.slug]
    return {
      title: svc.title,
      slug: svc.slug,
      categorySlug: svc.category,
      shortDescription: svc.shortDescription,
      longDescription: detail ? toLexicalRichText(detail.longDescription) : undefined,
      icon: svc.icon,
      isActive: svc.isActive,
      benefits: detail ? detail.benefits.map((b) => ({ benefit: b })) : undefined,
      ctaText: detail?.ctaText,
    }
  })
}

// ---------------------------------------------------------------------------
// Service Areas (24)
// ---------------------------------------------------------------------------

export interface ServiceAreaSeed {
  cityName: string
  slug: string
  state: string
  lat: number
  lng: number
  seoTitle: string
  seoDescription: string
  isActive: boolean
}

export function getServiceAreas(): ServiceAreaSeed[] {
  return locations.map((loc) => ({
    cityName: loc.cityName,
    slug: loc.slug,
    state: 'OH',
    lat: loc.lat,
    lng: loc.lng,
    seoTitle: loc.seoMetaTitle,
    seoDescription: loc.seoMetaDescription,
    isActive: loc.isActive,
  }))
}

// ---------------------------------------------------------------------------
// Team Members (4) with Certifications (12 total)
// ---------------------------------------------------------------------------

export interface CertificationSeed {
  name: string
  fileType: 'image' | 'pdf'
}

export interface TeamMemberSeed {
  name: string
  role: string
  experience: string
  bio: string
  specialties: Array<{ specialty: string }>
  certifications: CertificationSeed[]
  isActive: boolean
}

export function getTeamMembers(): TeamMemberSeed[] {
  return teamMembers.map((tm) => ({
    name: tm.name,
    role: tm.role,
    experience: tm.experience,
    bio: tm.bio,
    specialties: tm.specialties.map((s) => ({ specialty: s })),
    certifications: tm.certifications.map((c) => ({
      name: c.name,
      fileType: c.fileType,
    })),
    isActive: tm.isActive,
  }))
}

// ---------------------------------------------------------------------------
// Reviews (5) — all seeded as approved
// ---------------------------------------------------------------------------

export interface ReviewSeed {
  customerName: string
  starRating: number
  reviewText: string
  reviewDate: string
  source: 'website'
  isApproved: true
}

export function getReviews(): ReviewSeed[] {
  return reviews.map((r) => ({
    customerName: r.customerName,
    starRating: r.starRating,
    reviewText: r.reviewText,
    reviewDate: r.reviewDate,
    source: 'website' as const,
    isApproved: true as const,
  }))
}

// ---------------------------------------------------------------------------
// FAQs (7)
// ---------------------------------------------------------------------------

export interface FaqSeed {
  question: string
  answer: Record<string, unknown>
  isActive: boolean
  sortOrder: number
}

export function getFaqs(): FaqSeed[] {
  return faqs.map((f, i) => ({
    question: f.question,
    answer: toLexicalRichText(f.answer),
    isActive: true,
    sortOrder: i + 1,
  }))
}

// ---------------------------------------------------------------------------
// Vehicle Makes (10) and Models (50+)
// ---------------------------------------------------------------------------

export interface VehicleMakeSeed {
  name: string
  logoUrl: string
  isActive: boolean
  sortOrder: number
  models: Array<{
    name: string
    supportedServices: Array<{ service: string }>
    isActive: boolean
  }>
}

export function getVehicleMakes(): VehicleMakeSeed[] {
  return vehicleMakes.map((make, i) => ({
    name: make.name,
    logoUrl: make.logoUrl,
    isActive: true,
    sortOrder: i + 1,
    models: make.models.map((m) => ({
      name: m.name,
      supportedServices: m.supportedServices.map((s) => ({ service: s })),
      isActive: true,
    })),
  }))
}

// ---------------------------------------------------------------------------
// Gallery Items (3 placeholders)
// ---------------------------------------------------------------------------

export interface GalleryItemSeed {
  title: string
  category: string
  description: string
  isActive: boolean
  sortOrder: number
  /** Relative path to before image from monorepo root */
  beforeImagePath: string
  /** Relative path to after image from monorepo root */
  afterImagePath: string
}

export function getGalleryItems(): GalleryItemSeed[] {
  const base = '../../../../src/assets/gallery'
  return [
    { title: 'Deadbolt Replacement', category: 'Residential', description: 'Professional deadbolt replacement on a residential front door.', isActive: true, sortOrder: 1, beforeImagePath: `${base}/before-1.jpg`, afterImagePath: `${base}/after-1.jpg` },
    { title: 'Front Door Lock Rekey', category: 'Residential', description: 'Full rekey of a front door lock set.', isActive: true, sortOrder: 2, beforeImagePath: `${base}/before-1.jpg`, afterImagePath: `${base}/after-1.jpg` },
    { title: 'Smart Lock Installation', category: 'Residential', description: 'Smart lock upgrade on a residential entry.', isActive: true, sortOrder: 3, beforeImagePath: `${base}/before-1.jpg`, afterImagePath: `${base}/after-1.jpg` },
    { title: 'Car Lock Cylinder Repair', category: 'Automotive', description: 'Car lock cylinder repair and restoration.', isActive: true, sortOrder: 4, beforeImagePath: `${base}/before-2.jpg`, afterImagePath: `${base}/after-2.jpg` },
    { title: 'Transponder Key Programming', category: 'Automotive', description: 'Transponder key programming for modern vehicles.', isActive: true, sortOrder: 5, beforeImagePath: `${base}/before-2.jpg`, afterImagePath: `${base}/after-2.jpg` },
    { title: 'Ignition Lock Replacement', category: 'Automotive', description: 'Full ignition lock cylinder replacement.', isActive: true, sortOrder: 6, beforeImagePath: `${base}/before-2.jpg`, afterImagePath: `${base}/after-2.jpg` },
    { title: 'Access Control Upgrade', category: 'Commercial', description: 'Commercial access control system upgrade.', isActive: true, sortOrder: 7, beforeImagePath: `${base}/before-3.jpg`, afterImagePath: `${base}/after-3.jpg` },
    { title: 'Office Master Key System', category: 'Commercial', description: 'Master key system installation for an office building.', isActive: true, sortOrder: 8, beforeImagePath: `${base}/before-3.jpg`, afterImagePath: `${base}/after-3.jpg` },
    { title: 'Panic Bar Installation', category: 'Commercial', description: 'Panic bar installation on a commercial exit door.', isActive: true, sortOrder: 9, beforeImagePath: `${base}/before-3.jpg`, afterImagePath: `${base}/after-3.jpg` },
  ]
}

// ---------------------------------------------------------------------------
// Globals — Site Settings, Homepage Layout, Navigation
// ---------------------------------------------------------------------------

import {
  defaultBrand,
  defaultContact,
  defaultSections,
  defaultNavItems,
} from '../../../../src/data/siteConfig'

export interface SiteSettingsSeed {
  businessName: string
  tagline: string
  phone: string
  email: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  hours: Array<{ day: string; hours: string }>
  responseTime: string
  defaultSeoTitle: string
  defaultSeoDescription: string
}

/**
 * Maps defaultBrand + defaultContact into the site-settings global shape.
 * Parses "Cleveland, OH & surrounding areas" into city/state components.
 */
export function getSiteSettings(): SiteSettingsSeed {
  return {
    businessName: defaultBrand.name,
    tagline: defaultBrand.tagline,
    phone: defaultContact.phoneDisplay,
    email: defaultContact.email ?? '',
    address: {
      street: '',
      city: 'Cleveland',
      state: 'OH',
      zip: '',
    },
    hours: [{ day: 'Every Day', hours: '24/7/365' }],
    responseTime: defaultBrand.responseTime,
    defaultSeoTitle: `${defaultBrand.name} | ${defaultBrand.tagline}`,
    defaultSeoDescription: `${defaultBrand.name} provides 24/7 emergency locksmith services in Cleveland, OH and surrounding areas. Call ${defaultContact.phoneDisplay} for fast, reliable service.`,
  }
}

export interface HomepageLayoutSeed {
  sections: Array<{
    sectionType: string
    heading: string
    subheading: string
    isActive: boolean
    sortOrder: number
  }>
}

/**
 * Maps defaultSections into the homepage-layout global shape.
 */
export function getHomepageLayout(): any {
  return {
    sections: defaultSections.map((s) => ({
      sectionType: s.type,
      heading: s.heading ?? '',
      subheading: s.subheading ?? '',
      isActive: s.isActive,
      sortOrder: s.order,
    })) as any, // Cast the mapped array to any
  }
}

export interface NavigationSeed {
  items: Array<{
    label: string
    href: string
    isActive: boolean
    sortOrder: number
  }>
}

/**
 * Maps defaultNavItems into the navigation global shape.
 */
export function getNavigation(): NavigationSeed {
  return {
    items: defaultNavItems.map((n) => ({
      label: n.label,
      href: n.href,
      isActive: n.isActive,
      sortOrder: n.order,
    })),
  }
}

// ---------------------------------------------------------------------------
// Service Image Paths (29) — maps slug to local image file
// ---------------------------------------------------------------------------

export function getServiceImagePaths(): Record<string, string> {
  const base = '../../../../src/assets/services'
  const map: Record<string, string> = {}
  for (const svc of services) {
    map[svc.slug] = `${base}/${svc.slug}.jpg`
  }
  return map
}

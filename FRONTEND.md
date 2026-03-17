# Xcel Locksmith — Frontend Architecture

> **Status:** Complete (React SPA, static data)  
> **Stack:** React 18 + Vite + Tailwind CSS + TypeScript  
> **Date:** 2026-02-28

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Routing & Pages](#3-routing--pages)
4. [Data Architecture](#4-data-architecture)
5. [Component Inventory](#5-component-inventory)
6. [Design System](#6-design-system)
7. [SEO Strategy](#7-seo-strategy)
8. [Animations & Interactions](#8-animations--interactions)
9. [Static Assets](#9-static-assets)
10. [CMS Migration Map](#10-cms-migration-map)

---

## 1. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18.3 | UI rendering |
| **Build** | Vite | Dev server + bundling |
| **Styling** | Tailwind CSS + custom design tokens | Utility-first CSS |
| **Routing** | react-router-dom 6.x | Client-side SPA routing |
| **SEO** | react-helmet-async | Dynamic `<head>` management |
| **Animation** | Framer Motion 12.x | Page transitions, scroll reveals |
| **Animation (scroll)** | GSAP 3.x | Scroll-triggered hero animation (lock frames) |
| **Carousel** | Embla Carousel | Service sliders |
| **Maps** | Leaflet + react-leaflet | Interactive service area map |
| **Forms** | react-hook-form + Zod | Quote tool, review submission |
| **UI Components** | shadcn/ui (Radix primitives) | Accordion, Dialog, Sheet, Toast, etc. |
| **Data Fetching** | @tanstack/react-query | Future CMS API calls (currently unused) |
| **Charts** | Recharts | Visitor counter visualization |
| **Icons** | lucide-react | All UI icons |

---

## 2. Project Structure

```
src/
├── App.tsx                      # Root: HelmetProvider, Router, Routes
├── main.tsx                     # Vite entry point
├── index.css                    # Tailwind + design tokens + custom components
├── App.css                      # Minimal global styles
│
├── pages/                       # Route-level page components
│   ├── Index.tsx                # Homepage (config-driven section rendering)
│   ├── CategoryLandingPage.tsx  # /services/:category (3 pages)
│   ├── ServiceLandingPage.tsx   # /services/:category/:slug (29 pages)
│   ├── ServiceAreasPage.tsx     # /service-areas (hub page)
│   ├── CityLandingPage.tsx      # /service-areas/:citySlug (24 pages)
│   └── NotFound.tsx             # 404 catch-all
│
├── components/                  # Reusable UI components
│   ├── StickyHeader.tsx         # Responsive nav with glassmorphism
│   ├── HeroSection.tsx          # Animated hero with lock frame sequence
│   ├── HeroLockAnimation.tsx    # GSAP scroll-triggered 46-frame animation
│   ├── ServicesSection.tsx      # Category tabs + service grid + Embla carousel
│   ├── ServiceDetailDialog.tsx  # Modal with full service info
│   ├── ReviewsSection.tsx       # Star ratings + add review form
│   ├── BeforeAfterGallery.tsx   # Before/after image comparisons
│   ├── ComparisonSlider.tsx     # Drag slider for image comparison
│   ├── QuoteTool.tsx            # 4-step quote form (type → location → photo → contact)
│   ├── VehicleVerifier.tsx      # Make → Model → supported services flow
│   ├── TeamSection.tsx          # Team grid with certification viewer
│   ├── CertificateViewer.tsx    # Modal with zoom/navigation for certs
│   ├── ServiceAreaMap.tsx       # Leaflet map with city markers
│   ├── FAQSection.tsx           # Accordion FAQ display
│   ├── ContactSection.tsx       # Phone, email, hours, address
│   ├── VisitorCounter.tsx       # Animated counter + chart
│   ├── Footer.tsx               # Links to categories, cities, services
│   ├── Breadcrumb.tsx           # BreadcrumbList with JSON-LD
│   ├── StructuredData.tsx       # LocalBusiness, FAQPage, Organization JSON-LD
│   ├── ScrollReveal.tsx         # Framer Motion scroll-triggered animations
│   ├── ScrollToTop.tsx          # Floating back-to-top button
│   └── NavLink.tsx              # Smart nav links (smooth scroll + route)
│
├── components/ui/               # shadcn/ui primitives (40+ components)
│   ├── accordion.tsx, button.tsx, card.tsx, dialog.tsx, ...
│   └── (standard Radix-based shadcn components)
│
├── data/                        # Static data files (→ CMS collections)
│   ├── services.ts              # 29 services with slug, category, price, icon
│   ├── serviceDetails.ts        # Extended descriptions, benefits, images per service
│   ├── locations.ts             # 24 cities with lat/lng, SEO meta
│   ├── team.ts                  # 4 team members with 12 certifications
│   ├── reviews.ts               # 5 pre-seeded reviews
│   ├── faqs.ts                  # 7 FAQ entries
│   ├── vehicles.ts              # 10 makes, 50+ models, supported services
│   └── siteConfig.ts            # Brand, nav items, homepage sections, contact, SEO
│
├── hooks/                       # Custom React hooks
│   ├── use-mobile.tsx           # Mobile breakpoint detection
│   └── use-toast.ts             # Toast notification hook
│
├── lib/
│   └── utils.ts                 # cn() helper (clsx + tailwind-merge)
│
└── assets/                      # Imported images (bundled by Vite)
    ├── xcel-logo-new.png        # Brand logo
    ├── category-residential.jpg
    ├── category-commercial.jpg
    ├── category-automotive.jpg
    ├── gallery/                 # 3 before/after pairs
    │   ├── before-1.jpg, after-1.jpg
    │   ├── before-2.jpg, after-2.jpg
    │   └── before-3.jpg, after-3.jpg
    └── services/                # 29 service hero images (one per service slug)
        ├── house-lockout-services.jpg
        ├── lock-installation-replacement.jpg
        └── ... (29 total)

public/
├── certificates/                # 12 certification images (team certs)
├── frames/                      # 46 JPEG frames for GSAP lock animation
├── favicon.ico
├── placeholder.svg
└── robots.txt
```

---

## 3. Routing & Pages

### Route Table

| Route | Page Component | Dynamic Params | Page Count |
|-------|---------------|----------------|------------|
| `/` | `Index.tsx` | — | 1 |
| `/services/:category` | `CategoryLandingPage.tsx` | `residential`, `commercial`, `automotive` | 3 |
| `/services/:category/:slug` | `ServiceLandingPage.tsx` | 29 service slugs | 29 |
| `/service-areas` | `ServiceAreasPage.tsx` | — | 1 |
| `/service-areas/:citySlug` | `CityLandingPage.tsx` | 24 city slugs | 24 |
| `*` | `NotFound.tsx` | — | 1 |
| **Total** | | | **59 pages** |

### Page Responsibilities

#### `Index.tsx` — Homepage
- **Config-driven rendering** via `getActiveSections()` from `siteConfig.ts`
- Maps section types to components dynamically (hero, services, reviews, gallery, quote, vehicle-verifier, team, map, faq, contact, visitor-counter)
- Renders JSON-LD: `LocalBusiness`, `FAQPage`, `Organization`
- Wraps each section in `ScrollReveal` for staggered entrance animations

#### `CategoryLandingPage.tsx` — Category Hub (3 pages)
- Hero with category image, headline, description
- Lists all services in that category with prices and links
- Cross-links to all 24 service areas
- Trust badges row (licensed, insured, 24/7, no hidden fees)
- Breadcrumb: Home → {Category}
- JSON-LD: `LocalBusiness` with service descriptions

#### `ServiceLandingPage.tsx` — Individual Service (29 pages)
- Full service detail: long description, benefits list, starting price
- Before/after comparison slider
- Related services (same category)
- Service areas served (links to city pages)
- Relevant FAQs
- Breadcrumb: Home → {Category} → {Service}
- JSON-LD: `Service`, `BreadcrumbList`

#### `CityLandingPage.tsx` — City Landing (24 pages)
- All services grouped by category available in that city
- City-specific SEO meta from `locations.ts`
- Nearby cities with links
- Trust signals and response time
- Breadcrumb: Home → Service Areas → {City}
- JSON-LD: `Locksmith` with `areaServed`

#### `ServiceAreasPage.tsx` — Service Areas Hub
- Grid of all 24 cities with links
- Interactive Leaflet map with markers
- Breadcrumb: Home → Service Areas

---

## 4. Data Architecture

All content is stored in static TypeScript files under `src/data/`. Each file exports typed arrays and helper functions.

### Data File Inventory

#### `services.ts` — 29 Services
```typescript
interface Service {
  id: string;           // e.g., "r1", "c1", "a1"
  title: string;        // "House Lockout Services"
  slug: string;         // "house-lockout-services"
  category: "residential" | "commercial" | "automotive";
  shortDescription: string;
  startingPrice: number; // e.g., 45
  icon: string;         // Lucide icon name: "Home", "Key", "Car"
  isActive: boolean;
}
// Helpers: getServicesByCategory(cat), getServiceBySlug(slug)
```

**Counts:** 10 residential, 10 commercial, 9 automotive = 29 total

#### `serviceDetails.ts` — Extended Service Data
```typescript
interface ServiceDetail {
  slug: string;
  longDescription: string;  // 2-3 paragraph SEO copy
  benefits: string[];       // 4-6 bullet points
  categoryImage: string;    // Imported image asset
  ctaText: string;          // "Call Now for Lock Rekeying"
}
// Helper: getServiceDetail(slug)
```

Each of the 29 services has a corresponding detail entry with a unique hero image imported from `src/assets/services/`.

#### `locations.ts` — 24 Service Areas
```typescript
interface Location {
  id: string;
  cityName: string;       // "Cleveland", "Lakewood", etc.
  slug: string;           // "cleveland", "lakewood"
  seoMetaTitle: string;   // Full <title> tag
  seoMetaDescription: string;
  lat: number;            // For Leaflet map markers
  lng: number;
  isActive: boolean;
}
// Helpers: getActiveLocations(), getLocationBySlug(slug)
```

**Cities served:** Cleveland, East Cleveland, Lakewood, Westlake, Beachwood, Richfield, Parma, Brunswick, Medina, Lorain, Avon, Avon Lake, Elyria, Strongsville, North Olmsted, Middleburg Heights, Brook Park, Euclid, Mayfield Heights, Shaker Heights, Garfield Heights, Bedford, Independence, Fairview Park

#### `team.ts` — 4 Team Members
```typescript
interface TeamMember {
  id: string;
  name: string;           // "Marcus Johnson"
  role: string;           // "Master Locksmith & Owner"
  experience: string;     // "18+ years"
  bio: string;            // 2-sentence bio
  certifications: CertificationProof[];  // 3 per member
  specialties: string[];  // 3 per member
  photoUrl: string;       // Unsplash URL
  isActive: boolean;
}

interface CertificationProof {
  name: string;           // "ALOA Certified Master Locksmith (CML)"
  fileUrl: string;        // "/certificates/cert-marcus-cml.jpg"
  fileType: "image" | "pdf";
}
```

**Team:** Marcus Johnson (Owner), David Chen (Automotive), Sarah Williams (Commercial), James Rodriguez (Emergency)  
**Certificates:** 12 total (3 per member), stored in `public/certificates/`

#### `reviews.ts` — 5 Reviews
```typescript
interface Review {
  id: string;
  customerName: string;   // "Maria S."
  starRating: number;     // 1-5 (all currently 5)
  reviewDate: string;     // ISO date
  reviewText: string;
}
```

#### `faqs.ts` — 7 FAQs
```typescript
interface FAQ {
  id: string;
  question: string;
  answer: string;         // Plain text (will become richText in CMS)
}
```

**Topics:** Pricing, licensing, response time, hidden fees, service areas, car keys, hours

#### `vehicles.ts` — 10 Makes, 50+ Models
```typescript
interface VehicleMake {
  id: string;
  name: string;           // "Chevrolet", "Ford", etc.
  logoUrl: string;        // External CDN (carlogos.org)
  models: VehicleModel[];
}

interface VehicleModel {
  id: string;
  name: string;           // "Camaro", "Mustang", etc.
  supportedServices: string[];  // Service titles
}
```

**Makes:** Chevrolet, GMC, Cadillac, Buick, Ford, Lincoln, Chrysler, Dodge, Jeep, Ram

#### `siteConfig.ts` — Global Configuration
```typescript
interface SiteConfig {
  brand: BrandConfig;        // Name, tagline, logo, phone, response time
  navigation: NavItem[];     // 9 nav items with href, label, order
  sections: SectionConfig[]; // 11 homepage sections with type, heading, order
  contact: ContactConfig;    // Phone, email, address, hours
  seo: SEOConfig;           // Default title, description, OG image
}
```

**Key pattern:** `getActiveSections()` and `getActiveNav()` filter by `isActive` and sort by `order` — this drives the homepage layout and navigation. The CMS `homepage-layout` and `navigation` globals directly replace these.

---

## 5. Component Inventory

### Interactive Components (→ Client Components in Next.js)

| Component | Interactivity | State |
|-----------|--------------|-------|
| `QuoteTool.tsx` | 4-step form wizard | Form state, step index, file upload |
| `VehicleVerifier.tsx` | Make → Model → Services cascade | Selected make/model |
| `ReviewsSection.tsx` | Star rating input, form submission | Reviews array, form state |
| `CertificateViewer.tsx` | Modal with zoom, prev/next navigation | Active cert index, zoom level |
| `ComparisonSlider.tsx` | Drag slider for before/after | Slider position (0-100) |
| `ServiceAreaMap.tsx` | Leaflet map with interactive markers | Map center, zoom |
| `StickyHeader.tsx` | Scroll-based visibility, mobile menu | Scroll position, menu open |
| `ScrollToTop.tsx` | Scroll-based visibility, click to scroll | Scroll position |
| `HeroLockAnimation.tsx` | GSAP scroll-triggered frame sequence | Current frame index |
| `ServicesSection.tsx` | Category tabs, Embla carousel | Active tab, carousel state |
| `ServiceDetailDialog.tsx` | Modal open/close | Dialog open state |

### Static/Display Components (→ Server Components in Next.js)

| Component | Data Source |
|-----------|------------|
| `HeroSection.tsx` | `siteConfig.ts` (brand) |
| `FAQSection.tsx` | `faqs.ts` |
| `TeamSection.tsx` | `team.ts` |
| `ContactSection.tsx` | `siteConfig.ts` (contact) |
| `BeforeAfterGallery.tsx` | Hardcoded 3 pairs from `assets/gallery/` |
| `VisitorCounter.tsx` | Animated counter (no real data) |
| `Footer.tsx` | `services.ts`, `locations.ts`, `siteConfig.ts` |
| `Breadcrumb.tsx` | Props (path segments) |
| `StructuredData.tsx` | `siteConfig.ts`, `faqs.ts`, `team.ts` |
| `ScrollReveal.tsx` | Wrapper (Framer Motion) |

---

## 6. Design System

### Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| **Display** | Sora | 600-800 | H1-H6, hero text |
| **Body** | Plus Jakarta Sans | 300-700 | Paragraphs, labels, nav |
| **Serif accent** | DM Serif Display | 400 | Decorative headings |

### Color Tokens (HSL via CSS variables)

#### Light Mode
| Token | HSL | Usage |
|-------|-----|-------|
| `--primary` | `218 46% 30%` | Navy — primary brand |
| `--accent` | `217 91% 60%` | Blue — links, highlights |
| `--cta-red` | `356 82% 50%` | Red — CTA buttons |
| `--navy` | `218 46% 30%` | Header, footer backgrounds |
| `--blue-glow` | `217 91% 50%` | Hover states, glows |
| `--silver` | `220 10% 40%` | Secondary text |
| `--background` | `0 0% 100%` | Page background |
| `--foreground` | `220 20% 10%` | Primary text |

#### Dark Mode
Full dark mode support with inverted tokens. Key changes: `--background: 220 40% 4%`, `--navy: 218 46% 20%`.

### Custom CSS Components (defined in `index.css`)

| Class | Description |
|-------|------------|
| `.glass-card` | Glassmorphism card (blur + transparency) |
| `.glass-card-strong` | Opaque variant for high-contrast |
| `.skeu-cta-red` | 3D skeuomorphic red CTA button with inset shadow |
| `.skeu-cta-blue` | 3D skeuomorphic blue CTA button |
| `.skeu-cta-glow` | Animated glow pulse on CTA buttons |
| `.bg-gradient-page` | Full-page background gradient |
| `.bg-gradient-hero` | Hero section gradient |
| `.bg-gradient-dark-section` | Dark section backgrounds |
| `.text-gradient-blue` | Blue gradient text effect |
| `.text-gradient-navy` | Navy gradient text effect |
| `.font-display` | Sora font family |

### Tailwind Extensions (in `tailwind.config.ts`)

- Custom colors: `navy`, `navy-deep`, `blue`, `blue-glow`, `cta-red`, `cta-red-glow`, `silver`, `silver-light`
- Custom fonts: `font-display` (Sora), `font-sans` (Plus Jakarta Sans), `font-serif` (DM Serif Display)
- Custom animations: `pulse-glow` (blue), `pulse-glow-red` (red CTA)
- Border radius: `--radius: 0.75rem` with lg/md/sm variants

---

## 7. SEO Strategy

### Page-Level SEO

Every page uses `react-helmet-async` to set:
- `<title>` — unique per page, under 60 chars
- `<meta name="description">` — unique, under 160 chars
- `<meta property="og:title">` and `og:description`
- `<link rel="canonical">`

### Structured Data (JSON-LD)

| Schema Type | Component | Pages |
|-------------|-----------|-------|
| `LocalBusiness` | `StructuredData.tsx` | Homepage, category pages, city pages |
| `FAQPage` | `StructuredData.tsx` | Homepage |
| `Organization` | `StructuredData.tsx` | Homepage |
| `BreadcrumbList` | `Breadcrumb.tsx` | All inner pages |
| `Locksmith` | `CityLandingPage.tsx` | 24 city pages |
| `Service` | `ServiceLandingPage.tsx` | 29 service pages |

### Internal Linking Strategy

- **Footer:** Links to all 3 categories, top services per category, all 24 cities
- **Category pages:** Link to all services in category + all cities
- **Service pages:** Link to related services (same category) + 8 cities
- **City pages:** Link to all services grouped by category + 8 nearby cities
- **Breadcrumbs:** Every inner page has breadcrumb navigation with JSON-LD

### robots.txt

```
User-agent: *
Allow: /
Sitemap: https://lock-smith-cms.lovable.app/sitemap.xml
```

---

## 8. Animations & Interactions

### GSAP — Hero Lock Animation
- **46 JPEG frames** in `public/frames/ezgif-frame-001.jpg` through `046.jpg`
- Scroll-triggered via GSAP `ScrollTrigger`
- Frames advance as user scrolls through the hero section
- Creates a "lock opening" cinematic effect

### Framer Motion — Page Animations
- `ScrollReveal.tsx` wraps sections with entrance animations:
  - `fadeUp` — translate Y + opacity
  - `fadeIn` — opacity only
  - `scale` — scale + opacity
- Alternating variants per section for visual variety
- `delay: 0.05` for stagger effect

### Embla Carousel — Service Sliders
- Used in `ServicesSection.tsx` for service card carousels
- Auto-play with `embla-carousel-autoplay`
- Touch/drag support for mobile

### Leaflet Map
- Interactive map in `ServiceAreaMap.tsx`
- Markers for all 24 cities using lat/lng from `locations.ts`
- Click markers for city info popups

---

## 9. Static Assets

### Images by Category

| Category | Location | Count | Purpose |
|----------|----------|-------|---------|
| Service images | `src/assets/services/` | 29 | Hero images for service pages |
| Category images | `src/assets/` | 3 | Category landing page heroes |
| Gallery images | `src/assets/gallery/` | 6 | 3 before/after pairs |
| Certificate images | `public/certificates/` | 12 | Team certification proofs |
| Animation frames | `public/frames/` | 46 | GSAP lock animation sequence |
| Logo | `src/assets/` | 2 | Brand logo (new + original) |

### Image Naming Convention
- Service images: `{service-slug}.jpg` (matches service slug exactly)
- Certificates: `cert-{firstname}-{certtype}.jpg`
- Gallery: `before-{n}.jpg` / `after-{n}.jpg`
- Frames: `ezgif-frame-{NNN}.jpg` (zero-padded 3 digits)

---

## 10. CMS Migration Map

### Static Import → Payload API Replacement

| Current Import | CMS Collection | API Call |
|---------------|---------------|---------|
| `import { services } from '@/data/services'` | `services` | `payload.find({ collection: 'services' })` |
| `import { getServiceDetail } from '@/data/serviceDetails'` | `services` (merged) | `payload.findByID({ collection: 'services', id })` |
| `import { locations } from '@/data/locations'` | `service-areas` | `payload.find({ collection: 'service-areas' })` |
| `import { teamMembers } from '@/data/team'` | `team-members` | `payload.find({ collection: 'team-members' })` |
| `import { reviews } from '@/data/reviews'` | `reviews` (where approved) | `payload.find({ collection: 'reviews', where: { isApproved: { equals: true } } })` |
| `import { faqs } from '@/data/faqs'` | `faqs` | `payload.find({ collection: 'faqs' })` |
| `import { vehicleMakes } from '@/data/vehicles'` | `vehicle-makes` + `vehicle-models` | Two queries with depth |
| `import { defaultBrand, ... } from '@/data/siteConfig'` | `site-settings` global | `payload.findGlobal({ slug: 'site-settings' })` |
| `import { defaultNavItems } from '@/data/siteConfig'` | `navigation` global | `payload.findGlobal({ slug: 'navigation' })` |
| `import { defaultSections } from '@/data/siteConfig'` | `homepage-layout` global | `payload.findGlobal({ slug: 'homepage-layout' })` |

### Component → Server/Client Split

| Component | Next.js Type | Why |
|-----------|-------------|-----|
| `Index.tsx` | Server | Fetches layout + sections from CMS |
| `CategoryLandingPage.tsx` | Server | Static generation with ISR |
| `ServiceLandingPage.tsx` | Server | Static generation with ISR |
| `CityLandingPage.tsx` | Server | Static generation with ISR |
| `ServicesSection.tsx` | Client | Tabs + carousel interactivity |
| `QuoteTool.tsx` | Client | Multi-step form with file upload |
| `VehicleVerifier.tsx` | Client | Cascading select interactivity |
| `ReviewsSection.tsx` | Client | Form submission + local state |
| `CertificateViewer.tsx` | Client | Modal with zoom/navigation |
| `ComparisonSlider.tsx` | Client | Drag interaction |
| `ServiceAreaMap.tsx` | Client | Leaflet map (requires window) |
| `StickyHeader.tsx` | Client | Scroll event listener |
| `HeroLockAnimation.tsx` | Client | GSAP scroll trigger |

### Key Migration Notes

1. **`services.ts` + `serviceDetails.ts` merge** — These two files become one `services` collection. The `serviceDetails` map keyed by slug contains `longDescription`, `benefits[]`, `categoryImage`, and `ctaText` that should be fields on the service document.

2. **Category metadata is inline** — `CategoryLandingPage.tsx` contains a hardcoded `categoryMeta` object with `label`, `headline`, `description`, `seoTitle`, `seoDescription`, `image`, `color` per category. This becomes the `service-categories` collection.

3. **Vehicle logos are external** — Currently loaded from `carlogos.org` CDN. Should be uploaded to MinIO media collection during seeding.

4. **Team photos are external** — Currently Unsplash URLs. Should be uploaded to media collection.

5. **Homepage is config-driven** — The `sectionComponents` map in `Index.tsx` directly maps section types to React components. The CMS `homepage-layout` global controls which sections appear, their order, and their headings. The component mapping stays in code.

6. **Structured data generation** — `StructuredData.tsx` generates JSON-LD from data files. In Next.js, this moves to server-side generation using CMS data, output as `<script type="application/ld+json">` in the page's `<head>`.

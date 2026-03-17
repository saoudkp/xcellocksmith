# Xcel Locksmith — Full-Stack Requirements

> **For:** Kiro IDE Spec-Driven Development  
> **Reference PRD:** `cms_prd.md` (v2.1)  
> **Frontend Docs:** `FRONTEND.md` (complete architecture, components, data, design system)  
> **Deployment Guide:** `DEPLOYMENT.md` (Netcup + Coolify setup)  
> **Date:** 2026-02-28

---

## Overview

The frontend React SPA for Xcel Locksmith is **fully built** with 59 SEO-optimized pages, structured data (JSON-LD), breadcrumb navigation, internal linking, and a robots.txt. All content currently comes from static TypeScript files in `src/data/`. The goal is to build a **Payload CMS 3.x backend on Next.js 15** that replaces these static imports with API-driven data, making everything editable via an admin dashboard.

---

## Frontend Summary (see `FRONTEND.md` for full details)

### Tech Stack
React 18 + Vite + Tailwind CSS + TypeScript + Framer Motion + GSAP + Leaflet + shadcn/ui + react-helmet-async

### Pages (59 total)
- **Homepage** (`/`) — Config-driven section rendering via `siteConfig.ts`
- **3 Category pages** (`/services/:category`) — residential, commercial, automotive
- **29 Service pages** (`/services/:category/:slug`) — individual service landing pages
- **1 Service Areas hub** (`/service-areas`) — grid + Leaflet map
- **24 City pages** (`/service-areas/:citySlug`) — city-specific landing pages
- **1 Not Found** (`*`) — 404 catch-all

### Data Files (→ CMS Collections)
| File | Records | → CMS Collection |
|------|---------|------------------|
| `services.ts` + `serviceDetails.ts` | 29 services | `services` |
| `locations.ts` | 24 cities | `service-areas` |
| `team.ts` | 4 members, 12 certs | `team-members` |
| `reviews.ts` | 5 reviews | `reviews` |
| `faqs.ts` | 7 FAQs | `faqs` |
| `vehicles.ts` | 10 makes, 50+ models | `vehicle-makes` + `vehicle-models` |
| `siteConfig.ts` | Brand, nav, sections, contact | `site-settings` + `homepage-layout` + `navigation` globals |

### Design System
- **Fonts:** Sora (display), Plus Jakarta Sans (body), DM Serif Display (accent)
- **Colors:** Navy (`--primary`), Blue (`--accent`), Red (`--cta-red`), with full dark mode
- **Effects:** Glassmorphism cards, skeuomorphic CTA buttons, gradient backgrounds, pulse-glow animations
- **Components:** 40+ shadcn/ui primitives + 20 custom components

### Key Interactive Components (→ Client Components in Next.js)
`QuoteTool` (4-step form), `VehicleVerifier` (make→model cascade), `ReviewsSection` (add review), `CertificateViewer` (zoom/nav modal), `ComparisonSlider` (drag), `ServiceAreaMap` (Leaflet), `HeroLockAnimation` (46-frame GSAP scroll), `StickyHeader` (scroll-aware nav)

### SEO
- Unique `<title>` + `<meta description>` per page
- JSON-LD: `LocalBusiness`, `FAQPage`, `Organization`, `BreadcrumbList`, `Service`, `Locksmith`
- Internal linking via footer, breadcrumbs, related services, nearby cities
- `robots.txt` with sitemap reference

---

## ⚠️ Critical Architecture Constraint: Frontend/Backend Separation

### Monorepo with Clear Boundaries

The project **MUST** maintain a clear separation between frontend and backend code so they can be **independently deployed** via GitHub. Use a monorepo structure with distinct packages:

```
xcel-locksmith/
├── apps/
│   ├── web/                        # Frontend (Next.js pages + React components)
│   │   ├── src/
│   │   │   ├── app/                # Next.js App Router pages
│   │   │   ├── components/         # React UI components (ported from current SPA)
│   │   │   ├── lib/                # Frontend utilities, API client helpers
│   │   │   └── styles/             # Tailwind, CSS
│   │   ├── public/                 # Static assets (robots.txt, frames, etc.)
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json            # Frontend-only dependencies
│   │
│   └── cms/                        # Backend (Payload CMS + API)
│       ├── src/
│       │   ├── collections/        # Payload collection configs
│       │   ├── globals/            # Payload global configs
│       │   ├── access/             # Role-based access helpers
│       │   ├── endpoints/          # Custom API endpoints
│       │   ├── hooks/              # Payload lifecycle hooks
│       │   ├── email/              # Email templates (Resend)
│       │   └── seed/               # Data seeding scripts
│       ├── payload.config.ts       # Payload master config
│       └── package.json            # Backend-only dependencies
│
├── packages/
│   └── shared/                     # Shared types & constants
│       ├── src/
│       │   ├── types/              # TypeScript interfaces (Service, Location, etc.)
│       │   └── constants/          # Shared enums, slugs, category names
│       └── package.json
│
├── package.json                    # Root workspace config
├── turbo.json                      # Turborepo (optional, for build orchestration)
└── README.md
```

### Rules

1. **No backend code in `apps/web/`** — Frontend only imports from `@xcel/shared` for types and calls the CMS via REST API or Payload Local API (if same deployment)
2. **No frontend components in `apps/cms/`** — Backend only contains Payload collections, hooks, access control, and API endpoints
3. **Shared types in `packages/shared/`** — All TypeScript interfaces (`Service`, `TeamMember`, `Location`, `FAQ`, `Review`, `Vehicle`, `SiteConfig`) live here and are imported by both apps
4. **Independent `package.json`** — Each app has its own dependencies; no cross-contamination
5. **Single deployment** — The entire monorepo deploys as one Next.js + Payload 3.x app to Netcup VPS via Coolify
6. **Environment variables** — Single `.env` file; needs `DATABASE_URL` (local PostgreSQL), `S3_ENDPOINT` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` (local MinIO), and `RESEND_API_KEY`

### Finalized Deployment Strategy

| Layer | Service | Cost |
|-------|---------|------|
| **App (Frontend + CMS)** | Single Next.js + Payload 3.x on Netcup VPS via Coolify | ~€5.28/mo |
| **Database** | PostgreSQL (Docker container, same VPS) | Included |
| **Media Storage** | MinIO S3-compatible (Docker container, same VPS) | Included |
| **Transactional Email** | Resend (3,000 emails/month) | Free |
| **Domain** | Cloudflare Registrar (at-cost pricing) | ~€10/yr |
| **Total** | | **~€6/mo** |

#### VPS Specs — Netcup VPS 500 G12

| Spec | Value |
|------|-------|
| **Location** | Manassas, Virginia (US East) |
| **vCPU** | 2 vCore (KVM) |
| **RAM** | 4 GB DDR5 ECC |
| **Storage** | 128 GB NVMe |
| **Bandwidth** | Unlimited (flatrate) |
| **Extras** | Snapshots (CoW), remote console, backup system |

#### Why This Stack

- **All-in-one** — Frontend, CMS, database, and media storage on a single server; zero external accounts (except Resend)
- **Zero latency** — PostgreSQL + MinIO on same Docker network = 0ms inter-service latency
- **Zero cold starts** — VPS is always-on; no SEO penalty from serverless spin-up delays
- **Zero CORS issues** — Frontend and Payload API share the same origin (Payload Local API)
- **Set and forget** — Coolify provides a visual UI for deployments, auto-SSL, and GitHub push-to-deploy
- **SEO-bulletproof** — Critical for local locksmith search ("locksmith near me" at 2 AM must load instantly)
- **~20ms to Ohio** — Manassas, VA is ideal for serving the Cleveland metro area

#### Architecture

```
Single Next.js + Payload 3.x App → Netcup VPS via Coolify
  ├── Next.js frontend (SSR/ISR pages)
  ├── Payload CMS admin (/admin)
  ├── Payload API (Local API, no network hop)
  ├── PostgreSQL (Docker container, same network)
  ├── MinIO (Docker container, S3-compatible media storage)
  └── Coolify manages: auto-SSL, GitHub push-to-deploy, backups
```

#### Scaling Path

| Traffic | Action | Cost |
|---------|--------|------|
| 0–1,000 visitors/day | Current stack (4GB RAM) | ~€5.28/mo |
| 1,000–10,000 visitors/day | Upgrade to VPS 1000 G12 (8GB RAM) | ~€8/mo |
| 10,000+ visitors/day | Split DB to dedicated server or managed PostgreSQL | €15–25/mo |

### Why This Matters
- **Single repo, single deployment** — The Lovable GitHub repo contains both frontend and CMS; Coolify auto-deploys on push
- Internal `apps/web/` and `apps/cms/` separation keeps code organized without deployment complexity
- Enables future migration (e.g., swap Payload for another CMS) without touching frontend code
- **Always-on VPS** ensures Google crawler never hits a cold start wall
- **No external services to manage** — Everything runs in Coolify's dashboard

---

## Requirement 1: Project Initialization

### Description
Initialize the Next.js 15 + Payload CMS 3.x project with local PostgreSQL and S3-compatible media storage (MinIO) in the existing monorepo.

### Acceptance Criteria
- [ ] Next.js 15 project with App Router initialized in `apps/web/` + `apps/cms/`
- [ ] Payload CMS 3.x installed and configured with PostgreSQL adapter
- [ ] Database connection to local PostgreSQL (same Docker network via Coolify)
- [ ] S3-compatible storage (MinIO) configured for media uploads
- [ ] Payload admin UI accessible at `/admin`
- [ ] Environment variables documented (see `DEPLOYMENT.md` Section 6)
- [ ] Deployed skeleton to Netcup VPS via Coolify

### Technical Notes
- Use `@payloadcms/db-postgres` adapter
- Use `@payloadcms/storage-s3` for MinIO (S3-compatible)
- See `cms_prd.md` Section 3 for full tech stack
- See `DEPLOYMENT.md` for Coolify container setup

---

## Requirement 2: Users & Authentication

### Description
Create the Users collection with role-based access control (Admin, Manager, Staff).

### Acceptance Criteria
- [ ] `users` collection with `auth: true`
- [ ] `role` field with options: `admin`, `manager`, `staff`
- [ ] Only admins can change user roles
- [ ] Access helper functions: `isAdmin`, `isManagerOrAbove`, `isStaffOrAbove`
- [ ] Default admin user seeded on first run

### Technical Notes
- See `cms_prd.md` Section 9 for role hierarchy and access control code
- Staff can read content + create/view leads
- Managers can CRUD all content + media + leads
- Admins have full access including user management and deletions

---

## Requirement 3: Media Collection

### Description
Create the Media collection for images, PDFs, and SVGs with automatic image processing.

### Acceptance Criteria
- [ ] `media` collection with upload configuration
- [ ] Auto-generated sizes: `thumbnail` (300×300), `card` (600×400), `hero` (1200×600), `og` (1200×630)
- [ ] Accepted MIME types: PNG, JPEG, WebP, SVG, PDF
- [ ] `alt` (required) and `caption` (optional) fields
- [ ] Public read access, staff+ create access
- [ ] Files stored in Cloudflare R2 with CDN serving

### Technical Notes
- See `cms_prd.md` Section 5.10 and Section 6 for full config
- Max file sizes: Images 10MB, PDFs 5MB, SVGs 1MB

---

## Requirement 4: Service Categories Collection

### Description
Create the `service-categories` collection for the 3 locksmith service categories.

### Acceptance Criteria
- [ ] Fields: `name`, `slug` (unique), `label`, `headline`, `description`, `seoTitle`, `seoDescription`, `heroImage` (media), `color`, `isActive`, `sortOrder`
- [ ] Auto-slug generation from `name`
- [ ] Seed data: `residential`, `commercial`, `automotive`

### Technical Notes
- See `cms_prd.md` Section 5.2
- Current frontend data is split between `services.ts` (category field) and `CategoryLandingPage.tsx` (inline `categoryMeta` object)

---

## Requirement 5: Services Collection

### Description
Create the `services` collection with 29 locksmith services linked to categories.

### Acceptance Criteria
- [ ] Fields: `title`, `slug` (unique, auto-generated), `category` (relationship → service-categories), `shortDescription`, `longDescription` (richText), `startingPrice`, `icon`, `heroImage` (media), `benefits` (array), `ctaText`, `seoTitle`, `seoDescription`, `isActive`, `sortOrder`
- [ ] Auto-slug hook from title
- [ ] Public read, manager+ create/update, admin-only delete
- [ ] `afterChange` hook to revalidate service pages
- [ ] Seed all 29 services from `services.ts` + `serviceDetails.ts` (merge long descriptions and benefits)

### Technical Notes
- See `cms_prd.md` Section 5.1
- `serviceDetails.ts` contains `longDescription`, `benefits[]`, `categoryImage`, `ctaText` per service slug — merge into services collection
- `services.ts` contains `title`, `slug`, `category`, `shortDescription`, `startingPrice`, `icon`

---

## Requirement 6: Service Areas (Cities) Collection

### Description
Create the `service-areas` collection for 24 cities with geo-coordinates.

### Acceptance Criteria
- [ ] Fields: `cityName`, `slug` (unique), `state` (default "OH"), `lat`, `lng`, `radiusMiles` (default 5), `responseTime` (default "20-30 min"), `seoTitle`, `seoDescription`, `isActive`, `sortOrder`
- [ ] `afterChange` hooks: revalidate city pages + regenerate sitemap
- [ ] Seed all 24 cities from `locations.ts`

### Technical Notes
- See `cms_prd.md` Section 5.3
- Frontend uses coordinates for Leaflet map markers in `ServiceAreaMap.tsx`
- `CityLandingPage.tsx` uses `seoTitle` and `seoDescription` for meta tags

---

## Requirement 7: Team Members & Certifications

### Description
Create the `team-members` collection with nested certifications (linked to media).

### Acceptance Criteria
- [ ] Fields: `name`, `role`, `experience`, `bio`, `photo` (media, required), `specialties` (array of text), `certifications` (array with: `name`, `file` (media), `fileType` (image|pdf), `expiryDate`, `isVerified`), `isActive`, `sortOrder`
- [ ] Only admins can mark certifications as verified
- [ ] Seed 4 team members with 12 certificates from `team.ts`
- [ ] Upload certificate images from `public/certificates/` to media collection

### Technical Notes
- See `cms_prd.md` Section 5.4
- `CertificateViewer.tsx` renders certificates in a modal with zoom/navigation
- Certificate files: `cert-marcus-cml.jpg`, `cert-marcus-savta.jpg`, `cert-marcus-ohio.jpg`, `cert-david-auto.jpg`, `cert-david-lishi.jpg`, `cert-david-ohio.jpg`, `cert-sarah-cpl.jpg`, `cert-sarah-access.jpg`, `cert-sarah-ohio.jpg`, `cert-james-crl.jpg`, `cert-james-firstaid.jpg`, `cert-james-ohio.jpg`

---

## Requirement 8: Reviews Collection

### Description
Create the `reviews` collection with approval workflow.

### Acceptance Criteria
- [ ] Fields: `customerName`, `starRating` (1-5), `reviewText`, `reviewDate`, `source` (website|google|yelp|manual), `isApproved` (default false), `isFeatured`
- [ ] Public can submit reviews (create access)
- [ ] Public reads only approved reviews
- [ ] Admin notification on new review submission
- [ ] Seed 5 reviews from `reviews.ts` (pre-approved)

### Technical Notes
- See `cms_prd.md` Section 5.5
- `ReviewsSection.tsx` has an `AddReviewForm` that submits new reviews
- Frontend currently adds reviews to local state — replace with `POST /api/reviews`

---

## Requirement 9: FAQs Collection

### Description
Create the `faqs` collection for frequently asked questions.

### Acceptance Criteria
- [ ] Fields: `question`, `answer` (richText), `category` (general|pricing|services|emergency), `isActive`, `sortOrder`
- [ ] Seed 7 FAQs from `faqs.ts`

### Technical Notes
- See `cms_prd.md` Section 5.6
- `FAQSection.tsx` renders accordion-style FAQ display
- `StructuredData.tsx` generates FAQPage JSON-LD from this data

---

## Requirement 10: Gallery Items Collection

### Description
Create the `gallery-items` collection for before/after comparison images.

### Acceptance Criteria
- [ ] Fields: `title`, `beforeImage` (media, required), `afterImage` (media, required), `description`, `service` (relationship → services), `isActive`, `sortOrder`
- [ ] Upload existing gallery images from `src/assets/gallery/` to media collection
- [ ] Seed 3 gallery items (before-1/after-1, before-2/after-2, before-3/after-3)

### Technical Notes
- See `cms_prd.md` Section 5.7
- `BeforeAfterGallery.tsx` uses `ComparisonSlider.tsx` for image comparison

---

## Requirement 11: Quote Requests (Lead Capture)

### Description
Create the `quote-requests` collection and custom submission endpoint.

### Acceptance Criteria
- [ ] Fields: `name`, `phone`, `email`, `serviceType` (residential|commercial|automotive), `service` (relationship), `location`, `photo` (media, optional), `notes`, `status` (new|contacted|quoted|won|lost), `honeypot` (hidden)
- [ ] Public create access, staff+ read/update, admin-only delete
- [ ] `beforeChange` hook: reject if honeypot is filled (silent 200 response)
- [ ] `afterChange` hook: send email notification to business + customer confirmation
- [ ] Custom endpoint: `POST /submit-quote` with Zod validation

### Technical Notes
- See `cms_prd.md` Section 5.8 and Section 7.2
- `QuoteTool.tsx` is a 4-step form: service type → location → photo → contact info
- Current form has honeypot field for spam prevention

---

## Requirement 12: Vehicle Makes & Models

### Description
Create `vehicle-makes` and `vehicle-models` collections.

### Acceptance Criteria
- [ ] `vehicle-makes`: `name`, `logo` (media), `isActive`, `sortOrder`
- [ ] `vehicle-models`: `name`, `make` (relationship → vehicle-makes), `supportedServices` (M2M → services), `isActive`
- [ ] Seed 10 makes and 50+ models from `vehicles.ts`

### Technical Notes
- See `cms_prd.md` Section 5.9
- `VehicleVerifier.tsx` uses make → model → supported services flow
- Current logos come from external CDN (`carlogos.org`) — upload to media collection

---

## Requirement 13: Global Settings

### Description
Create the 3 Payload Globals: `site-settings`, `homepage-layout`, `navigation`.

### Acceptance Criteria
- [ ] **site-settings**: business name, tagline, logo, phone, email, address, hours, response time, colors, default SEO, analytics IDs
- [ ] **homepage-layout**: array of sections with `section_type`, `heading`, `subheading`, `is_active`, `sort_order` — drives homepage section rendering
- [ ] **navigation**: array of nav items with `label`, `href`, `is_active`, `sort_order`
- [ ] Seed from `siteConfig.ts` (defaultBrand, defaultContact, defaultSections, defaultNavItems)

### Technical Notes
- See `cms_prd.md` Section 4.2
- `Index.tsx` uses `getActiveSections()` to render homepage — maps directly to `homepage-layout`
- `StickyHeader.tsx` uses `getActiveNav()` for navigation items

---

## Requirement 14: Dynamic Sitemap Generation

### Description
Generate an XML sitemap dynamically from all CMS content.

### Acceptance Criteria
- [ ] `app/sitemap.ts` generates sitemap from services, categories, service-areas
- [ ] Priority: homepage=1.0, categories=0.9, services=0.8, cities=0.8
- [ ] Auto-regenerate when content changes (via afterChange hooks)
- [ ] Include `lastModified` timestamps from `updatedAt` fields
- [ ] Future: service × city combo pages at priority 0.7

### Technical Notes
- See `cms_prd.md` Section 8.2
- `robots.txt` already references `https://lock-smith-cms.lovable.app/sitemap.xml`
- Current static site has 58 pages; combos would generate 754+

---

## Requirement 15: Frontend Port to Next.js

### Description
Port the React SPA components to Next.js Server + Client Components, replacing static data imports with Payload Local API calls.

### Acceptance Criteria
- [ ] All pages render identically to current SPA (design parity)
- [ ] Server Components for data fetching; Client Components for interactivity (QuoteTool, VehicleVerifier, CertificateViewer, ReviewsSection form)
- [ ] ISR configured for all pages (1hr default, 30min for reviews)
- [ ] All 58 SEO pages statically generated
- [ ] Breadcrumb component with BreadcrumbList JSON-LD preserved
- [ ] Footer internal links preserved (category pages, city pages, popular services)
- [ ] All structured data schemas preserved (LocalBusiness, FAQPage, Organization, BreadcrumbList)
- [ ] `robots.txt` and `sitemap.xml` serving correctly

### Technical Notes
- See `cms_prd.md` Section 10 for full component → API mapping
- Key pattern: `import { services } from '@/data/services'` → `await payload.find({ collection: 'services' })`
- Keep all Tailwind classes, framer-motion animations, Leaflet map, and design tokens unchanged

---

## Requirement 16: Email Notifications (Resend)

### Description
Configure transactional email via Resend for quote requests and review submissions.

### Acceptance Criteria
- [ ] Email sent to business on new quote request
- [ ] Confirmation email sent to customer (if email provided)
- [ ] Email sent to admin on new review submission
- [ ] Email templates for each notification type
- [ ] Resend API key configured via environment variable

### Technical Notes
- See `cms_prd.md` Section 7.2 for email implementation
- Use `RESEND_API_KEY` environment variable

---

## Requirement 17: Data Seeding Script

### Description
Create a one-time seed script to migrate all static data into the CMS.

### Acceptance Criteria
- [ ] Seeds all collections: categories (3), services (29), service-areas (24), team-members (4), reviews (5), FAQs (7), vehicle-makes (10), vehicle-models (50+)
- [ ] Seeds all globals: site-settings, homepage-layout, navigation
- [ ] Uploads media files: 12 certificates, 6 gallery images, service images, category images
- [ ] Merges `services.ts` + `serviceDetails.ts` into unified service records
- [ ] Sets all reviews as pre-approved
- [ ] Creates default admin user
- [ ] Idempotent (safe to re-run)

### Technical Notes
- See `cms_prd.md` Appendix B for seed script
- See `cms_prd.md` Appendix C for complete file inventory

---

## Requirement 18: Admin Dashboard Customization

### Description
Add custom admin dashboard components for better content management UX.

### Acceptance Criteria
- [ ] Dashboard overview with quick stats (leads count, services count, cities count, average rating)
- [ ] Lead pipeline view (Kanban: New → Contacted → Quoted → Won/Lost)
- [ ] Drag-and-drop homepage section reordering
- [ ] SEO page preview before publishing

### Technical Notes
- See `cms_prd.md` Section 11 for dashboard layout
- Lower priority — implement after core collections and frontend port

---

## Requirement 19: Service × City Combo Landing Pages

### Description
Generate SEO landing pages for every service + city combination (e.g., `/services/residential/lock-rekeying/lakewood`), scaling the site from 58 to 754+ pages. Each page targets hyper-local search intent like "lock rekeying in Lakewood OH".

### Acceptance Criteria
- [ ] Route: `/services/:category/:slug/:citySlug` renders a unique combo page
- [ ] Page content dynamically combines service data (title, description, benefits, pricing) with city data (name, state, response time, coordinates)
- [ ] Unique SEO meta tags per page: `<title>` = `"{Service Title} in {City}, OH | Xcel Locksmith"`, `<meta description>` localized
- [ ] BreadcrumbList JSON-LD with 4 levels: Home → Category → Service → Service in City
- [ ] LocalBusiness JSON-LD with `areaServed` set to the specific city
- [ ] `generateStaticParams` produces all 696 combinations (29 services × 24 cities)
- [ ] ISR with 1hr revalidation; auto-regenerates when services or cities change
- [ ] Canonical URL set to the combo page URL (not the base service page)
- [ ] Internal links: footer and service pages link to relevant combo pages
- [ ] City-specific CTA: "Call now for {service} in {city}" with phone number
- [ ] Nearby cities section linking to the same service in adjacent cities
- [ ] Related services section linking to other services in the same city
- [ ] Sitemap includes all combo pages at priority 0.7
- [ ] No duplicate content — each page has unique H1, intro paragraph, and localized trust signals (e.g., "Serving {city} for 18+ years")

### Content Template

```
H1: {Service Title} in {City}, OH
Intro: Localized paragraph combining service description + city context
Benefits: Same as service, with city-specific response time injected
Pricing: Same as service page
CTA: "Call (216) 555-1234 for {Service} in {City}"
Nearby Cities: Links to same service in 3-5 closest cities
Related Services: Links to 3-4 other services in same city
Breadcrumb: Home > {Category} > {Service} > {Service} in {City}
```

### Technical Notes
- See `cms_prd.md` Section 8.1 for page count math: 29 services × 24 cities = 696 combo pages
- Use Payload Local API: fetch service by slug + city by slug, compose page server-side
- Nearby cities: sort `service-areas` by haversine distance from current city coordinates
- Avoid thin content penalty: each page must have ≥300 words of unique localized content
- Consider a `combo_page_intro` richText field on the service or a template system for localized intros

### URL Structure

```
/services/residential/house-lockout-services/cleveland
/services/residential/house-lockout-services/lakewood
/services/residential/house-lockout-services/parma
/services/commercial/access-control-systems/westlake
/services/automotive/car-key-replacement/beachwood
...
```

### Sitemap Entry

```typescript
// In app/sitemap.ts — add combo pages
...services.docs.flatMap(svc =>
  areas.docs.map(area => ({
    url: `${baseUrl}/services/${svc.category.slug}/${svc.slug}/${area.slug}`,
    lastModified: new Date(Math.max(
      new Date(svc.updatedAt).getTime(),
      new Date(area.updatedAt).getTime()
    )),
    priority: 0.7,
  }))
),
```

---

## Implementation Order

1. **Requirement 1** — Project setup (Next.js + Payload + DB + Storage)
2. **Requirement 2** — Users & auth
3. **Requirement 3** — Media collection
4. **Requirements 4-12** — All content collections (can be parallelized)
5. **Requirement 13** — Global settings
6. **Requirement 17** — Data seeding
7. **Requirement 15** — Frontend port to Next.js
8. **Requirement 14** — Dynamic sitemap
9. **Requirement 16** — Email notifications
10. **Requirement 11** — Quote endpoint (if not done with collection)
11. **Requirement 19** — Service × City combo pages (after core pages work)
12. **Requirement 18** — Admin dashboard (polish phase)

---

## Reference Documents

- `FRONTEND.md` — Complete frontend architecture, components, data files, design system, SEO strategy, and CMS migration map
- `DEPLOYMENT.md` — Step-by-step Coolify setup on Netcup VPS: PostgreSQL, MinIO, app deployment, domain/SSL, backups
- `cms_prd.md` — Full technical PRD with architecture, schema, collection configs, API layer, and deployment details
- `PRD.md` — Original backend roadmap (superseded by cms_prd.md)
- `locksmith_business_prd.md` — Future multi-tenant SaaS vision (out of scope for initial CMS build)
- `GUIDE.md` — Client-facing layman's guide explaining site features and future CMS capabilities

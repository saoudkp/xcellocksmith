# Requirements Document

## Introduction

This specification defines the Payload CMS 3.x backend for the Xcel Locksmith website. The existing React 18 SPA (59 pages, 29 services, 24 cities) uses static TypeScript data files. This backend replaces those static imports with an API-driven CMS, making all content editable via an admin dashboard. The system deploys as a single Next.js 15 + Payload 3.x application on a Netcup VPS via Coolify, with PostgreSQL and MinIO running as Docker containers on the same network.

## Glossary

- **CMS**: The Payload CMS 3.x application running within the Next.js 15 App Router
- **Admin_Panel**: The Payload-generated admin UI accessible at the `/admin` route
- **Local_API**: The Payload Local API used for server-side data fetching with zero network overhead
- **Collection**: A Payload CMS content type backed by a PostgreSQL table (e.g., services, reviews)
- **Global**: A Payload CMS singleton configuration object (e.g., site-settings, navigation)
- **Media_Collection**: The Payload upload collection storing images, PDFs, and SVGs in MinIO S3-compatible storage
- **Seed_Script**: A one-time idempotent script that migrates static TypeScript data into CMS collections and globals
- **ISR**: Incremental Static Regeneration — Next.js feature that rebuilds static pages on a timed interval
- **RBAC**: Role-Based Access Control with a single role: admin (multiple admin users supported, each with their own credentials)
- **Monorepo**: The workspace structure with `apps/web/` (frontend), `apps/cms/` (backend), and `packages/shared/` (types)
- **Combo_Page**: A dynamically generated landing page for a specific service in a specific city (e.g., "Lock Rekeying in Lakewood, OH")
- **Honeypot**: A hidden form field used to detect and reject automated spam submissions
- **Revalidation_Hook**: A Payload `afterChange` lifecycle hook that triggers ISR page regeneration when content changes
- **MinIO**: S3-compatible object storage running as a Docker container for media file storage
- **Resend**: Transactional email service used for quote request and review notification emails
- **Coolify**: Self-hosted PaaS running on the VPS that manages deployments, SSL, and Docker containers

## Architectural Constraint: Content-Only CMS

The existing React 18 + Vite SPA frontend is fully built and working. The CMS is strictly a content management layer — it controls what the site says (text, images, services, FAQs, reviews, etc.), not how it looks (design, colors, animations, layout, components, styles).

### What the admin CAN change via CMS:
- Service titles, descriptions, pricing, and SEO metadata
- City/service area information and geographic data
- Team member profiles and certifications
- Reviews, FAQs, gallery images
- Navigation labels and links
- Business contact info, hours, and tagline
- Homepage section ordering and visibility (show/hide sections)
- Media uploads (images, PDFs)

### What the admin CANNOT change via CMS:
- Page layouts, component structure, or design patterns
- CSS styles, Tailwind classes, or animation behavior
- Color scheme, fonts, or visual effects (glassmorphism, gradients, pulse-glow)
- Component logic, routing, or interactive behavior
- Structured data schemas or SEO markup structure

### Future consideration (out of scope for initial build):
- Color and font customization via site-settings global (may be added in a later phase as a courtesy feature)

### Implementation rule:
All backend work (Payload CMS collections, globals, APIs, database, seeding) MUST be implemented without modifying any existing frontend files in `src/`. The frontend's design, components, styles, routing, and static data files SHALL remain untouched. The CMS backend is an additive layer — it provides an admin panel and API that will power a future Next.js port, but the current SPA continues to function as-is during and after backend implementation.

## Requirements

### Requirement 1: Project Initialization

**User Story:** As a developer, I want a fully initialized Next.js 15 + Payload CMS 3.x project with PostgreSQL and MinIO, so that I have a working foundation for all CMS collections and API endpoints.

**Note:** The CMS backend is initialized as a new project alongside the existing frontend. The existing React SPA source files SHALL NOT be modified during project initialization.

#### Acceptance Criteria

1. THE CMS SHALL initialize a Next.js 15 App Router project within the `apps/cms/` directory of the monorepo, with `packages/shared/` for shared TypeScript types
2. THE CMS SHALL use the `@payloadcms/db-postgres` adapter to connect to a local PostgreSQL instance via the `DATABASE_URL` environment variable
3. THE CMS SHALL use the `@payloadcms/storage-s3` plugin to connect to a local MinIO instance via `S3_ENDPOINT`, `S3_ACCESS_KEY`, and `S3_SECRET_KEY` environment variables
4. WHEN a developer navigates to `/admin`, THE CMS SHALL render the Payload admin UI
5. THE Monorepo SHALL maintain independent `package.json` files for each workspace package with no cross-dependency leakage
6. THE CMS SHALL document all required environment variables: `DATABASE_URL`, `PAYLOAD_SECRET`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, and `RESEND_API_KEY`
7. THE project initialization SHALL NOT modify, delete, or move any existing files in the current React SPA source directory

### Requirement 2: Users and Authentication

**User Story:** As a business owner, I want authenticated admin user accounts, so that only authorized people can manage CMS content.

#### Acceptance Criteria

1. THE CMS SHALL provide a `users` collection with authentication enabled (`auth: true`)
2. THE CMS SHALL support multiple admin users, each with their own email and password credentials
3. WHILE a user is authenticated, THE CMS SHALL grant full access to all collections, globals, and user management
4. WHEN an unauthenticated user attempts to access the Admin_Panel, THE CMS SHALL redirect to the login page
5. WHEN the Seed_Script runs and no admin user exists, THE Seed_Script SHALL create a default admin user

### Requirement 3: Media Collection

**User Story:** As a content manager, I want to upload and manage images, PDFs, and SVGs with automatic resizing, so that media is optimized for web delivery.

#### Acceptance Criteria

1. THE CMS SHALL provide a `media` collection configured as a Payload upload collection
2. THE Media_Collection SHALL auto-generate four image sizes: `thumbnail` (300×300), `card` (600×400), `hero` (1200×600), and `og` (1200×630)
3. THE Media_Collection SHALL accept files with MIME types: `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`, and `application/pdf`
4. THE Media_Collection SHALL require an `alt` text field and provide an optional `caption` text field on every upload
5. THE Media_Collection SHALL grant public read access and restrict create/update/delete access to authenticated users
6. THE Media_Collection SHALL store all files in MinIO via the `@payloadcms/storage-s3` plugin

### Requirement 4: Service Categories Collection

**User Story:** As a content manager, I want to manage locksmith service categories, so that services are organized into residential, commercial, and automotive groups.

#### Acceptance Criteria

1. THE CMS SHALL provide a `service-categories` collection with fields: `name` (text, required), `slug` (text, unique, required), `label` (text), `headline` (text), `description` (textarea), `seoTitle` (text), `seoDescription` (textarea), `heroImage` (relationship to Media_Collection), `color` (text), `isActive` (checkbox, default true), and `sortOrder` (number)
2. WHEN a content manager creates or updates a service category without providing a `slug`, THE CMS SHALL auto-generate the `slug` from the `name` field
3. WHEN the Seed_Script runs, THE Seed_Script SHALL create three service categories: `residential`, `commercial`, and `automotive`

### Requirement 5: Services Collection

**User Story:** As a content manager, I want to manage individual locksmith service pages, so that I can update service descriptions, pricing, and SEO metadata without developer involvement.

#### Acceptance Criteria

1. THE CMS SHALL provide a `services` collection with fields: `title` (text, required), `slug` (text, unique, required), `category` (relationship to `service-categories`, required), `shortDescription` (textarea), `longDescription` (richText), `startingPrice` (text), `icon` (text), `heroImage` (relationship to Media_Collection), `benefits` (array of text), `ctaText` (text), `seoTitle` (text), `seoDescription` (textarea), `isActive` (checkbox, default true), and `sortOrder` (number)
2. WHEN a content manager creates or updates a service without providing a `slug`, THE CMS SHALL auto-generate the `slug` from the `title` field
3. THE CMS SHALL grant public read access and restrict create/update/delete access to authenticated users for the `services` collection
4. WHEN a service document changes, THE CMS SHALL trigger a Revalidation_Hook to regenerate the corresponding service page via ISR
5. WHEN the Seed_Script runs, THE Seed_Script SHALL create all 29 services by merging data from `services.ts` (title, slug, category, shortDescription, startingPrice, icon) and `serviceDetails.ts` (longDescription, benefits, ctaText)

### Requirement 6: Service Areas Collection

**User Story:** As a content manager, I want to manage city landing pages with geographic coordinates, so that the website serves localized content for each service area.

#### Acceptance Criteria

1. THE CMS SHALL provide a `service-areas` collection with fields: `cityName` (text, required), `slug` (text, unique, required), `state` (text, default "OH"), `lat` (number, required), `lng` (number, required), `radiusMiles` (number, default 5), `responseTime` (text, default "20-30 min"), `seoTitle` (text), `seoDescription` (textarea), `isActive` (checkbox, default true), and `sortOrder` (number)
2. WHEN a service area document changes, THE CMS SHALL trigger a Revalidation_Hook to regenerate the corresponding city page and the sitemap via ISR
3. WHEN the Seed_Script runs, THE Seed_Script SHALL create all 24 service areas from `locations.ts` including geographic coordinates for Leaflet map rendering

### Requirement 7: Team Members Collection

**User Story:** As a content manager, I want to manage team member profiles and their professional certifications, so that the website displays up-to-date staff information and credentials.

#### Acceptance Criteria

1. THE CMS SHALL provide a `team-members` collection with fields: `name` (text, required), `role` (text, required), `experience` (text), `bio` (textarea), `photo` (relationship to Media_Collection, required), `specialties` (array of text), `certifications` (array with sub-fields: `name` (text), `file` (relationship to Media_Collection), `fileType` (select: image, pdf), `expiryDate` (date), `isVerified` (checkbox)), `isActive` (checkbox, default true), and `sortOrder` (number)
2. THE CMS SHALL restrict setting the `isVerified` field on a certification to authenticated users only
3. WHEN the Seed_Script runs, THE Seed_Script SHALL create 4 team members with 12 certifications from `team.ts` and upload certificate images from `public/certificates/` to the Media_Collection

### Requirement 8: Reviews Collection

**User Story:** As a business owner, I want customers to submit reviews that go through an approval workflow, so that only verified reviews appear on the website.

#### Acceptance Criteria

1. THE CMS SHALL provide a `reviews` collection with fields: `customerName` (text, required), `starRating` (number, min 1, max 5, required), `reviewText` (textarea, required), `reviewDate` (date), `source` (select: website, google, yelp, manual), `isApproved` (checkbox, default false), and `isFeatured` (checkbox, default false)
2. THE CMS SHALL grant public create access to the `reviews` collection so unauthenticated visitors can submit reviews
3. WHEN a public user queries the `reviews` collection, THE CMS SHALL return only reviews where `isApproved` is true
4. WHEN a new review is created, THE CMS SHALL send an email notification to the business admin email address
5. WHEN the Seed_Script runs, THE Seed_Script SHALL create 5 reviews from `reviews.ts` with `isApproved` set to true

### Requirement 9: FAQs Collection

**User Story:** As a content manager, I want to manage frequently asked questions, so that the website FAQ section and FAQPage JSON-LD schema stay current.

#### Acceptance Criteria

1. THE CMS SHALL provide a `faqs` collection with fields: `question` (text, required), `answer` (richText, required), `category` (select: general, pricing, services, emergency), `isActive` (checkbox, default true), and `sortOrder` (number)
2. WHEN the Seed_Script runs, THE Seed_Script SHALL create 7 FAQs from `faqs.ts`

### Requirement 10: Gallery Items Collection

**User Story:** As a content manager, I want to manage before/after comparison images, so that the website gallery showcases completed locksmith work.

#### Acceptance Criteria

1. THE CMS SHALL provide a `gallery-items` collection with fields: `title` (text, required), `beforeImage` (relationship to Media_Collection, required), `afterImage` (relationship to Media_Collection, required), `description` (textarea), `service` (relationship to `services`), `isActive` (checkbox, default true), and `sortOrder` (number)
2. WHEN the Seed_Script runs, THE Seed_Script SHALL upload 6 gallery images (3 before/after pairs) from `src/assets/gallery/` and create 3 gallery item records

### Requirement 11: Quote Requests Collection

**User Story:** As a business owner, I want to capture and manage customer quote requests with spam protection, so that leads are tracked and customers receive confirmation.

#### Acceptance Criteria

1. THE CMS SHALL provide a `quote-requests` collection with fields: `name` (text, required), `phone` (text, required), `email` (text), `serviceType` (select: residential, commercial, automotive), `service` (relationship to `services`), `location` (text), `photo` (relationship to Media_Collection), `notes` (textarea), `status` (select: new, contacted, quoted, won, lost; default: new), and `honeypot` (text, hidden from admin)
2. THE CMS SHALL grant public create access and restrict read/update/delete access to authenticated users for the `quote-requests` collection
3. WHEN a quote request is submitted with a non-empty `honeypot` field, THE CMS SHALL silently reject the submission and return a 200 OK response
4. WHEN a valid quote request is created, THE CMS SHALL send an email notification to the business email address and a confirmation email to the customer email address (if provided)
5. THE CMS SHALL provide a custom endpoint at `POST /api/submit-quote` that validates the request body using Zod before creating the quote request document

### Requirement 12: Vehicle Makes and Models Collections

**User Story:** As a content manager, I want to manage vehicle makes and models with their supported locksmith services, so that the Vehicle Verifier tool displays accurate compatibility data.

#### Acceptance Criteria

1. THE CMS SHALL provide a `vehicle-makes` collection with fields: `name` (text, required), `logo` (relationship to Media_Collection), `isActive` (checkbox, default true), and `sortOrder` (number)
2. THE CMS SHALL provide a `vehicle-models` collection with fields: `name` (text, required), `make` (relationship to `vehicle-makes`, required), `supportedServices` (relationship to `services`, hasMany: true), and `isActive` (checkbox, default true)
3. WHEN the Seed_Script runs, THE Seed_Script SHALL create 10 vehicle makes and 50+ vehicle models from `vehicles.ts` and upload make logos to the Media_Collection

### Requirement 13: Global Settings

**User Story:** As a business owner, I want to manage site-wide settings, homepage layout, and navigation from the admin panel, so that branding, contact info, and page structure are editable without code changes.

#### Acceptance Criteria

1. THE CMS SHALL provide a `site-settings` global with fields: `businessName` (text), `tagline` (text), `logo` (relationship to Media_Collection), `phone` (text), `email` (text), `address` (group: street, city, state, zip), `hours` (array of day/hours pairs), `responseTime` (text), `defaultSeoTitle` (text), `defaultSeoDescription` (textarea), and `analyticsId` (text). NOTE: Color and font customization fields are excluded from the initial build — design stays code-controlled. These may be added in a future phase as a courtesy feature for the admin.
2. THE CMS SHALL provide a `homepage-layout` global with an array of sections, each containing: `sectionType` (select from defined section types), `heading` (text), `subheading` (text), `isActive` (checkbox), and `sortOrder` (number)
3. THE CMS SHALL provide a `navigation` global with an array of nav items, each containing: `label` (text), `href` (text), `isActive` (checkbox), and `sortOrder` (number)
4. WHEN the Seed_Script runs, THE Seed_Script SHALL populate all three globals from `siteConfig.ts` (defaultBrand, defaultContact, defaultSections, defaultNavItems)

### Requirement 14: Dynamic Sitemap Generation

**User Story:** As a site owner, I want an automatically generated XML sitemap that includes all CMS-managed pages, so that search engines discover and index all content.

#### Acceptance Criteria

1. THE CMS SHALL generate an XML sitemap at `/sitemap.xml` by querying all active services, service categories, and service areas from the Local_API
2. THE CMS SHALL assign sitemap priorities: homepage = 1.0, category pages = 0.9, service pages = 0.8, city pages = 0.8, Combo_Pages = 0.7
3. THE CMS SHALL include a `lastModified` timestamp on each sitemap entry derived from the `updatedAt` field of the corresponding document
4. WHEN a service, service category, or service area document changes, THE CMS SHALL regenerate the sitemap via a Revalidation_Hook

### Requirement 15: Frontend Port to Next.js (Future Phase)

**User Story:** As a developer, I want to port the existing React SPA to Next.js Server and Client Components using Payload Local_API for data, so that the site gains SSR/ISR benefits while maintaining design parity.

**Note:** This requirement is a future phase. The existing React 18 + Vite SPA frontend SHALL NOT be modified during backend implementation. The CMS backend, collections, globals, APIs, and seed data are built first as an independent additive layer. The frontend port happens only after the backend is fully operational and verified.

#### Acceptance Criteria

1. THE Frontend port SHALL NOT modify, delete, or overwrite any existing files in the current React SPA source directory
2. THE Frontend port SHALL render all 58 existing pages with visual output identical to the current React SPA (design parity)
3. THE Frontend port SHALL use Next.js Server Components for data fetching via the Payload Local_API and Client Components only for interactive elements: QuoteTool, VehicleVerifier, CertificateViewer, ReviewsSection form, ServiceAreaMap, HeroLockAnimation, ComparisonSlider, and StickyHeader
4. THE Frontend port SHALL configure ISR with a default revalidation interval of 3600 seconds (1 hour) for all pages and 1800 seconds (30 minutes) for pages displaying reviews
5. THE Frontend port SHALL statically generate all 58 SEO pages using `generateStaticParams`
6. THE Frontend port SHALL preserve all existing structured data schemas: LocalBusiness, FAQPage, Organization, BreadcrumbList, and Service JSON-LD
7. THE Frontend port SHALL preserve all breadcrumb navigation with BreadcrumbList JSON-LD on every landing page
8. THE Frontend port SHALL preserve all footer internal links to category pages, city pages, and popular services
9. THE Frontend port SHALL serve a valid `robots.txt` and the dynamically generated `sitemap.xml`

### Requirement 16: Email Notifications

**User Story:** As a business owner, I want automatic email notifications for new quote requests and review submissions, so that leads and customer feedback are never missed.

#### Acceptance Criteria

1. WHEN a valid quote request is created, THE CMS SHALL send a notification email to the business email address via the Resend API using the `RESEND_API_KEY` environment variable
2. WHEN a valid quote request is created and the customer provided an email address, THE CMS SHALL send a confirmation email to the customer email address
3. WHEN a new review is submitted, THE CMS SHALL send a notification email to the business admin email address
4. THE CMS SHALL use HTML email templates for each notification type: quote-request-business, quote-request-customer, and review-notification
5. IF the Resend API returns an error, THEN THE CMS SHALL log the error and continue processing the request without failing the parent operation

### Requirement 17: Data Seeding Script

**User Story:** As a developer, I want a single idempotent seed script that migrates all static data into the CMS, so that the database is populated with production-ready content on first deployment.

#### Acceptance Criteria

1. THE Seed_Script SHALL create records for all collections: 3 service categories, 29 services, 24 service areas, 4 team members, 5 reviews, 7 FAQs, 10 vehicle makes, 50+ vehicle models, and 3 gallery items
2. THE Seed_Script SHALL populate all three globals: site-settings, homepage-layout, and navigation
3. THE Seed_Script SHALL upload all media files: 12 certificate images, 6 gallery images, service hero images, and category hero images to the Media_Collection
4. THE Seed_Script SHALL merge data from `services.ts` and `serviceDetails.ts` into unified service records containing both summary and detail fields
5. THE Seed_Script SHALL set all seeded reviews to `isApproved: true`
6. THE Seed_Script SHALL create a default admin user when no admin user exists in the database
7. WHEN the Seed_Script is executed multiple times, THE Seed_Script SHALL skip records that already exist (idempotent behavior) by checking for existing documents by slug or unique identifier before creating

### Requirement 18: Admin Dashboard Customization

**User Story:** As a business owner, I want a customized admin dashboard with quick stats and a lead pipeline view, so that I can manage business operations efficiently.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a dashboard overview with quick stats: total quote requests count, total services count, total service areas count, and average review star rating
2. THE Admin_Panel SHALL provide a lead pipeline view that groups quote requests by status (new, contacted, quoted, won, lost) in a Kanban-style layout
3. THE Admin_Panel SHALL provide drag-and-drop reordering for homepage sections in the `homepage-layout` global editor
4. THE Admin_Panel SHALL provide an SEO preview component that displays the rendered `<title>` and `<meta description>` before publishing a service or service area

### Requirement 19: Service and City Combo Landing Pages (Future Phase)

**User Story:** As a site owner, I want auto-generated landing pages for every service + city combination, so that the site targets hyper-local search queries like "lock rekeying in Lakewood OH" and scales from 58 to 754+ indexed pages.

**Note:** This requirement depends on the frontend port (Requirement 15) and is a future phase. The existing frontend SHALL NOT be modified to implement combo pages.

#### Acceptance Criteria

1. THE Frontend SHALL render Combo_Pages at the route `/services/:category/:slug/:citySlug` by combining service data and city data from the Local_API
2. THE Frontend SHALL generate unique SEO meta tags per Combo_Page: `<title>` formatted as "{Service Title} in {City}, OH | Xcel Locksmith" and a localized `<meta description>`
3. THE Frontend SHALL include BreadcrumbList JSON-LD with 4 levels on each Combo_Page: Home, Category, Service, and Service in City
4. THE Frontend SHALL include LocalBusiness JSON-LD with `areaServed` set to the specific city on each Combo_Page
5. THE Frontend SHALL use `generateStaticParams` to produce all 696 combinations (29 services × 24 cities) at build time
6. THE Frontend SHALL configure ISR with a 3600-second (1 hour) revalidation interval for Combo_Pages and trigger regeneration when the corresponding service or service area document changes
7. THE Frontend SHALL set the canonical URL on each Combo_Page to the Combo_Page URL itself (not the base service page URL)
8. THE Frontend SHALL display a "Nearby Cities" section on each Combo_Page linking to the same service in the 3 to 5 geographically closest cities (sorted by haversine distance)
9. THE Frontend SHALL display a "Related Services" section on each Combo_Page linking to 3 to 4 other services in the same city
10. THE CMS SHALL include all Combo_Pages in the sitemap at priority 0.7 with `lastModified` set to the most recent `updatedAt` between the service and the service area
11. THE Frontend SHALL render a unique H1 heading, a localized introductory paragraph of 300+ words, and city-specific trust signals on each Combo_Page to avoid duplicate content
12. THE Frontend SHALL display a city-specific CTA on each Combo_Page formatted as "Call (216) 555-1234 for {Service Title} in {City}"

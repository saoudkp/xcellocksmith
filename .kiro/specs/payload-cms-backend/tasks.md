# Implementation Plan: Payload CMS Backend

## Overview

Incremental build of the Payload CMS 3.x backend for the Xcel Locksmith website. Tasks progress from project scaffolding → shared types → collections → globals → hooks → custom endpoints → email → sitemap → seed script → admin dashboard. Each task builds on the previous, with no orphaned code. Requirements 15 and 19 (frontend port and combo pages) are excluded — they are future phases.

## Tasks

- [x] 1. Scaffold monorepo and initialize Payload CMS project
  - [x] 1.1 Create monorepo workspace structure with `apps/cms/` and `packages/shared/`
    - Create root `package.json` with workspaces config pointing to `apps/*` and `packages/*`
    - Create `apps/cms/package.json` with Next.js 15, Payload CMS 3.x, `@payloadcms/db-postgres`, `@payloadcms/storage-s3`, `@payloadcms/richtext-lexical` dependencies
    - Create `packages/shared/package.json` with TypeScript
    - Create `tsconfig.json` files for both packages
    - _Requirements: 1.1, 1.5_

  - [x] 1.2 Configure Payload CMS entry point and Next.js App Router
    - Create `apps/cms/src/payload.config.ts` with PostgreSQL adapter, S3 storage plugin, and empty collections/globals arrays
    - Create `apps/cms/next.config.mjs` with `withPayload` wrapper
    - Create `apps/cms/src/app/(payload)/admin/[[...segments]]/page.tsx` and `layout.tsx` for Payload admin routes
    - Create `apps/cms/src/app/(payload)/api/[...slug]/route.ts` for Payload REST API
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 1.3 Create environment configuration
    - Create `apps/cms/.env.example` documenting all required variables: `DATABASE_URL`, `PAYLOAD_SECRET`, `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`, `S3_REGION`, `RESEND_API_KEY`
    - _Requirements: 1.6_

- [x] 2. Checkpoint — Verify Payload admin UI loads
  - Ensure the project compiles and `/admin` renders the Payload login screen. Ask the user if questions arise.

- [x] 3. Define shared types and access control utilities
  - [x] 3.1 Create shared TypeScript type definitions
    - Create `packages/shared/src/types/` with interfaces for all collections and globals matching the design data models
    - Export all types from `packages/shared/src/index.ts`
    - _Requirements: 1.1, 1.5_

  - [x] 3.2 Create shared access control functions
    - Create `apps/cms/src/access/index.ts` with `isAuthenticated`, `publicReadAdminWrite`, `reviewsAccess`, and `quoteRequestsAccess` functions as defined in the design
    - _Requirements: 2.3, 3.5, 5.3, 8.2, 8.3, 11.2_

  - [x] 3.3 Write property test for collection access control enforcement
    - **Property 2: Collection access control enforcement**
    - Test that `publicReadAdminWrite` returns `true` for read and requires auth for create/update/delete
    - Test that `reviewsAccess` returns `{ isApproved: { equals: true } }` for unauthenticated reads and `true` for authenticated reads
    - Test that `quoteRequestsAccess` allows public create but requires auth for read/update/delete
    - **Validates: Requirements 2.3, 3.5, 5.3, 8.2, 11.2**

  - [x] 3.4 Write property test for reviews returning only approved documents for public queries
    - **Property 3: Reviews return only approved documents for public queries**
    - Generate random sets of reviews with mixed `isApproved` values
    - Verify unauthenticated access filter returns only `{ isApproved: { equals: true } }`
    - **Validates: Requirements 8.3**

- [x] 4. Implement Users and Media collections
  - [x] 4.1 Create Users collection
    - Create `apps/cms/src/collections/Users.ts` with `auth: true`, admin group "Admin"
    - Register in `payload.config.ts`
    - _Requirements: 2.1, 2.2_

  - [x] 4.2 Create Media collection
    - Create `apps/cms/src/collections/Media.ts` with upload config: 4 image sizes (thumbnail, card, hero, og), MIME type restrictions, required `alt` field, optional `caption`
    - Apply `publicReadAdminWrite` access control
    - Register in `payload.config.ts`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 Write property test for media MIME type validation and alt text requirement
    - **Property 12: Media validates MIME type and requires alt text**
    - Generate random MIME types and verify only allowed types pass validation
    - Verify that omitting `alt` fails validation
    - **Validates: Requirements 3.3, 3.4**

  - [x] 4.4 Write property test for media image size generation
    - **Property 11: Media upload produces all configured image sizes**
    - Verify the media collection config defines exactly 4 image sizes with correct dimensions
    - Verify SVG and PDF MIME types are accepted but would not trigger resizing
    - **Validates: Requirements 3.2**

- [x] 5. Implement auto-slug hook and content collections
  - [x] 5.1 Create auto-slug generation hook
    - Create `apps/cms/src/hooks/autoGenerateSlug.ts` as a `beforeValidate` hook
    - Generates URL-safe, lowercase, hyphenated slug from name/title field when slug is empty
    - _Requirements: 4.2, 5.2_

  - [x] 5.2 Write property test for slug auto-generation
    - **Property 1: Slug auto-generation**
    - Generate random name/title strings and verify slugs are URL-safe, lowercase, hyphenated, and deterministic
    - **Validates: Requirements 4.2, 5.2**

  - [x] 5.3 Create Service Categories collection
    - Create `apps/cms/src/collections/ServiceCategories.ts` with all fields from the design
    - Attach `autoGenerateSlug` hook and `publicReadAdminWrite` access
    - Register in `payload.config.ts`
    - _Requirements: 4.1, 4.2_

  - [x] 5.4 Create Services collection
    - Create `apps/cms/src/collections/Services.ts` with all fields from the design
    - Attach `autoGenerateSlug` hook and `publicReadAdminWrite` access
    - Register in `payload.config.ts`
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.5 Create Service Areas collection
    - Create `apps/cms/src/collections/ServiceAreas.ts` with all fields from the design
    - Apply `publicReadAdminWrite` access
    - Register in `payload.config.ts`
    - _Requirements: 6.1_

  - [x] 5.6 Create Team Members collection
    - Create `apps/cms/src/collections/TeamMembers.ts` with all fields including nested certifications array
    - Restrict `isVerified` field update to authenticated users
    - Apply `publicReadAdminWrite` access
    - Register in `payload.config.ts`
    - _Requirements: 7.1, 7.2_

  - [x] 5.7 Create Reviews collection
    - Create `apps/cms/src/collections/Reviews.ts` with all fields from the design
    - Apply `reviewsAccess` access control (public create, approved-only public read)
    - Register in `payload.config.ts`
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 5.8 Create FAQs collection
    - Create `apps/cms/src/collections/Faqs.ts` with all fields from the design
    - Apply `publicReadAdminWrite` access
    - Register in `payload.config.ts`
    - _Requirements: 9.1_

  - [x] 5.9 Create Gallery Items collection
    - Create `apps/cms/src/collections/GalleryItems.ts` with all fields from the design
    - Apply `publicReadAdminWrite` access
    - Register in `payload.config.ts`
    - _Requirements: 10.1_

  - [x] 5.10 Create Quote Requests collection
    - Create `apps/cms/src/collections/QuoteRequests.ts` with all fields from the design
    - Apply `quoteRequestsAccess` access control (public create, admin read/manage)
    - Set `honeypot` field as `admin: { hidden: true }`
    - Register in `payload.config.ts`
    - _Requirements: 11.1, 11.2_

  - [x] 5.11 Create Vehicle Makes and Vehicle Models collections
    - Create `apps/cms/src/collections/VehicleMakes.ts` and `apps/cms/src/collections/VehicleModels.ts`
    - Apply `publicReadAdminWrite` access to both
    - Register both in `payload.config.ts`
    - _Requirements: 12.1, 12.2_

- [x] 6. Checkpoint — Verify all collections appear in admin UI
  - Ensure all 12 collections are registered and visible in the Payload admin panel with correct field configurations. Ask the user if questions arise.

- [x] 7. Implement globals
  - [x] 7.1 Create Site Settings global
    - Create `apps/cms/src/globals/SiteSettings.ts` with all fields from the design (businessName, tagline, logo, phone, email, address group, hours array, responseTime, SEO defaults, analyticsId)
    - Register in `payload.config.ts`
    - _Requirements: 13.1_

  - [x] 7.2 Create Homepage Layout global
    - Create `apps/cms/src/globals/HomepageLayout.ts` with sections array (sectionType select, heading, subheading, isActive, sortOrder)
    - Register in `payload.config.ts`
    - _Requirements: 13.2_

  - [x] 7.3 Create Navigation global
    - Create `apps/cms/src/globals/Navigation.ts` with items array (label, href, isActive, sortOrder)
    - Register in `payload.config.ts`
    - _Requirements: 13.3_

- [x] 8. Implement lifecycle hooks
  - [x] 8.1 Create revalidation hooks
    - Create `apps/cms/src/hooks/revalidateServicePages.ts` — `afterChange` hook for services collection triggering ISR revalidation
    - Create `apps/cms/src/hooks/revalidateCityPages.ts` — `afterChange` hook for service-areas collection triggering ISR revalidation
    - Create `apps/cms/src/hooks/regenerateSitemap.ts` — `afterChange` hook for services, service-areas, and service-categories triggering sitemap regeneration
    - Attach hooks to their respective collections
    - _Requirements: 5.4, 6.2, 14.4_

  - [x] 8.2 Write property test for revalidation hooks firing on content changes
    - **Property 6: Revalidation hooks fire on content changes**
    - Mock `revalidatePath`/`revalidateTag` and verify hooks invoke revalidation for random document changes
    - **Validates: Requirements 5.4, 6.2, 14.4**

  - [x] 8.3 Create honeypot rejection hook
    - Create `apps/cms/src/hooks/rejectHoneypot.ts` — `beforeChange` hook on quote-requests that prevents document creation when honeypot is non-empty
    - Attach to quote-requests collection
    - _Requirements: 11.3_

  - [x] 8.4 Write property test for honeypot silently rejecting spam
    - **Property 4: Honeypot silently rejects spam submissions**
    - Generate random non-empty honeypot values and verify the hook prevents document creation
    - **Validates: Requirements 11.3**

- [x] 9. Implement email notifications
  - [x] 9.1 Create email templates
    - Create `apps/cms/src/email/templates/quote-request-business.ts` — HTML template for business notification
    - Create `apps/cms/src/email/templates/quote-request-customer.ts` — HTML template for customer confirmation
    - Create `apps/cms/src/email/templates/review-notification.ts` — HTML template for admin review notification
    - Create `apps/cms/src/email/send.ts` — Resend API wrapper with error handling (log and continue)
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [x] 9.2 Create quote notification hook
    - Create `apps/cms/src/hooks/sendQuoteNotification.ts` — `afterChange` hook on quote-requests (create only)
    - Sends business notification email; sends customer confirmation if email provided
    - Wraps email calls in try/catch so failures don't break the parent operation
    - Attach to quote-requests collection
    - _Requirements: 11.4, 16.1, 16.2, 16.5_

  - [x] 9.3 Create review notification hook
    - Create `apps/cms/src/hooks/sendReviewNotification.ts` — `afterChange` hook on reviews (create only)
    - Sends admin notification email
    - Wraps email calls in try/catch so failures don't break the parent operation
    - Attach to reviews collection
    - _Requirements: 8.4, 16.3, 16.5_

  - [x] 9.4 Write property test for quote request email notifications
    - **Property 7: Quote request triggers correct email notifications**
    - Generate random quote data with and without customer email
    - Verify business notification always sent; customer confirmation sent only when email provided
    - **Validates: Requirements 11.4, 16.1, 16.2**

  - [x] 9.5 Write property test for email failure resilience
    - **Property 8: Email failures do not break parent operations**
    - Mock Resend API to throw errors and verify the hook completes without throwing
    - **Validates: Requirements 16.5**

  - [x] 9.6 Write property test for review creation triggering admin notification
    - **Property 15: Review creation triggers admin notification**
    - Generate random review data and verify admin notification email is always sent on creation
    - **Validates: Requirements 8.4, 16.3**

- [x] 10. Implement custom quote submission endpoint
  - [x] 10.1 Create POST /api/submit-quote route
    - Create `apps/cms/src/app/api/submit-quote/route.ts`
    - Parse request body with Zod schema (name, phone required; email, serviceType, service, location, notes, honeypot optional)
    - If honeypot non-empty, return 200 OK without creating document
    - On valid input, create quote-requests document via Payload Local API
    - Return 201 Created with document ID on success, 400 on validation failure
    - _Requirements: 11.3, 11.5_

  - [x] 10.2 Write property test for Zod validation on quote endpoint
    - **Property 5: Quote endpoint validates input via Zod schema**
    - Generate random invalid bodies (missing name, missing phone, invalid email format, invalid serviceType)
    - Verify endpoint rejects with validation error and no document is created
    - **Validates: Requirements 11.5**

- [x] 11. Checkpoint — Verify hooks, email, and quote endpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement dynamic sitemap generation
  - [x] 12.1 Create sitemap.xml route
    - Create `apps/cms/src/app/sitemap.xml/route.ts`
    - Query all active services, service-categories, and service-areas via Payload Local API
    - Build XML sitemap with correct priorities (homepage=1.0, categories=0.9, services=0.8, cities=0.8)
    - Include `lastModified` from each document's `updatedAt` field
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 12.2 Write property test for sitemap including all active documents
    - **Property 9: Sitemap includes all active documents**
    - Generate random sets of active/inactive documents and verify only active ones appear in sitemap output
    - **Validates: Requirements 14.1**

  - [x] 12.3 Write property test for sitemap priorities and lastModified
    - **Property 10: Sitemap entries have correct priority and lastModified**
    - Generate random documents and verify priority matches page type and lastModified matches updatedAt
    - **Validates: Requirements 14.2, 14.3**

- [x] 13. Implement seed script
  - [x] 13.1 Create seed script infrastructure
    - Create `apps/cms/src/seed/index.ts` — main entry point using Payload Local API
    - Implement idempotent check helper: query by slug/unique identifier before creating
    - Implement admin user creation when no admin exists
    - _Requirements: 2.5, 17.6, 17.7_

  - [x] 13.2 Implement collection seeders
    - Create data mapper functions that read from existing `src/data/*.ts` files
    - Seed service categories (3), services (29, merged from `services.ts` + `serviceDetails.ts`), service areas (24), team members (4) with certifications (12), reviews (5, `isApproved: true`), FAQs (7), vehicle makes (10), vehicle models (50+), gallery items (3)
    - Upload media files (certificates, gallery images, hero images) to Media collection
    - _Requirements: 4.3, 5.5, 6.3, 7.3, 8.5, 9.2, 10.2, 12.3, 17.1, 17.3, 17.4, 17.5_

  - [x] 13.3 Implement global seeders
    - Seed site-settings, homepage-layout, and navigation globals from `siteConfig.ts`
    - _Requirements: 13.4, 17.2_

  - [x] 13.4 Write property test for seed script idempotency
    - **Property 13: Seed script is idempotent**
    - Verify that the idempotent check helper correctly skips existing records (by slug) and creates missing ones
    - **Validates: Requirements 17.7**

  - [x] 13.5 Write property test for service data merge correctness
    - **Property 14: Seed script merges service data correctly**
    - For each service slug present in both source files, verify the merged record contains fields from both sources
    - **Validates: Requirements 17.4**

- [x] 14. Implement admin dashboard customization
  - [x] 14.1 Create admin dashboard components
    - Create custom Payload admin dashboard view at `apps/cms/src/app/(payload)/admin/[[...segments]]/` or via Payload admin config
    - Implement quick stats: total quote requests, total services, total service areas, average review rating
    - Implement lead pipeline view grouping quote requests by status
    - _Requirements: 18.1, 18.2_

  - [x] 14.2 Add SEO preview and homepage section reordering
    - Add SEO preview component for services and service-areas collection admin views showing rendered title and meta description
    - Configure drag-and-drop reordering for homepage-layout sections array
    - _Requirements: 18.3, 18.4_

- [x] 15. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Requirements 15 (Frontend Port) and 19 (Combo Pages) are excluded — they are future phases
- Each task references specific requirements for traceability
- Property tests use fast-check with Vitest, minimum 100 iterations per property
- All 15 correctness properties from the design are covered by property test sub-tasks
- Checkpoints ensure incremental validation at key milestones

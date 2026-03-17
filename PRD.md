# 📋 Product Requirements Document (PRD)
## Xcel Locksmith — Backend & SEO Architecture

---

## 1. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | Next.js 15 (App Router) | SSR/SSG for SEO, API routes, image optimization |
| **CMS** | Payload CMS 3.x | Free, open-source, self-hosted, Next.js native (embedded in same app) |
| **Database** | PostgreSQL (Neon free tier or self-hosted) | Reliable, free, Payload 3.x has native Postgres adapter |
| **Hosting** | Vercel (free tier) or VPS (Railway/Fly.io) | Edge-optimized, auto-deploy from GitHub |
| **Email** | Resend (free 100/day) or Nodemailer | Quote form submissions, contact notifications |
| **Analytics** | Plausible (self-hosted) or Umami | Privacy-friendly, no cookie banners needed |
| **Image CDN** | Next.js `<Image>` + Payload media | Auto WebP/AVIF, responsive srcsets |

---

## 2. Database Schema (PostgreSQL)

### Services
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| title | VARCHAR(200) | |
| slug | VARCHAR(200) UNIQUE | URL-friendly |
| category_id | INT FK | → service_categories |
| short_description | TEXT | Card preview text |
| long_description | TEXT | Full page content (rich text) |
| starting_price | INT | In dollars |
| image_url | VARCHAR(500) | Hero image for service page |
| is_active | BOOLEAN | Toggle visibility |
| benefits | JSONB | Array of benefit strings |
| seo_meta | JSONB | `{ title, description, ogImage }` |
| order | INT | Sort order within category |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

### Service Categories
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| name | VARCHAR(100) | Residential, Commercial, Automotive |
| slug | VARCHAR(100) UNIQUE | |
| icon | VARCHAR(50) | Lucide icon name |
| description | TEXT | Category description |
| image_url | VARCHAR(500) | Category header image |
| order | INT | Sort order |

### Reviews
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| customer_name | VARCHAR(100) | |
| rating | INT | 1-5 |
| review_text | TEXT | |
| service_type | VARCHAR(50) | Optional: tag to service |
| is_approved | BOOLEAN | Admin approval required |
| created_at | TIMESTAMPTZ | Auto |

### Quote Requests
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| name | VARCHAR(100) | |
| phone | VARCHAR(20) | |
| email | VARCHAR(255) | Optional |
| service_type | VARCHAR(100) | Selected service |
| location | VARCHAR(255) | Customer location |
| photo_url | VARCHAR(500) | Optional uploaded photo |
| status | VARCHAR(20) | `new`, `contacted`, `completed`, `cancelled` |
| admin_notes | TEXT | Internal notes |
| created_at | TIMESTAMPTZ | Auto |

### Team Members
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| name | VARCHAR(100) | |
| role | VARCHAR(100) | |
| bio | TEXT | |
| photo_url | VARCHAR(500) | |
| certifications | JSONB | Array of cert strings |
| specialties | JSONB | Array of specialty strings |
| years_experience | INT | |
| is_active | BOOLEAN | |
| order | INT | Sort order |

### Service Areas
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| city_name | VARCHAR(100) | |
| slug | VARCHAR(100) UNIQUE | For city landing pages |
| latitude | FLOAT | Map marker position |
| longitude | FLOAT | Map marker position |
| response_time | VARCHAR(50) | e.g. "20-30 min" |
| description | TEXT | Unique city-specific content |
| seo_meta | JSONB | `{ title, description }` |
| is_active | BOOLEAN | |

### Gallery Items
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| title | VARCHAR(200) | |
| category | VARCHAR(50) | Residential, Automotive, Commercial |
| before_image | VARCHAR(500) | |
| after_image | VARCHAR(500) | |
| description | TEXT | Optional |
| is_active | BOOLEAN | |
| order | INT | Sort order |

### FAQs
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| question | VARCHAR(500) | |
| answer | TEXT | Rich text |
| category | VARCHAR(50) | Optional: group by topic |
| order | INT | Sort order |
| is_active | BOOLEAN | |

### Site Settings
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| key | VARCHAR(100) UNIQUE | e.g. `brand.phone`, `brand.name` |
| value | JSONB | Flexible value storage |

### Pages (Dynamic SEO Pages)
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| title | VARCHAR(200) | |
| slug | VARCHAR(200) UNIQUE | Full URL path |
| content | TEXT | Rich text / blocks |
| seo_meta | JSONB | `{ title, description, ogImage }` |
| template | VARCHAR(50) | `service`, `city`, `category`, `custom` |
| is_published | BOOLEAN | |

---

## 3. Payload CMS Collections

```
collections/
├── Services.ts          → 29 locksmith services (admin-editable)
├── ServiceCategories.ts → Residential, Commercial, Automotive
├── Reviews.ts           → Customer reviews with approval workflow
├── QuoteRequests.ts     → Lead capture (name, phone, service, photo)
├── TeamMembers.ts       → Staff profiles, certs, specialties
├── ServiceAreas.ts      → 24 cities with geo coords
├── GalleryItems.ts      → Before/after project photos
├── FAQs.ts              → Questions & answers
├── Pages.ts             → Dynamic SEO landing pages
└── SiteSettings.ts      → Global config (phone, hours, brand)
```

### Key Payload Features to Use

- **Access Control**: Public read, admin-only write
- **Hooks**: `afterChange` on QuoteRequests → send email notification
- **Upload Collection**: Media with auto-resize for service images
- **Versions/Drafts**: On Services and Pages for safe editing
- **Live Preview**: Preview changes before publishing

---

## 4. SEO Landing Pages Strategy

### 4a. Individual Service Pages (29 pages)

**URL Pattern:** `/services/{category}/{service-slug}`

**Examples:**
- `/services/residential/smart-lock-installation`
- `/services/commercial/access-control-systems`
- `/services/automotive/transponder-key-programming`

**Each page includes:**
- H1: Service name + "in Cleveland, OH"
- Hero image specific to the service
- Detailed description (500+ words, admin-editable)
- Benefits list with icons
- Pricing transparency section
- Before/After gallery (filtered to that service)
- Related services carousel
- FAQ section (filtered to that service)
- CTA: Call Now + Get Free Quote
- JSON-LD: `Service` schema with `areaServed`, `priceRange`
- Breadcrumbs: Home → Category → Service

### 4b. City/Location Pages (24 pages)

**URL Pattern:** `/service-areas/{city-slug}`

**Examples:**
- `/service-areas/cleveland`
- `/service-areas/lakewood`
- `/service-areas/parma`

**Each page includes:**
- H1: "Locksmith Services in {City}, OH"
- City-specific description (unique content per city)
- Map centered on that city
- Available services list
- Response time for that area
- Local reviews (if tagged to city)
- CTA: Call Now + Get Free Quote
- JSON-LD: `LocalBusiness` with city-specific `areaServed`

### 4c. Category Pages (3 pages)

**URL Pattern:** `/services/{category}`

**Examples:**
- `/services/residential`
- `/services/commercial`
- `/services/automotive`

**Each page includes:**
- All services in that category with cards
- Category description
- Filtered gallery and reviews

### 4d. Combo Pages (optional, high SEO value)

**URL Pattern:** `/services/{service-slug}/{city-slug}`

**Examples:**
- `/services/car-lockout/cleveland`
- `/services/lock-rekeying/lakewood`

**Generates:** 29 services × 24 cities = **696 unique pages** via SSG

---

## 5. Next.js Route Structure

```
app/
├── (marketing)/
│   ├── page.tsx                          → Homepage (current SPA)
│   ├── services/
│   │   ├── page.tsx                      → All services overview
│   │   ├── [category]/
│   │   │   ├── page.tsx                  → Category page
│   │   │   └── [slug]/
│   │   │       └── page.tsx              → Individual service page
│   ├── service-areas/
│   │   ├── page.tsx                      → All service areas
│   │   └── [city]/
│   │       └── page.tsx                  → City landing page
│   ├── reviews/
│   │   └── page.tsx                      → All reviews page
│   └── contact/
│       └── page.tsx                      → Contact page
├── api/
│   ├── quote/route.ts                    → Quote form submission
│   ├── review/route.ts                   → Review submission
│   └── contact/route.ts                  → Contact form
├── admin/                                → Payload CMS admin panel (auto)
└── layout.tsx                            → Root layout with header/footer
```

---

## 6. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/quote` | POST | Submit quote request → DB + email |
| `/api/review` | POST | Submit review → DB (pending approval) |
| `/api/contact` | POST | Contact form → email notification |
| Payload auto-generates | GET | `/api/services`, `/api/reviews`, etc. |

### Quote Form API — Validation (Zod)

```typescript
import { z } from 'zod';

const quoteSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(20),
  email: z.string().email().optional(),
  serviceType: z.enum(['residential', 'commercial', 'automotive']),
  location: z.string().trim().min(1).max(255),
  photoUrl: z.string().url().optional(),
});
```

### Review Submission API — Validation

```typescript
const reviewSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().trim().min(10).max(1000),
  serviceType: z.string().optional(),
});
```

---

## 7. Migration Plan

### Phase 1 — Setup (3 days)
- [ ] Initialize Next.js 15 + Payload CMS 3.x project
- [ ] Configure PostgreSQL on Neon (free tier)
- [ ] Define all Payload collections with fields & validations
- [ ] Seed database with current static data from `services.ts`, `team.ts`, `locations.ts`, `faqs.ts`, `reviews.ts`

### Phase 2 — Port Frontend (5 days)
- [ ] Port all React components to Next.js (minimal changes needed)
- [ ] Replace static data imports with Payload API calls
- [ ] Implement SSG (`generateStaticParams`) for service pages
- [ ] Implement SSG for city landing pages
- [ ] Implement SSG for category pages
- [ ] Add breadcrumb navigation

### Phase 3 — Backend Logic (3 days)
- [ ] Quote form API endpoint with Zod validation + DB insert + email notification (Resend)
- [ ] Review submission endpoint with approval workflow
- [ ] Contact form API endpoint with email notification
- [ ] Admin dashboard customization in Payload

### Phase 4 — SEO & Launch (3 days)
- [ ] Auto-generated `sitemap.xml` with all 700+ pages
- [ ] `robots.txt` configuration
- [ ] Per-page `<meta>` tags and Open Graph tags
- [ ] Per-page JSON-LD structured data
- [ ] Google Search Console submission
- [ ] Performance audit (Lighthouse 90+ target)
- [ ] Deploy to Vercel + connect custom domain

**Total estimated timeline: ~14 days**

---

## 8. Hosting & Cost Estimate

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| **Neon PostgreSQL** | Free tier (0.5GB, 100 hours/mo) | $0 |
| **Vercel** | Hobby (100GB bandwidth) | $0 |
| **Resend** | Free (100 emails/day) | $0 |
| **Umami Analytics** | Self-hosted on Vercel | $0 |
| **Domain** | Existing domain | ~$1/mo |
| **Total** | | **~$0–1/mo** |

### Scaling costs (if needed later):
- Neon Pro: $19/mo (more storage & compute)
- Vercel Pro: $20/mo (more bandwidth, analytics)
- Resend Pro: $20/mo (50k emails/mo)

---

## 9. Current vs. New — Comparison

| Feature | Current (React SPA) | New (Next.js + Payload) |
|---------|-------------------|----------------------|
| SEO | Single page, client-rendered | 700+ SSG pages, server-rendered |
| Content editing | Code changes required | Admin panel (no code) |
| Quote form | No persistence | Saved to DB + email alert |
| Reviews | localStorage only | DB with admin approval workflow |
| Images | Static imports | CMS upload + auto-optimization |
| Analytics | None | Privacy-friendly tracking |
| Sitemap | None | Auto-generated with all pages |
| Page speed | Good (SPA) | Excellent (SSG + edge caching) |
| Google ranking | Limited (1 page) | High potential (700+ pages) |

---

## 10. Payload Collection Example — Services

```typescript
// collections/Services.ts
import { CollectionConfig } from 'payload';

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'startingPrice', 'isActive'],
  },
  access: {
    read: () => true,        // Public
    create: ({ req }) => !!req.user,  // Admin only
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true,
      admin: { position: 'sidebar' } },
    { name: 'category', type: 'relationship', relationTo: 'service-categories', required: true },
    { name: 'shortDescription', type: 'textarea', required: true, maxLength: 200 },
    { name: 'longDescription', type: 'richText', required: true },
    { name: 'startingPrice', type: 'number', required: true, min: 0 },
    { name: 'heroImage', type: 'upload', relationTo: 'media', required: true },
    { name: 'benefits', type: 'array', fields: [
      { name: 'benefit', type: 'text' },
    ]},
    { name: 'isActive', type: 'checkbox', defaultValue: true,
      admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', defaultValue: 0,
      admin: { position: 'sidebar' } },
    { name: 'seoTitle', type: 'text', maxLength: 60,
      admin: { position: 'sidebar' } },
    { name: 'seoDescription', type: 'textarea', maxLength: 160,
      admin: { position: 'sidebar' } },
  ],
};
```

---

## 11. Sample Service Landing Page Component

```tsx
// app/services/[category]/[slug]/page.tsx
import { getPayloadClient } from '@/lib/payload';
import { Metadata } from 'next';

interface Props {
  params: { category: string; slug: string };
}

export async function generateStaticParams() {
  const payload = await getPayloadClient();
  const services = await payload.find({ collection: 'services', limit: 100 });
  return services.docs.map((s) => ({
    category: s.category.slug,
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const payload = await getPayloadClient();
  const service = await payload.find({
    collection: 'services',
    where: { slug: { equals: params.slug } },
    limit: 1,
  });
  const s = service.docs[0];
  return {
    title: s.seoTitle || `${s.title} | Xcel Locksmith Cleveland`,
    description: s.seoDescription || s.shortDescription,
  };
}

export default async function ServicePage({ params }: Props) {
  const payload = await getPayloadClient();
  const service = await payload.find({
    collection: 'services',
    where: { slug: { equals: params.slug } },
    limit: 1,
    depth: 2,
  });
  const s = service.docs[0];

  return (
    <main>
      {/* Breadcrumbs */}
      {/* Hero with image */}
      {/* Long description */}
      {/* Benefits grid */}
      {/* Pricing section */}
      {/* Before/After gallery */}
      {/* Related services */}
      {/* FAQ section */}
      {/* CTA: Call Now + Get Free Quote */}
      {/* JSON-LD script */}
    </main>
  );
}
```

---

*Document generated: February 2026*
*Version: 1.0*
*Project: Xcel Locksmith — xcellocksmith.com*

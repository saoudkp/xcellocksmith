# LockSmith SaaS — Vertical SaaS Platform PRD

> **Product:** LockSmith SaaS — White-Label Website & Business Platform for Locksmith Companies  
> **Version:** 1.0  
> **Date:** 2026-02-23  
> **Status:** Concept / Planning

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Opportunity](#2-market-opportunity)
3. [Product Vision](#3-product-vision)
4. [Platform Architecture](#4-platform-architecture)
5. [Multi-Tenant Data Model](#5-multi-tenant-data-model)
6. [Core Features — Tier Breakdown](#6-core-features--tier-breakdown)
7. [White-Label Customization Engine](#7-white-label-customization-engine)
8. [Lead Management & CRM](#8-lead-management--crm)
9. [SEO Automation Engine](#9-seo-automation-engine)
10. [Booking & Dispatch System](#10-booking--dispatch-system)
11. [Payments & Invoicing](#11-payments--invoicing)
12. [Analytics & Reporting](#12-analytics--reporting)
13. [Mobile App (Technician)](#13-mobile-app-technician)
14. [Onboarding Flow](#14-onboarding-flow)
15. [Pricing Strategy](#15-pricing-strategy)
16. [Revenue Projections](#16-revenue-projections)
17. [Competitive Analysis](#17-competitive-analysis)
18. [Go-To-Market Strategy](#18-go-to-market-strategy)
19. [Technical Roadmap](#19-technical-roadmap)
20. [Risk Assessment](#20-risk-assessment)

---

## 1. Executive Summary

**LockSmith SaaS** transforms the Xcel Locksmith website into a **multi-tenant vertical SaaS platform** that any locksmith business can sign up for and get a fully functional, SEO-optimized, lead-generating website and business management tool — in minutes, not months.

### The Problem

- **90%+ of locksmith businesses** have no website or a terrible one
- Those with websites pay $2,000-$10,000 for custom builds that can't be updated
- Zero industry-specific SaaS exists for locksmiths (unlike restaurants, salons, dentists)
- Locksmiths lose leads to competitors with better online presence
- No centralized tool for quotes, dispatch, invoicing, and reviews

### The Solution

A **plug-and-play platform** where a locksmith signs up, enters their business info, and gets:

```
✅ Professional website (SEO-optimized, mobile-first)
✅ Online quote tool & lead capture
✅ Review management
✅ Team & certification management
✅ Service area mapping
✅ Vehicle compatibility database
✅ Optional: booking, dispatch, invoicing, payments
```

### Why This Works

The Xcel Locksmith codebase already solves 80% of what every locksmith needs. The remaining 20% is multi-tenancy, customization, and business tools.

---

## 2. Market Opportunity

### Market Size

```
┌────────────────────────────────────────────────────┐
│              US LOCKSMITH MARKET                    │
│                                                     │
│  Total locksmith businesses in US:     ~25,000      │
│  Businesses with no/poor website:      ~18,000 (72%)│
│  Businesses paying for website:        ~7,000       │
│  Average annual spend on web/marketing: $3,600      │
│                                                     │
│  ────────────────────────────────────────────        │
│  TAM (Total Addressable Market):                    │
│    25,000 × $1,200/yr (Starter) = $30M/yr          │
│                                                     │
│  SAM (Serviceable):                                 │
│    12,000 × $2,400/yr (avg plan) = $28.8M/yr       │
│                                                     │
│  SOM (Obtainable, Year 1-3):                        │
│    500 × $2,400/yr = $1.2M ARR                      │
│                                                     │
│  Global expansion (UK, CA, AU):                     │
│    3x multiplier = $90M TAM                         │
└────────────────────────────────────────────────────┘
```

### Why Locksmiths are Underserved

| Industry | Vertical SaaS Options | Locksmith Equivalent |
|----------|----------------------|---------------------|
| Restaurants | Toast, Square, Yelp Reservations | ❌ Nothing |
| Salons | Fresha, Vagaro, Booksy | ❌ Nothing |
| Dentists | Dentrix, Curve Dental | ❌ Nothing |
| Plumbers | ServiceTitan, Housecall Pro | ⚠️ Generic (not locksmith-specific) |
| **Locksmiths** | **Nothing industry-specific** | **🎯 LockSmith SaaS** |

---

## 3. Product Vision

### Year 1: Website + Leads

```
Locksmith signs up → Gets website → Captures leads → Grows business
```

### Year 2: Operations

```
Website + Leads + Booking + Dispatch + Invoicing + Payments
```

### Year 3: Ecosystem

```
Full platform + Marketplace + Training + Certification tracking + Industry data
```

### Product Principles

1. **5-Minute Setup** — Business live online in under 5 minutes
2. **Zero Technical Knowledge** — If you can use a smartphone, you can use this
3. **Locksmith-First** — Every feature designed for locksmith workflows
4. **SEO by Default** — Every site auto-optimized for local search
5. **Mobile-First** — Dashboard and customer site work perfectly on phones

---

## 4. Platform Architecture

### Multi-Tenant Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATFORM LAYER                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Gateway │  │ Tenant Router│  │ Billing      │      │
│  │ (Clerk/Auth0)│  │              │  │ (Stripe)     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Payload CMS (Multi-Tenant)              │    │
│  │                                                      │    │
│  │  Tenant A (Xcel Locksmith)                           │    │
│  │  ├── Services, Areas, Team, Reviews, Leads           │    │
│  │  ├── Custom domain: xcellocksmith.com                │    │
│  │  └── Theme: dark, accent: amber                      │    │
│  │                                                      │    │
│  │  Tenant B (Bob's Locks)                              │    │
│  │  ├── Services, Areas, Team, Reviews, Leads           │    │
│  │  ├── Custom domain: bobslocks.com                    │    │
│  │  └── Theme: light, accent: blue                      │    │
│  │                                                      │    │
│  │  Tenant C (Metro Lock & Key)                         │    │
│  │  ├── Services, Areas, Team, Reviews, Leads           │    │
│  │  └── Subdomain: metrolock.locksmithsaas.com          │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │ Redis        │  │ S3 / R2      │
│ (shared DB,  │  │ (sessions,   │  │ (media per   │
│  RLS per     │  │  cache)      │  │  tenant)     │
│  tenant)     │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Tenant Isolation Strategy

```
Option A: Shared Database with Row-Level Security (RLS)
  ├── All tenants in one PostgreSQL instance
  ├── Every table has tenant_id column
  ├── RLS policies enforce isolation
  ├── ✅ Cost-efficient, easy maintenance
  └── Best for: MVP, <1000 tenants

Option B: Schema-per-Tenant
  ├── Each tenant gets own PostgreSQL schema
  ├── Better isolation, easier backups
  ├── ⚠️ More complex migrations
  └── Best for: 1000-10,000 tenants

Option C: Database-per-Tenant
  ├── Complete isolation
  ├── ⚠️ Most expensive, hardest to manage
  └── Best for: enterprise, compliance-heavy
  
Recommendation: Start with Option A, migrate to B at scale
```

---

## 5. Multi-Tenant Data Model

### Core Schema Additions

```sql
-- Tenants table (the locksmith businesses)
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,        -- "xcel-locksmith"
  custom_domain TEXT UNIQUE,                 -- "xcellocksmith.com"
  subdomain     TEXT UNIQUE NOT NULL,        -- "xcel.locksmithsaas.com"
  owner_id      UUID REFERENCES users(id),
  plan          TEXT DEFAULT 'starter',      -- starter|pro|enterprise
  plan_status   TEXT DEFAULT 'trialing',     -- trialing|active|past_due|canceled
  stripe_customer_id   TEXT,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  
  -- Branding
  logo_url      TEXT,
  primary_color TEXT DEFAULT '45 100% 51%',  -- HSL
  accent_color  TEXT DEFAULT '45 100% 51%',
  theme_mode    TEXT DEFAULT 'dark',         -- dark|light
  
  -- Contact
  phone         TEXT NOT NULL,
  phone_display TEXT NOT NULL,
  email         TEXT NOT NULL,
  address       TEXT,
  hours         TEXT DEFAULT 'Open 24/7/365',
  response_time TEXT DEFAULT '20-30 Min',
  
  -- SEO
  seo_title       TEXT,
  seo_description TEXT,
  og_image_url    TEXT,
  
  -- Limits (per plan)
  max_services    INT DEFAULT 10,
  max_cities      INT DEFAULT 5,
  max_team        INT DEFAULT 3,
  max_reviews     INT DEFAULT 20,
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Every content table gets tenant_id
ALTER TABLE services ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE service_areas ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE team_members ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE reviews ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE faqs ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE gallery_items ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE quote_requests ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE vehicle_makes ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Row-Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON services
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
-- Repeat for all tenant-scoped tables
```

### Entity Relationship (Multi-Tenant)

```
                    ┌──────────────┐
                    │   tenants    │
                    │──────────────│
                    │ id (PK)      │
                    │ business_name│
                    │ slug         │
                    │ plan         │
                    │ branding...  │
                    │ contact...   │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
    │ services  │   │  service  │   │   team    │
    │           │   │  _areas   │   │ _members  │
    │tenant_id  │   │tenant_id  │   │tenant_id  │
    └───────────┘   └───────────┘   └─────┬─────┘
                                          │
    ┌───────────┐   ┌───────────┐   ┌─────┴─────┐
    │  reviews  │   │   faqs    │   │  certs    │
    │tenant_id  │   │tenant_id  │   │           │
    └───────────┘   └───────────┘   └───────────┘
    
    ┌───────────┐   ┌───────────┐
    │  quote    │   │  gallery  │
    │ _requests │   │ _items    │
    │tenant_id  │   │tenant_id  │
    └───────────┘   └───────────┘
```

---

## 6. Core Features — Tier Breakdown

### Feature Matrix

```
┌──────────────────────────────┬──────────┬──────────┬────────────┐
│ Feature                      │ Starter  │   Pro    │ Enterprise │
│                              │ $49/mo   │ $99/mo   │ $199/mo    │
├──────────────────────────────┼──────────┼──────────┼────────────┤
│ Professional Website         │    ✅    │    ✅    │     ✅     │
│ Mobile-Responsive            │    ✅    │    ✅    │     ✅     │
│ SSL Certificate              │    ✅    │    ✅    │     ✅     │
│ Subdomain hosting            │    ✅    │    ✅    │     ✅     │
│ Custom domain                │    ❌    │    ✅    │     ✅     │
│ Services (max)               │    10    │    30    │  Unlimited │
│ Service areas / cities       │     5    │    25    │  Unlimited │
│ Team members                 │     3    │    10    │  Unlimited │
│ Reviews displayed            │    20    │   100    │  Unlimited │
│ Before/After gallery         │     5    │    20    │  Unlimited │
│ Quote request form           │    ✅    │    ✅    │     ✅     │
│ Email notifications          │    ✅    │    ✅    │     ✅     │
│ SEO auto-optimization        │  Basic   │ Advanced │   Custom   │
│ Auto-generated SEO pages     │    ❌    │    ✅    │     ✅     │
│ Vehicle compatibility tool   │    ❌    │    ✅    │     ✅     │
│ Certificate verification     │    ✅    │    ✅    │     ✅     │
│ FAQ management               │    10    │    50    │  Unlimited │
│ Service area map             │    ✅    │    ✅    │     ✅     │
│ Google review integration    │    ❌    │    ✅    │     ✅     │
│ Lead CRM                     │    ❌    │    ✅    │     ✅     │
│ Online booking               │    ❌    │    ❌    │     ✅     │
│ Dispatch system              │    ❌    │    ❌    │     ✅     │
│ Invoicing & payments         │    ❌    │    ❌    │     ✅     │
│ Stripe payments              │    ❌    │    ❌    │     ✅     │
│ White-label (remove branding)│    ❌    │    ❌    │     ✅     │
│ Priority support             │    ❌    │    ✅    │     ✅     │
│ Custom theme colors          │    ❌    │    ✅    │     ✅     │
│ Multiple theme templates     │    ❌    │    ❌    │     ✅     │
│ API access                   │    ❌    │    ❌    │     ✅     │
│ Analytics dashboard          │  Basic   │ Advanced │   Custom   │
│ Technician mobile app        │    ❌    │    ❌    │     ✅     │
└──────────────────────────────┴──────────┴──────────┴────────────┘
```

---

## 7. White-Label Customization Engine

### What's Customizable Per Tenant

```
┌─────────────────────────────────────────────────────────┐
│                CUSTOMIZATION ENGINE                      │
│                                                          │
│  🎨 Branding                                             │
│  ├── Logo (upload)                                       │
│  ├── Favicon (upload)                                    │
│  ├── Business name                                       │
│  ├── Tagline                                             │
│  └── Footer text                                         │
│                                                          │
│  🎭 Theme                                                │
│  ├── Color mode (dark / light)                           │
│  ├── Primary color (HSL picker)                          │
│  ├── Accent color (HSL picker)                           │
│  ├── Font pairing (5 presets)                            │
│  └── Border radius style (sharp / rounded / pill)        │
│                                                          │
│  📝 Content                                              │
│  ├── All services (titles, descriptions, prices, images) │
│  ├── All cities/service areas (names, coords)            │
│  ├── Team members (photos, bios, certifications)         │
│  ├── Reviews (manual + Google import)                    │
│  ├── FAQs (questions & answers)                          │
│  ├── Gallery (before/after images)                       │
│  └── Vehicle database (makes, models, services)          │
│                                                          │
│  📞 Contact                                              │
│  ├── Phone number(s)                                     │
│  ├── Email                                               │
│  ├── Address                                             │
│  ├── Business hours                                      │
│  ├── Response time claim                                 │
│  └── Social media links                                  │
│                                                          │
│  🏠 Layout                                               │
│  ├── Homepage section order (drag & drop)                │
│  ├── Section visibility (show/hide any section)          │
│  ├── Navigation items                                    │
│  └── Hero headline & subheadline                         │
│                                                          │
│  🌐 Domain                                               │
│  ├── Free subdomain: business.locksmithsaas.com          │
│  └── Custom domain: mybusiness.com (Pro+)                │
│                                                          │
│  🔍 SEO                                                  │
│  ├── Page titles & meta descriptions                     │
│  ├── OG image (upload)                                   │
│  ├── Google Analytics / Tag Manager ID                   │
│  └── Structured data (auto-generated)                    │
└─────────────────────────────────────────────────────────┘
```

### Theme Presets

```
┌───────────┬──────────────┬────────────┬──────────────┐
│  Preset   │  Background  │  Primary   │  Best For    │
├───────────┼──────────────┼────────────┼──────────────┤
│ Midnight  │ Dark navy    │ Gold/Amber │ Premium feel │
│ Clean     │ White        │ Blue       │ Trust/Corp   │
│ Bold      │ Black        │ Red        │ Emergency    │
│ Nature    │ Dark green   │ Lime       │ Eco-friendly │
│ Classic   │ Cream        │ Brown      │ Traditional  │
└───────────┴──────────────┴────────────┴──────────────┘
```

---

## 8. Lead Management & CRM

### Lead Pipeline

```
┌─────────┐    ┌───────────┐    ┌────────┐    ┌──────┐    ┌──────┐
│   New   │───►│ Contacted │───►│ Quoted │───►│ Won  │    │ Lost │
│         │    │           │    │        │    │      │    │      │
│ Auto    │    │ Admin     │    │ Price  │    │ Job  │    │ No   │
│ notify  │    │ follows   │    │ sent   │    │ done │    │ sale │
│ via     │    │ up by     │    │ to     │    │      │    │      │
│ email   │    │ phone/    │    │ custo- │    │      │    │      │
│ + SMS   │    │ email     │    │ mer    │    │      │    │      │
└─────────┘    └───────────┘    └────────┘    └──────┘    └──────┘
     │                                             │
     └─── Response time tracked ──────────────────┘
```

### Lead Features

- **Auto-notifications**: Email + optional SMS when new lead arrives
- **Lead source tracking**: Website form, phone call, Google Ads, direct
- **Follow-up reminders**: Auto-remind if lead not contacted within X hours
- **Notes & history**: Full timeline of interactions per lead
- **Revenue tracking**: Track won deals to measure ROI
- **Export**: CSV/Excel export of all leads

---

## 9. SEO Automation Engine

### How It Works

```
Admin adds "Akron" as a service area
          │
          ▼
┌─────────────────────────────────────────────────┐
│           SEO ENGINE AUTO-GENERATES              │
│                                                  │
│  1. /service-areas/akron                         │
│     "24/7 Locksmith in Akron, OH | [Business]"   │
│                                                  │
│  2. For EACH service:                            │
│     /services/residential/house-lockout/akron    │
│     /services/automotive/car-key-replacement/akron│
│     ... (29 more pages)                          │
│                                                  │
│  3. Updated sitemap.xml                          │
│  4. Updated structured data                      │
│  5. Internal links from all city pages           │
│  6. Google Search Console ping                   │
│                                                  │
│  Result: 31 new SEO-optimized pages              │
└─────────────────────────────────────────────────┘
```

### Per-Tenant SEO Metrics Dashboard

```
┌─────────────────────────────────────────┐
│  SEO Health Score: 92/100               │
│                                         │
│  📄 Total indexed pages:     127        │
│  🔗 Internal links:         1,847       │
│  📊 Avg position (Google):   8.3        │
│  🔍 Keywords ranking:         47        │
│  📈 Organic traffic (30d):   342        │
│  📞 Calls from organic:       23        │
│                                         │
│  Issues:                                │
│  ⚠️ 3 services missing descriptions    │
│  ⚠️ 1 city page missing meta desc      │
└─────────────────────────────────────────┘
```

---

## 10. Booking & Dispatch System

### Customer Booking Flow

```
Customer visits site
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Select       │────►│ Choose date/ │────►│ Confirm &    │
│ service type │     │ time window  │     │ pay deposit  │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │ Auto-assign  │
                                          │ technician   │
                                          │ (nearest     │
                                          │  available)  │
                                          └──────┬───────┘
                                                  │
                              ┌────────────────────┤
                              ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐
                     │ Customer     │     │ Technician   │
                     │ gets SMS     │     │ gets job     │
                     │ confirmation │     │ notification │
                     └──────────────┘     └──────────────┘
```

### Dispatch Board

```
┌────────────────────────────────────────────────────────────────┐
│  DISPATCH BOARD — Tuesday, Feb 23, 2026                        │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Marcus J.   │  │ Sarah C.    │  │ David R.    │            │
│  │ ● Active    │  │ ● Active    │  │ ○ Available │            │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤            │
│  │ 9:00 AM     │  │ 8:30 AM     │  │             │            │
│  │ House       │  │ Commercial  │  │  No jobs    │            │
│  │ lockout     │  │ rekey       │  │  assigned   │            │
│  │ 📍 Cleveland│  │ 📍 Lakewood │  │             │            │
│  │ ETA: 15 min │  │ In Progress │  │             │            │
│  ├─────────────┤  ├─────────────┤  │  [Assign]   │            │
│  │ 11:00 AM    │  │ 10:30 AM    │  │             │            │
│  │ Car key     │  │ Smart lock  │  │             │            │
│  │ replacement │  │ install     │  │             │            │
│  │ 📍 Parma   │  │ 📍 Westlake │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  🗺️ [Map View]  📋 [List View]  📊 [Timeline View]            │
└────────────────────────────────────────────────────────────────┘
```

---

## 11. Payments & Invoicing

### Payment Flow

```
Job completed
      │
      ▼
Technician marks job done (mobile app)
      │
      ├── Auto-generates invoice
      │     ├── Service line items
      │     ├── Parts used
      │     ├── Labor time
      │     └── Tax calculation
      │
      ├── Customer receives invoice via email/SMS
      │     ├── Pay online (Stripe)
      │     ├── Pay on-site (card reader)
      │     └── Pay later (net-30)
      │
      └── Payment recorded in system
            ├── Revenue tracking
            ├── Technician commission calculation
            └── Monthly reporting
```

### Stripe Connect Integration

```
Platform (LockSmith SaaS)
  ├── Platform fee: 2.5% per transaction
  │
  ├── Tenant A (Xcel Locksmith) — Stripe Connected Account
  │   └── Receives 97.5% minus Stripe fees
  │
  ├── Tenant B (Bob's Locks) — Stripe Connected Account
  │   └── Receives 97.5% minus Stripe fees
  │
  └── Tenant C (Metro Lock) — Stripe Connected Account
      └── Receives 97.5% minus Stripe fees
```

---

## 12. Analytics & Reporting

### Dashboard Metrics

```
┌─────────────────────────────────────────────────────────────┐
│  BUSINESS DASHBOARD — February 2026                          │
│                                                              │
│  Revenue                    Leads                            │
│  ┌─────────────────┐       ┌─────────────────┐              │
│  │ $12,450         │       │ 47 New          │              │
│  │ ↑ 18% vs Jan    │       │ ↑ 23% vs Jan   │              │
│  └─────────────────┘       └─────────────────┘              │
│                                                              │
│  Conversion Rate            Avg Job Value                    │
│  ┌─────────────────┐       ┌─────────────────┐              │
│  │ 34%             │       │ $187            │              │
│  │ ↑ 5% vs Jan     │       │ ↓ 3% vs Jan    │              │
│  └─────────────────┘       └─────────────────┘              │
│                                                              │
│  Top Services This Month:                                    │
│  1. Car Lockout Services        $3,200 (28 jobs)             │
│  2. House Lockout Services      $2,800 (35 jobs)             │
│  3. Lock Rekeying               $1,950 (22 jobs)             │
│                                                              │
│  Top Cities:                                                 │
│  1. Cleveland    42%                                         │
│  2. Lakewood     18%                                         │
│  3. Parma        12%                                         │
│                                                              │
│  Lead Sources:                                               │
│  🔍 Organic Search   52%                                     │
│  📱 Google Maps      28%                                     │
│  📋 Direct           12%                                     │
│  📣 Referral          8%                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Mobile App (Technician)

### Features

```
┌─────────────────────────────────────────┐
│         TECHNICIAN APP (PWA)             │
│                                          │
│  📋 Today's Jobs                         │
│  ├── View assigned jobs                  │
│  ├── Accept/decline jobs                 │
│  ├── Navigate to location (Maps)         │
│  ├── Mark en route / arrived / complete  │
│  └── Add notes & photos                  │
│                                          │
│  💳 On-Site Payments                     │
│  ├── Card reader (Stripe Terminal)       │
│  └── Generate receipt                    │
│                                          │
│  📸 Job Documentation                    │
│  ├── Before/after photos                 │
│  ├── Parts used                          │
│  └── Time tracking                       │
│                                          │
│  📊 My Stats                             │
│  ├── Jobs completed this week/month      │
│  ├── Revenue generated                   │
│  ├── Customer ratings                    │
│  └── Commission earned                   │
└─────────────────────────────────────────┘
```

---

## 14. Onboarding Flow

### 5-Minute Setup

```
Step 1: Sign Up (30 sec)
  ├── Email + password
  └── Business name
        │
        ▼
Step 2: Business Info (60 sec)
  ├── Phone number
  ├── Address / city
  ├── Business hours
  └── Logo upload (optional)
        │
        ▼
Step 3: Services (60 sec)
  ├── Pre-populated with all 29 locksmith services
  ├── Toggle on/off the ones you offer
  └── Adjust starting prices
        │
        ▼
Step 4: Service Areas (60 sec)
  ├── Enter your city → auto-suggest nearby cities
  ├── Set response time
  └── Map preview
        │
        ▼
Step 5: Preview & Launch (60 sec)
  ├── Live preview of your website
  ├── Choose subdomain (or connect custom domain)
  └── 🚀 PUBLISH
        │
        ▼
✅ Website is LIVE
   ├── Subdomain: yourbusiness.locksmithsaas.com
   ├── SEO pages auto-generating
   ├── Quote form active
   └── You'll get email notifications for new leads
```

---

## 15. Pricing Strategy

### Pricing Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRICING                                   │
│                                                                  │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   STARTER   │    │      PRO        │    │   ENTERPRISE    │  │
│  │             │    │   ⭐ POPULAR    │    │                 │  │
│  │   $49/mo    │    │    $99/mo       │    │    $199/mo      │  │
│  │   or        │    │    or           │    │    or           │  │
│  │   $470/yr   │    │    $950/yr      │    │    $1,900/yr    │  │
│  │   (save 20%)│    │    (save 20%)   │    │    (save 20%)   │  │
│  │             │    │                 │    │                 │  │
│  │ Website     │    │ Everything in   │    │ Everything in   │  │
│  │ Quote form  │    │ Starter, plus:  │    │ Pro, plus:      │  │
│  │ 10 services │    │ Custom domain   │    │ Booking system  │  │
│  │ 5 cities    │    │ 30 services     │    │ Dispatch        │  │
│  │ 3 team      │    │ 25 cities       │    │ Invoicing       │  │
│  │ Basic SEO   │    │ Advanced SEO    │    │ Stripe payments │  │
│  │             │    │ Lead CRM        │    │ Mobile app      │  │
│  │             │    │ Vehicle tool    │    │ White-label     │  │
│  │             │    │ Priority support│    │ API access      │  │
│  │             │    │                 │    │                 │  │
│  │ [Start Free │    │ [Start Free     │    │ [Contact Sales] │  │
│  │  Trial]     │    │  Trial]         │    │                 │  │
│  └─────────────┘    └─────────────────┘    └─────────────────┘  │
│                                                                  │
│            All plans include 14-day free trial                   │
│            No credit card required to start                      │
└─────────────────────────────────────────────────────────────────┘
```

### Revenue Streams

```
1. Subscription Revenue (primary)
   └── $49 - $199/mo per tenant

2. Transaction Fees (Enterprise)
   └── 2.5% per payment processed via Stripe Connect

3. Add-Ons
   ├── Additional cities: $5/city/mo
   ├── Additional team members: $3/member/mo
   ├── SMS notifications: $0.05/SMS
   ├── Google Ads management: $99/mo
   └── Custom development: $150/hr

4. Marketplace (Future)
   ├── Premium themes: $49 one-time
   ├── Training courses: $29-$99
   └── Equipment deals (affiliate): 10% commission
```

---

## 16. Revenue Projections

### Year 1-3 Forecast

```
┌────────────────────────────────────────────────────┐
│              REVENUE PROJECTIONS                    │
│                                                     │
│  Year 1 (Launch → Growth)                           │
│  ├── Q1: Beta launch, 20 tenants (free/discounted)  │
│  ├── Q2: Public launch, 50 tenants                  │
│  ├── Q3: Marketing push, 120 tenants                │
│  ├── Q4: 200 tenants                                │
│  ├── Avg MRR: $15,000                               │
│  └── Year 1 ARR: $180,000                           │
│                                                     │
│  Year 2 (Scale)                                     │
│  ├── 500 tenants                                    │
│  ├── Avg plan: $85/mo (mix of plans)                │
│  ├── MRR: $42,500                                   │
│  ├── Transaction fees: $3,000/mo                    │
│  └── Year 2 ARR: $546,000                           │
│                                                     │
│  Year 3 (Dominate)                                  │
│  ├── 1,200 tenants                                  │
│  ├── International expansion (UK, CA, AU)           │
│  ├── MRR: $108,000                                  │
│  ├── Transaction fees: $12,000/mo                   │
│  └── Year 3 ARR: $1,440,000                         │
│                                                     │
│  Break-even: Month 8 (at ~80 tenants)               │
│  Monthly costs: ~$4,000 (hosting + tools + support)  │
└────────────────────────────────────────────────────┘
```

### Unit Economics

```
Customer Acquisition Cost (CAC):      $150
Customer Lifetime Value (LTV):        $1,800 (avg 24 months × $75/mo)
LTV:CAC Ratio:                        12:1 ✅ (>3:1 is healthy)
Monthly Churn Target:                 <3%
Payback Period:                       2 months
Gross Margin:                         85%+ (SaaS standard)
```

---

## 17. Competitive Analysis

### Direct Competitors (None Specific to Locksmiths)

```
┌──────────────────┬─────────────┬──────────────┬───────────────┐
│                  │ LockSmith   │ ServiceTitan │ Housecall Pro │
│                  │ SaaS (Ours) │ (Generic)    │ (Generic)     │
├──────────────────┼─────────────┼──────────────┼───────────────┤
│ Locksmith-       │     ✅      │      ❌      │      ❌       │
│ specific         │             │              │               │
├──────────────────┼─────────────┼──────────────┼───────────────┤
│ Website included │     ✅      │      ❌      │      ❌       │
├──────────────────┼─────────────┼──────────────┼───────────────┤
│ SEO pages auto   │     ✅      │      ❌      │      ❌       │
├──────────────────┼─────────────┼──────────────┼───────────────┤
│ Vehicle database │     ✅      │      ❌      │      ❌       │
├──────────────────┼─────────────┼──────────────┼───────────────┤
│ Certification    │     ✅      │      ❌      │      ❌       │
│ verification     │             │              │               │
├──────────────────┼─────────────┼──────────────┼───────────────┤
│ Starting price   │   $49/mo    │   $245/mo    │    $65/mo     │
├──────────────────┼─────────────┼──────────────┼───────────────┤
│ Setup time       │   5 min     │   2 weeks    │    1 week     │
├──────────────────┼─────────────┼──────────────┼───────────────┤
│ Target market    │ Locksmiths  │ All trades   │  All trades   │
│                  │ only        │              │               │
└──────────────────┴─────────────┴──────────────┴───────────────┘
```

### Competitive Moat

```
1. INDUSTRY SPECIFICITY
   └── Pre-built for locksmiths = zero customization needed

2. VEHICLE DATABASE
   └── No competitor has vehicle compatibility data

3. SEO ENGINE
   └── Auto-generating 700+ SEO pages per tenant is unique

4. CERTIFICATION VERIFICATION
   └── Trust signal that no competitor offers

5. PRICE POINT
   └── 50-80% cheaper than generic alternatives

6. NETWORK EFFECTS (Future)
   └── More locksmiths → better vehicle data → better for everyone
```

---

## 18. Go-To-Market Strategy

### Phase 1: Beta (Months 1-3)

```
Target: 20 locksmith businesses (free or heavily discounted)
  ├── Direct outreach to locksmith associations
  │   ├── ALOA (Associated Locksmiths of America)
  │   ├── State locksmith associations
  │   └── Local locksmith groups on Facebook
  ├── Cold email/call local locksmith businesses
  ├── Offer free setup + 3 months free
  └── Collect feedback & testimonials
```

### Phase 2: Launch (Months 4-6)

```
Target: 100 paying customers
  ├── Content marketing
  │   ├── "How to get more locksmith leads" blog series
  │   ├── YouTube: "5-minute locksmith website setup" demos
  │   └── SEO targeting "locksmith website builder"
  ├── Paid acquisition
  │   ├── Google Ads: "locksmith website", "locksmith marketing"
  │   ├── Facebook/Instagram: targeting locksmith business owners
  │   └── LinkedIn: targeting locksmith company pages
  ├── Partnerships
  │   ├── Locksmith supply companies (referral program)
  │   ├── Locksmith training schools
  │   └── Industry conferences / trade shows
  └── Referral program: $50/referral for existing customers
```

### Phase 3: Scale (Months 7-12)

```
Target: 200+ customers
  ├── Affiliate program (locksmith YouTubers, bloggers)
  ├── White-label partnerships (locksmith franchise groups)
  ├── International expansion (UK market first)
  └── Product-led growth (free tier or extended trial)
```

---

## 19. Technical Roadmap

### Phase 1: MVP (Weeks 1-6)

```
Week 1-2: Multi-Tenant Foundation
  □ Tenant model + RLS policies
  □ Signup/onboarding flow
  □ Subdomain routing (tenant.locksmithsaas.com)
  □ Stripe billing integration

Week 3-4: Core CMS per Tenant
  □ Port all Payload collections with tenant_id
  □ Admin dashboard per tenant
  □ Media upload per tenant (isolated S3 prefixes)
  □ Theme customization engine (colors, logo, fonts)

Week 5-6: Website Generation
  □ Dynamic site rendering from tenant data
  □ SEO page auto-generation per tenant
  □ Quote form → lead notification pipeline
  □ Custom domain support (Vercel domains API)
```

### Phase 2: Growth Features (Weeks 7-12)

```
  □ Lead CRM with pipeline view
  □ Google Reviews import API
  □ Advanced analytics dashboard
  □ Email marketing integration (welcome emails, follow-ups)
  □ Vehicle database shared across all tenants
  □ A/B testing framework for landing pages
```

### Phase 3: Operations (Weeks 13-20)

```
  □ Online booking system
  □ Dispatch board with map view
  □ Invoicing engine
  □ Stripe Connect for payments
  □ Technician PWA (mobile app)
  □ SMS notifications (Twilio)
```

### Phase 4: Ecosystem (Months 6-12)

```
  □ Marketplace (themes, add-ons)
  □ API for third-party integrations
  □ Certification tracking with expiry alerts
  □ Industry benchmarking data
  □ AI-powered quote estimation
  □ Chatbot for customer websites
```

---

## 20. Risk Assessment

### Risks & Mitigations

```
┌─────────────────────────────┬────────┬──────────────────────────────┐
│ Risk                        │ Level  │ Mitigation                   │
├─────────────────────────────┼────────┼──────────────────────────────┤
│ Small market size           │ Medium │ International expansion,     │
│                             │        │ adjacent trades (HVAC, etc.) │
├─────────────────────────────┼────────┼──────────────────────────────┤
│ Low-tech audience           │ High   │ 5-min setup, phone support,  │
│ (locksmiths aren't devs)   │        │ video tutorials, done-for-   │
│                             │        │ you onboarding               │
├─────────────────────────────┼────────┼──────────────────────────────┤
│ Big player enters market    │ Low    │ First-mover advantage,       │
│ (Wix, Squarespace)         │        │ industry-specific features   │
│                             │        │ they can't match quickly     │
├─────────────────────────────┼────────┼──────────────────────────────┤
│ Churn (customers leaving)   │ Medium │ Sticky features (booking,    │
│                             │        │ dispatch, invoicing), annual │
│                             │        │ plans, great support         │
├─────────────────────────────┼────────┼──────────────────────────────┤
│ Technical complexity of     │ Medium │ Start with shared DB + RLS,  │
│ multi-tenancy               │        │ migrate to schema-per-tenant │
│                             │        │ when needed                  │
├─────────────────────────────┼────────┼──────────────────────────────┤
│ SEO cannibalization         │ Low    │ Each tenant targets unique   │
│ (tenants compete)           │        │ city + business name combos  │
├─────────────────────────────┼────────┼──────────────────────────────┤
│ Scaling beyond locksmiths   │ Low    │ Architecture supports any    │
│                             │        │ trade vertical with minimal  │
│                             │        │ changes                      │
└─────────────────────────────┴────────┴──────────────────────────────┘
```

### Expansion Opportunities

```
After proving the model with locksmiths:

Phase A: Adjacent Trades
  ├── Garage door repair
  ├── Safe technicians
  ├── Security system installers
  └── Glass repair / window boarding

Phase B: Broader Home Services
  ├── Plumbing
  ├── Electrical
  ├── HVAC
  └── Pest control

Each vertical reuses 70%+ of the platform code.
The trade-specific 30% (services database, vehicle data, certifications)
is the moat that prevents generic platforms from competing.
```

---

## Summary

**LockSmith SaaS** has the potential to become the **Shopify of locksmith businesses** — a vertical SaaS platform that gives every locksmith a professional online presence and business management tools they can't get anywhere else.

The Xcel Locksmith codebase is already **80% of the way there**. The remaining work is:

1. **Multi-tenancy** — tenant isolation, billing, onboarding
2. **White-label engine** — theme customization, custom domains
3. **Business tools** — CRM, booking, dispatch, payments

With a **$30M+ TAM** in the US alone, **zero direct competitors**, and a **5-minute setup** value proposition, this is a compelling vertical SaaS opportunity.

```
Current State:  Single-client website (Xcel Locksmith)
                                  │
                   ┌──────────────┴──────────────┐
                   ▼                              ▼
           cms_prd.md                    locksmith_business_prd.md
           (CMS for Xcel)               (SaaS for ALL locksmiths)
                   │                              │
                   └──────────────┬──────────────┘
                                  ▼
                         LockSmith SaaS
                    "Shopify for Locksmiths"
```

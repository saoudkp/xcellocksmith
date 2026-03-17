// Feature: payload-cms-backend, Property 9: Sitemap includes all active documents
// **Validates: Requirements 14.1**

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// Mock next/server to avoid react dependency in test environment
vi.mock('next/server', () => {
  class MockNextResponse extends Response {
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      super(body, init)
    }
  }
  return { NextResponse: MockNextResponse }
})

vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: {} }))

import { getPayload } from 'payload'
import { GET } from '../route'

const mockedGetPayload = vi.mocked(getPayload)

/**
 * Arbitrary for a URL-safe slug.
 */
const slugArb = fc
  .stringMatching(/^[a-z][a-z0-9-]*[a-z0-9]$/)
  .filter((s) => s.length >= 2 && s.length <= 40 && !s.includes('--'))

/**
 * Arbitrary for an ISO date string.
 */
const dateArb = fc
  .date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') })
  .map((d) => d.toISOString())

/**
 * Arbitrary for a single document with isActive flag.
 */
const docArb = fc.record({
  slug: slugArb,
  updatedAt: dateArb,
  isActive: fc.boolean(),
})

/**
 * Arbitrary for a service document that includes a category object.
 */
const serviceDocArb = fc.record({
  slug: slugArb,
  updatedAt: dateArb,
  isActive: fc.boolean(),
  category: fc.record({ slug: slugArb }),
})

/**
 * Simulates Payload's find behavior: filters docs by isActive when the where
 * clause contains `isActive: { equals: true }`.
 */
function createMockPayload(
  categoryDocs: Array<{ slug: string; updatedAt: string; isActive: boolean }>,
  serviceDocs: Array<{ slug: string; updatedAt: string; isActive: boolean; category: { slug: string } }>,
  serviceAreaDocs: Array<{ slug: string; updatedAt: string; isActive: boolean }>,
) {
  return {
    find: vi.fn().mockImplementation(({ collection, where }: any) => {
      const filterActive = where?.isActive?.equals === true

      if (collection === 'service-categories') {
        const docs = filterActive
          ? categoryDocs.filter((d) => d.isActive)
          : categoryDocs
        return Promise.resolve({ docs })
      }
      if (collection === 'services') {
        const docs = filterActive
          ? serviceDocs.filter((d) => d.isActive)
          : serviceDocs
        return Promise.resolve({ docs })
      }
      if (collection === 'service-areas') {
        const docs = filterActive
          ? serviceAreaDocs.filter((d) => d.isActive)
          : serviceAreaDocs
        return Promise.resolve({ docs })
      }
      return Promise.resolve({ docs: [] })
    }),
  }
}

describe('Property 9: Sitemap includes all active documents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sitemap contains a URL for every active document and no inactive ones', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(docArb, { minLength: 0, maxLength: 10 }),
        fc.array(serviceDocArb, { minLength: 0, maxLength: 10 }),
        fc.array(docArb, { minLength: 0, maxLength: 10 }),
        async (categories, services, serviceAreas) => {
          // Deduplicate slugs within each collection to avoid ambiguity
          const uniqueCategories = deduplicateBySlug(categories)
          const uniqueServices = deduplicateBySlug(services)
          const uniqueAreas = deduplicateBySlug(serviceAreas)

          const mockPayload = createMockPayload(
            uniqueCategories,
            uniqueServices as any,
            uniqueAreas,
          )
          mockedGetPayload.mockResolvedValue(mockPayload as any)

          const response = await GET()
          const xml = await response.text()

          // Active documents should appear in the sitemap
          for (const doc of uniqueCategories.filter((d) => d.isActive)) {
            expect(xml).toContain(`/services/${doc.slug}`)
          }
          for (const doc of uniqueServices.filter((d) => d.isActive)) {
            expect(xml).toContain(doc.slug)
          }
          for (const doc of uniqueAreas.filter((d) => d.isActive)) {
            expect(xml).toContain(`/cities/${doc.slug}`)
          }

          // Inactive documents should NOT appear in the sitemap URL entries
          for (const doc of uniqueCategories.filter((d) => !d.isActive)) {
            expect(xml).not.toContain(`/services/${doc.slug}`)
          }
          for (const doc of uniqueServices.filter((d) => !d.isActive)) {
            // Check the service doesn't appear as a <loc> entry using its full path
            const categorySlug = (doc as any).category?.slug
            const fullServicePath = categorySlug
              ? `/services/${categorySlug}/${doc.slug}`
              : `/services/${doc.slug}`
            const locEntries = xml.match(/<loc>[^<]*<\/loc>/g) || []
            // Use exact path matching to avoid substring false positives (e.g. slug "d5" matching "/d50")
            const slugInLoc = locEntries.some((loc) => {
              const locContent = loc.replace(/<\/?loc>/g, '')
              return locContent.endsWith(fullServicePath) || locContent.includes(`${fullServicePath}/`)
            })
            expect(slugInLoc).toBe(false)
          }
          for (const doc of uniqueAreas.filter((d) => !d.isActive)) {
            expect(xml).not.toContain(`/cities/${doc.slug}`)
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})

/**
 * Removes duplicate slugs from a document array, keeping the first occurrence.
 */
function deduplicateBySlug<T extends { slug: string }>(docs: T[]): T[] {
  const seen = new Set<string>()
  return docs.filter((d) => {
    if (seen.has(d.slug)) return false
    seen.add(d.slug)
    return true
  })
}


// Feature: payload-cms-backend, Property 10: Sitemap entries have correct priority and lastModified
// **Validates: Requirements 14.2, 14.3**

/**
 * Helper: extract all <url> blocks from sitemap XML and parse their child elements.
 */
function parseUrlEntries(xml: string): Array<{ loc: string; priority?: string; lastmod?: string }> {
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) || []
  return urlBlocks.map((block) => {
    const loc = block.match(/<loc>([^<]*)<\/loc>/)?.[1] ?? ''
    const priority = block.match(/<priority>([^<]*)<\/priority>/)?.[1]
    const lastmod = block.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1]
    return { loc, priority, lastmod }
  })
}

/**
 * Arbitrary for an active document (isActive always true) used for priority/lastmod tests.
 */
const activeDocArb = fc.record({
  slug: slugArb,
  updatedAt: dateArb,
  isActive: fc.constant(true),
})

/**
 * Arbitrary for an active service document with category.
 */
const activeServiceDocArb = fc.record({
  slug: slugArb,
  updatedAt: dateArb,
  isActive: fc.constant(true),
  category: fc.record({ slug: slugArb }),
})

describe('Property 10: Sitemap entries have correct priority and lastModified', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('homepage entry has priority 1.0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(activeDocArb, { minLength: 0, maxLength: 5 }),
        fc.array(activeServiceDocArb, { minLength: 0, maxLength: 5 }),
        fc.array(activeDocArb, { minLength: 0, maxLength: 5 }),
        async (categories, services, serviceAreas) => {
          const uniqueCategories = deduplicateBySlug(categories)
          const uniqueServices = deduplicateBySlug(services)
          const uniqueAreas = deduplicateBySlug(serviceAreas)

          const mockPayload = createMockPayload(uniqueCategories, uniqueServices as any, uniqueAreas)
          mockedGetPayload.mockResolvedValue(mockPayload as any)

          const response = await GET()
          const xml = await response.text()
          const entries = parseUrlEntries(xml)

          // Find the homepage entry (the base URL without a trailing path segment)
          const homepageEntry = entries.find(
            (e) => e.loc === (process.env.NEXT_PUBLIC_SITE_URL || 'https://xcellocksmith.com'),
          )
          expect(homepageEntry).toBeDefined()
          expect(homepageEntry!.priority).toBe('1.0')
        },
      ),
      { numRuns: 100 },
    )
  })

  it('category entries have priority 0.9 and correct lastmod', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(activeDocArb, { minLength: 1, maxLength: 10 }),
        async (categories) => {
          const uniqueCategories = deduplicateBySlug(categories)

          const mockPayload = createMockPayload(uniqueCategories, [], [])
          mockedGetPayload.mockResolvedValue(mockPayload as any)

          const response = await GET()
          const xml = await response.text()
          const entries = parseUrlEntries(xml)

          for (const doc of uniqueCategories) {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xcellocksmith.com'
            const entry = entries.find((e) => e.loc === `${baseUrl}/services/${doc.slug}`)
            expect(entry).toBeDefined()
            expect(entry!.priority).toBe('0.9')
            expect(entry!.lastmod).toBe(new Date(doc.updatedAt).toISOString())
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('service entries have priority 0.8 and correct lastmod', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(activeServiceDocArb, { minLength: 1, maxLength: 10 }),
        async (services) => {
          const uniqueServices = deduplicateBySlug(services)

          const mockPayload = createMockPayload([], uniqueServices as any, [])
          mockedGetPayload.mockResolvedValue(mockPayload as any)

          const response = await GET()
          const xml = await response.text()
          const entries = parseUrlEntries(xml)

          for (const doc of uniqueServices) {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xcellocksmith.com'
            const entry = entries.find(
              (e) => e.loc === `${baseUrl}/services/${doc.category.slug}/${doc.slug}`,
            )
            expect(entry).toBeDefined()
            expect(entry!.priority).toBe('0.8')
            expect(entry!.lastmod).toBe(new Date(doc.updatedAt).toISOString())
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('city/service-area entries have priority 0.8 and correct lastmod', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(activeDocArb, { minLength: 1, maxLength: 10 }),
        async (serviceAreas) => {
          const uniqueAreas = deduplicateBySlug(serviceAreas)

          const mockPayload = createMockPayload([], [], uniqueAreas)
          mockedGetPayload.mockResolvedValue(mockPayload as any)

          const response = await GET()
          const xml = await response.text()
          const entries = parseUrlEntries(xml)

          for (const doc of uniqueAreas) {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xcellocksmith.com'
            const entry = entries.find((e) => e.loc === `${baseUrl}/cities/${doc.slug}`)
            expect(entry).toBeDefined()
            expect(entry!.priority).toBe('0.8')
            expect(entry!.lastmod).toBe(new Date(doc.updatedAt).toISOString())
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})

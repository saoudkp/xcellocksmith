// Feature: payload-cms-backend, Property 6: Revalidation hooks fire on content changes
// **Validates: Requirements 5.4, 6.2, 14.4**

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

import { revalidatePath, revalidateTag } from 'next/cache'
import { revalidateServicePages } from '../revalidateServicePages'
import { revalidateCityPages } from '../revalidateCityPages'
import { regenerateSitemap } from '../regenerateSitemap'

const mockedRevalidatePath = vi.mocked(revalidatePath)
const mockedRevalidateTag = vi.mocked(revalidateTag)

/**
 * Creates a mock Payload request object with logger stubs.
 */
function createMockReq() {
  return {
    payload: {
      logger: {
        info: vi.fn(),
        error: vi.fn(),
      },
    },
  } as any
}

/**
 * Arbitrary for URL-safe slug strings (lowercase, alphanumeric, hyphens).
 */
const slugArb = fc
  .stringMatching(/^[a-z][a-z0-9-]*[a-z0-9]$/)
  .filter((s) => s.length >= 2 && !s.includes('--'))

describe('Property 6: Revalidation hooks fire on content changes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('revalidateServicePages', () => {
    it('calls revalidatePath with a path containing the slug for every doc with a slug', () => {
      fc.assert(
        fc.property(slugArb, (slug) => {
          vi.clearAllMocks()
          const doc = { slug }
          const req = createMockReq()

          ;(revalidateServicePages as Function)({ doc, req, collection: { slug: 'services' } })

          expect(mockedRevalidatePath).toHaveBeenCalled()
          const calledPath = mockedRevalidatePath.mock.calls[0][0] as string
          expect(calledPath).toContain(slug)
        }),
        { numRuns: 100 },
      )
    })

    it('always calls revalidateTag with "services"', () => {
      fc.assert(
        fc.property(slugArb, (slug) => {
          vi.clearAllMocks()
          const doc = { slug }
          const req = createMockReq()

          ;(revalidateServicePages as Function)({ doc, req, collection: { slug: 'services' } })

          expect(mockedRevalidateTag).toHaveBeenCalledWith('services')
        }),
        { numRuns: 100 },
      )
    })

    it('includes category in path when category object has a slug', () => {
      fc.assert(
        fc.property(slugArb, slugArb, (serviceSlug, categorySlug) => {
          vi.clearAllMocks()
          const doc = { slug: serviceSlug, category: { slug: categorySlug } }
          const req = createMockReq()

          ;(revalidateServicePages as Function)({ doc, req, collection: { slug: 'services' } })

          expect(mockedRevalidatePath).toHaveBeenCalledWith(
            `/services/${categorySlug}/${serviceSlug}`,
          )
        }),
        { numRuns: 100 },
      )
    })

    it('returns the doc unchanged', async () => {
      await fc.assert(
        fc.asyncProperty(slugArb, async (slug) => {
          vi.clearAllMocks()
          const doc = { slug, title: 'Test Service' }
          const req = createMockReq()

          const result = await (revalidateServicePages as Function)({
            doc,
            req,
            collection: { slug: 'services' },
          })

          expect(result).toBe(doc)
        }),
        { numRuns: 100 },
      )
    })
  })

  describe('revalidateCityPages', () => {
    it('calls revalidatePath with a path containing the slug for every doc with a slug', () => {
      fc.assert(
        fc.property(slugArb, (slug) => {
          vi.clearAllMocks()
          const doc = { slug }
          const req = createMockReq()

          ;(revalidateCityPages as Function)({ doc, req, collection: { slug: 'service-areas' } })

          expect(mockedRevalidatePath).toHaveBeenCalledWith(`/cities/${slug}`)
        }),
        { numRuns: 100 },
      )
    })

    it('always calls revalidateTag with "service-areas"', () => {
      fc.assert(
        fc.property(slugArb, (slug) => {
          vi.clearAllMocks()
          const doc = { slug }
          const req = createMockReq()

          ;(revalidateCityPages as Function)({ doc, req, collection: { slug: 'service-areas' } })

          expect(mockedRevalidateTag).toHaveBeenCalledWith('service-areas')
        }),
        { numRuns: 100 },
      )
    })

    it('returns the doc unchanged', async () => {
      await fc.assert(
        fc.asyncProperty(slugArb, async (slug) => {
          vi.clearAllMocks()
          const doc = { slug, cityName: 'Test City' }
          const req = createMockReq()

          const result = await (revalidateCityPages as Function)({
            doc,
            req,
            collection: { slug: 'service-areas' },
          })

          expect(result).toBe(doc)
        }),
        { numRuns: 100 },
      )
    })
  })

  describe('regenerateSitemap', () => {
    const collectionSlugArb = fc.constantFrom('services', 'service-areas', 'service-categories')

    it('always calls revalidatePath with "/sitemap.xml"', () => {
      fc.assert(
        fc.property(slugArb, collectionSlugArb, (slug, collSlug) => {
          vi.clearAllMocks()
          const doc = { slug }
          const req = createMockReq()

          ;(regenerateSitemap as Function)({ doc, req, collection: { slug: collSlug } })

          expect(mockedRevalidatePath).toHaveBeenCalledWith('/sitemap.xml')
        }),
        { numRuns: 100 },
      )
    })

    it('always calls revalidateTag with "sitemap"', () => {
      fc.assert(
        fc.property(slugArb, collectionSlugArb, (slug, collSlug) => {
          vi.clearAllMocks()
          const doc = { slug }
          const req = createMockReq()

          ;(regenerateSitemap as Function)({ doc, req, collection: { slug: collSlug } })

          expect(mockedRevalidateTag).toHaveBeenCalledWith('sitemap')
        }),
        { numRuns: 100 },
      )
    })

    it('returns the doc unchanged', async () => {
      await fc.assert(
        fc.asyncProperty(slugArb, collectionSlugArb, async (slug, collSlug) => {
          vi.clearAllMocks()
          const doc = { slug }
          const req = createMockReq()

          const result = await (regenerateSitemap as Function)({
            doc,
            req,
            collection: { slug: collSlug },
          })

          expect(result).toBe(doc)
        }),
        { numRuns: 100 },
      )
    })
  })
})

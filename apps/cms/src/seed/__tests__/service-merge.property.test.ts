// Feature: payload-cms-backend, Property 14: Seed script merges service data correctly
// **Validates: Requirements 17.4**

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getServices } from '../data-mappers'
import { services as sourceServices } from '../../../../../src/data/services'

/**
 * Pre-compute the merged services once — getServices() is deterministic
 * and reads from static data files, so calling it once is sufficient.
 */
const mergedServices = getServices()

/**
 * Build a lookup map by slug for O(1) access during property checks.
 */
const mergedBySlug = new Map(mergedServices.map((s) => [s.slug, s]))
const sourceBySlug = new Map(sourceServices.map((s) => [s.slug, s]))

/**
 * All available slugs from the source services.ts file.
 */
const allSlugs = sourceServices.map((s) => s.slug)

/**
 * Arbitrary that picks a random slug from the 29 available services.
 */
const slugArb = fc.constantFrom(...allSlugs)

describe('Property 14: Seed script merges service data correctly', () => {
  it('every source service slug exists in the merged output', () => {
    expect(mergedServices).toHaveLength(sourceServices.length)
    for (const slug of allSlugs) {
      expect(mergedBySlug.has(slug)).toBe(true)
    }
  })

  it('merged record contains summary fields from services.ts for random slugs', () => {
    fc.assert(
      fc.property(slugArb, (slug) => {
        const merged = mergedBySlug.get(slug)!
        const source = sourceBySlug.get(slug)!

        // Fields from services.ts must be present and match
        expect(merged.title).toBe(source.title)
        expect(merged.slug).toBe(source.slug)
        expect(merged.categorySlug).toBe(source.category)
        expect(merged.shortDescription).toBe(source.shortDescription)
        expect(merged.icon).toBe(source.icon)
      }),
      { numRuns: 100 },
    )
  })

  it('merged record contains detail fields from serviceDetailsMap for random slugs', () => {
    fc.assert(
      fc.property(slugArb, (slug) => {
        const merged = mergedBySlug.get(slug)!

        // All 29 slugs have entries in serviceDetailsMap, so detail fields must be present
        expect(merged.longDescription).toBeDefined()
        expect(merged.benefits).toBeDefined()
        expect(merged.ctaText).toBeDefined()

        // benefits must be an array of {benefit: string} objects
        expect(Array.isArray(merged.benefits)).toBe(true)
        expect(merged.benefits!.length).toBeGreaterThan(0)
        for (const b of merged.benefits!) {
          expect(typeof b.benefit).toBe('string')
          expect(b.benefit.length).toBeGreaterThan(0)
        }

        // ctaText must be a non-empty string
        expect(typeof merged.ctaText).toBe('string')
        expect(merged.ctaText!.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 },
    )
  })

  it('longDescription is in Lexical richText format (has root.children)', () => {
    fc.assert(
      fc.property(slugArb, (slug) => {
        const merged = mergedBySlug.get(slug)!
        const ld = merged.longDescription as Record<string, any>

        // Must have root object
        expect(ld).toHaveProperty('root')
        expect(typeof ld.root).toBe('object')

        // root must have children array
        expect(ld.root).toHaveProperty('children')
        expect(Array.isArray(ld.root.children)).toBe(true)
        expect(ld.root.children.length).toBeGreaterThan(0)

        // root.type should be 'root'
        expect(ld.root.type).toBe('root')

        // First child should be a paragraph with text children
        const firstChild = ld.root.children[0]
        expect(firstChild.type).toBe('paragraph')
        expect(Array.isArray(firstChild.children)).toBe(true)
        expect(firstChild.children.length).toBeGreaterThan(0)
        expect(firstChild.children[0].type).toBe('text')
        expect(typeof firstChild.children[0].text).toBe('string')
        expect(firstChild.children[0].text.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 },
    )
  })
})

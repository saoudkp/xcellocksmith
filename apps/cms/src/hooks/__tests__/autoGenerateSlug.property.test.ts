// Feature: payload-cms-backend, Property 1: Slug auto-generation
// **Validates: Requirements 4.2, 5.2**

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { autoGenerateSlug } from '../autoGenerateSlug'

/**
 * Helper to invoke the hook with minimal required args.
 */
function runHook(data: Record<string, unknown> | undefined) {
  return (autoGenerateSlug as Function)({
    data,
    operation: 'create',
    req: {},
    collection: { slug: 'test' },
    originalDoc: undefined,
  })
}

/**
 * Arbitrary that generates non-empty strings suitable as name/title inputs.
 * Includes unicode, spaces, special characters, and mixed case.
 */
const nonEmptyNameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)

describe('Property 1: Slug auto-generation', () => {
  it('generated slugs are lowercase', () => {
    fc.assert(
      fc.property(nonEmptyNameArb, (name) => {
        const result = runHook({ name })
        if (result.slug) {
          expect(result.slug).toBe(result.slug.toLowerCase())
        }
      }),
      { numRuns: 100 },
    )
  })

  it('generated slugs are URL-safe (only a-z, 0-9, and hyphens)', () => {
    fc.assert(
      fc.property(nonEmptyNameArb, (name) => {
        const result = runHook({ name })
        if (result.slug) {
          expect(result.slug).toMatch(/^[a-z0-9-]*$/)
        }
      }),
      { numRuns: 100 },
    )
  })

  it('generated slugs have no consecutive hyphens', () => {
    fc.assert(
      fc.property(nonEmptyNameArb, (name) => {
        const result = runHook({ name })
        if (result.slug) {
          expect(result.slug).not.toMatch(/--/)
        }
      }),
      { numRuns: 100 },
    )
  })

  it('generated slugs have no leading or trailing hyphens', () => {
    fc.assert(
      fc.property(nonEmptyNameArb, (name) => {
        const result = runHook({ name })
        if (result.slug && result.slug.length > 0) {
          expect(result.slug).not.toMatch(/^-/)
          expect(result.slug).not.toMatch(/-$/)
        }
      }),
      { numRuns: 100 },
    )
  })

  it('slug generation is deterministic (same input produces same slug)', () => {
    fc.assert(
      fc.property(nonEmptyNameArb, (name) => {
        const result1 = runHook({ name })
        const result2 = runHook({ name })
        expect(result1.slug).toBe(result2.slug)
      }),
      { numRuns: 100 },
    )
  })

  it('existing slug is not overwritten', () => {
    const existingSlugArb = fc
      .string({ minLength: 1 })
      .filter((s) => s.trim().length > 0)

    fc.assert(
      fc.property(nonEmptyNameArb, existingSlugArb, (name, existingSlug) => {
        const result = runHook({ name, slug: existingSlug })
        expect(result.slug).toBe(existingSlug)
      }),
      { numRuns: 100 },
    )
  })

  it('title field is used when name is absent', () => {
    fc.assert(
      fc.property(nonEmptyNameArb, (title) => {
        const resultFromTitle = runHook({ title })
        const resultFromName = runHook({ name: title })
        expect(resultFromTitle.slug).toBe(resultFromName.slug)
      }),
      { numRuns: 100 },
    )
  })
})

// Feature: payload-cms-backend, Property 2: Collection access control enforcement
// **Validates: Requirements 2.3, 3.5, 5.3, 8.2, 11.2**

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  isAuthenticated,
  publicReadAdminWrite,
  reviewsAccess,
  quoteRequestsAccess,
} from '../index'

/**
 * Arbitrary that generates a mock authenticated request (user is a truthy object).
 */
const authenticatedReqArb = fc.record({
  user: fc.record({
    id: fc.string({ minLength: 1 }),
    email: fc.emailAddress(),
  }),
}).map((fields) => ({ req: fields } as any))

/**
 * Arbitrary that generates a mock unauthenticated request (user is null or undefined).
 */
const unauthenticatedReqArb = fc.constantFrom(null, undefined).map((user) => ({
  req: { user },
} as any))

/**
 * Arbitrary that generates either an authenticated or unauthenticated request.
 */
const anyReqArb = fc.oneof(authenticatedReqArb, unauthenticatedReqArb)

describe('Property 2: Collection access control enforcement', () => {
  describe('publicReadAdminWrite', () => {
    it('read always returns true regardless of auth state', () => {
      fc.assert(
        fc.property(anyReqArb, (args) => {
          expect(publicReadAdminWrite.read(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
    })

    it('create requires authentication', () => {
      fc.assert(
        fc.property(authenticatedReqArb, (args) => {
          expect(publicReadAdminWrite.create(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
      fc.assert(
        fc.property(unauthenticatedReqArb, (args) => {
          expect(publicReadAdminWrite.create(args)).toBe(false)
        }),
        { numRuns: 100 },
      )
    })

    it('update requires authentication', () => {
      fc.assert(
        fc.property(authenticatedReqArb, (args) => {
          expect(publicReadAdminWrite.update(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
      fc.assert(
        fc.property(unauthenticatedReqArb, (args) => {
          expect(publicReadAdminWrite.update(args)).toBe(false)
        }),
        { numRuns: 100 },
      )
    })

    it('delete requires authentication', () => {
      fc.assert(
        fc.property(authenticatedReqArb, (args) => {
          expect(publicReadAdminWrite.delete(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
      fc.assert(
        fc.property(unauthenticatedReqArb, (args) => {
          expect(publicReadAdminWrite.delete(args)).toBe(false)
        }),
        { numRuns: 100 },
      )
    })
  })

  describe('reviewsAccess', () => {
    it('unauthenticated read returns approved-only filter', () => {
      fc.assert(
        fc.property(unauthenticatedReqArb, (args) => {
          const result = reviewsAccess.read(args)
          expect(result).toEqual({ isApproved: { equals: true } })
        }),
        { numRuns: 100 },
      )
    })

    it('authenticated read returns true', () => {
      fc.assert(
        fc.property(authenticatedReqArb, (args) => {
          expect(reviewsAccess.read(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
    })

    it('create always returns true regardless of auth state', () => {
      fc.assert(
        fc.property(anyReqArb, (args) => {
          expect(reviewsAccess.create(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
    })

    it('update requires authentication', () => {
      fc.assert(
        fc.property(authenticatedReqArb, (args) => {
          expect(reviewsAccess.update(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
      fc.assert(
        fc.property(unauthenticatedReqArb, (args) => {
          expect(reviewsAccess.update(args)).toBe(false)
        }),
        { numRuns: 100 },
      )
    })

    it('delete requires authentication', () => {
      fc.assert(
        fc.property(authenticatedReqArb, (args) => {
          expect(reviewsAccess.delete(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
      fc.assert(
        fc.property(unauthenticatedReqArb, (args) => {
          expect(reviewsAccess.delete(args)).toBe(false)
        }),
        { numRuns: 100 },
      )
    })
  })

  describe('quoteRequestsAccess', () => {
    it('create always returns true regardless of auth state', () => {
      fc.assert(
        fc.property(anyReqArb, (args) => {
          expect(quoteRequestsAccess.create(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
    })

    it('read requires authentication', () => {
      fc.assert(
        fc.property(authenticatedReqArb, (args) => {
          expect(quoteRequestsAccess.read(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
      fc.assert(
        fc.property(unauthenticatedReqArb, (args) => {
          expect(quoteRequestsAccess.read(args)).toBe(false)
        }),
        { numRuns: 100 },
      )
    })

    it('update requires authentication', () => {
      fc.assert(
        fc.property(authenticatedReqArb, (args) => {
          expect(quoteRequestsAccess.update(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
      fc.assert(
        fc.property(unauthenticatedReqArb, (args) => {
          expect(quoteRequestsAccess.update(args)).toBe(false)
        }),
        { numRuns: 100 },
      )
    })

    it('delete requires authentication', () => {
      fc.assert(
        fc.property(authenticatedReqArb, (args) => {
          expect(quoteRequestsAccess.delete(args)).toBe(true)
        }),
        { numRuns: 100 },
      )
      fc.assert(
        fc.property(unauthenticatedReqArb, (args) => {
          expect(quoteRequestsAccess.delete(args)).toBe(false)
        }),
        { numRuns: 100 },
      )
    })
  })
})

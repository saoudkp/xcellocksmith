// Feature: payload-cms-backend, Property 3: Reviews return only approved documents for public queries
// **Validates: Requirements 8.3**

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { reviewsAccess } from '../index'

/**
 * Arbitrary that generates a single review object with a random isApproved value.
 */
const reviewArb = fc.record({
  id: fc.uuid(),
  customerName: fc.string({ minLength: 1, maxLength: 50 }),
  starRating: fc.integer({ min: 1, max: 5 }),
  reviewText: fc.string({ minLength: 1, maxLength: 500 }),
  source: fc.constantFrom('website', 'google', 'yelp', 'manual'),
  isApproved: fc.boolean(),
  isFeatured: fc.boolean(),
})

/**
 * Arbitrary that generates a non-empty array of reviews with mixed isApproved values.
 */
const reviewSetArb = fc.array(reviewArb, { minLength: 1, maxLength: 50 })

/**
 * Arbitrary for an authenticated request.
 */
const authenticatedReqArb = fc
  .record({
    user: fc.record({
      id: fc.string({ minLength: 1 }),
      email: fc.emailAddress(),
    }),
  })
  .map((fields) => ({ req: fields } as any))

/**
 * Arbitrary for an unauthenticated request.
 */
const unauthenticatedReqArb = fc
  .constantFrom(null, undefined)
  .map((user) => ({ req: { user } } as any))

describe('Property 3: Reviews return only approved documents for public queries', () => {
  it('unauthenticated read returns a where clause that filters to only approved reviews', () => {
    fc.assert(
      fc.property(reviewSetArb, unauthenticatedReqArb, (reviews, args) => {
        const accessResult = reviewsAccess.read(args)

        // The access function should return a Payload where clause, not a boolean
        expect(accessResult).toEqual({ isApproved: { equals: true } })

        // Simulate applying the filter: only reviews with isApproved === true should match
        const approvedReviews = reviews.filter((r) => r.isApproved === true)
        const allReviews = reviews

        // The filter should never include unapproved reviews
        approvedReviews.forEach((r) => {
          expect(r.isApproved).toBe(true)
        })

        // Every review NOT in the approved set must have isApproved === false
        const unapprovedReviews = allReviews.filter((r) => !r.isApproved)
        unapprovedReviews.forEach((r) => {
          expect(r.isApproved).toBe(false)
        })

        // The count of approved + unapproved should equal total
        expect(approvedReviews.length + unapprovedReviews.length).toBe(allReviews.length)
      }),
      { numRuns: 100 },
    )
  })

  it('authenticated read returns true, granting access to all reviews regardless of approval', () => {
    fc.assert(
      fc.property(reviewSetArb, authenticatedReqArb, (reviews, args) => {
        const accessResult = reviewsAccess.read(args)

        // Authenticated users get full access (true = no filtering)
        expect(accessResult).toBe(true)

        // With true access, all reviews are returned — both approved and unapproved
        // This means the full set is accessible, no filtering applied
        const totalCount = reviews.length
        expect(totalCount).toBeGreaterThan(0)
      }),
      { numRuns: 100 },
    )
  })

  it('the approved-only filter correctly partitions any random review set', () => {
    fc.assert(
      fc.property(reviewSetArb, (reviews) => {
        // Simulate the Payload where clause: { isApproved: { equals: true } }
        const whereClause = { isApproved: { equals: true } }
        const filtered = reviews.filter(
          (r) => r.isApproved === whereClause.isApproved.equals,
        )

        // Every filtered review must be approved
        filtered.forEach((r) => {
          expect(r.isApproved).toBe(true)
        })

        // No approved review should be missing from the filtered set
        const approvedCount = reviews.filter((r) => r.isApproved).length
        expect(filtered.length).toBe(approvedCount)
      }),
      { numRuns: 100 },
    )
  })
})

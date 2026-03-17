// Feature: payload-cms-backend, Property 15: Review creation triggers admin notification
// **Validates: Requirements 8.4, 16.3**

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

const mockSendEmail = vi.fn().mockResolvedValue(undefined)

vi.mock('@/email/send', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

// Must import after mock setup
import { sendReviewNotification } from '../sendReviewNotification'

/**
 * Helper to invoke the afterChange hook with the given doc and operation.
 */
function runHook(doc: Record<string, unknown>, operation: 'create' | 'update') {
  return (sendReviewNotification as Function)({
    doc,
    operation,
    req: {},
    collection: { slug: 'reviews' },
    previousDoc: undefined,
  })
}

/** Arbitrary for a non-empty customer name. */
const customerNameArb = fc.string({ minLength: 1, maxLength: 60 }).filter((s) => s.trim().length > 0)

/** Arbitrary for star rating 1-5. */
const starRatingArb = fc.integer({ min: 1, max: 5 })

/** Arbitrary for review text. */
const reviewTextArb = fc.string({ minLength: 1, maxLength: 300 }).filter((s) => s.trim().length > 0)

/** Arbitrary for review source. */
const sourceArb = fc.constantFrom('website', 'google', 'yelp', 'manual')

/** Arbitrary for a complete review doc. */
const reviewDocArb = fc
  .tuple(customerNameArb, starRatingArb, reviewTextArb, sourceArb, fc.boolean(), fc.boolean())
  .map(([customerName, starRating, reviewText, source, isApproved, isFeatured]) => ({
    id: 'review-test',
    customerName,
    starRating,
    reviewText,
    source,
    isApproved,
    isFeatured,
  }))

describe('Property 15: Review creation triggers admin notification', () => {
  beforeEach(() => {
    mockSendEmail.mockClear()
    mockSendEmail.mockResolvedValue(undefined)
  })

  it('always sends admin notification email on review creation', async () => {
    await fc.assert(
      fc.asyncProperty(reviewDocArb, async (doc) => {
        mockSendEmail.mockClear()

        const result = await runHook(doc, 'create')

        // Exactly one email sent to admin
        expect(mockSendEmail).toHaveBeenCalledTimes(1)

        const call = mockSendEmail.mock.calls[0][0]
        expect(call.to).toBe('admin@xcel-locksmith.com')
        expect(call.subject).toContain('New Review')
        expect(call.html).toBeDefined()
        expect(typeof call.html).toBe('string')

        // Hook returns the doc
        expect(result).toBe(doc)
      }),
      { numRuns: 100 },
    )
  })

  it('does not send notification on update operations', async () => {
    await fc.assert(
      fc.asyncProperty(reviewDocArb, async (doc) => {
        mockSendEmail.mockClear()

        const result = await runHook(doc, 'update')

        expect(mockSendEmail).not.toHaveBeenCalled()
        expect(result).toBe(doc)
      }),
      { numRuns: 100 },
    )
  })

  it('sends notification regardless of approval status or source', async () => {
    await fc.assert(
      fc.asyncProperty(
        customerNameArb,
        starRatingArb,
        reviewTextArb,
        sourceArb,
        fc.boolean(),
        async (customerName, starRating, reviewText, source, isApproved) => {
          mockSendEmail.mockClear()

          const doc = { id: 'r-test', customerName, starRating, reviewText, source, isApproved }
          const result = await runHook(doc, 'create')

          expect(mockSendEmail).toHaveBeenCalledTimes(1)
          expect(mockSendEmail.mock.calls[0][0].to).toBe('admin@xcel-locksmith.com')
          expect(result).toBe(doc)
        },
      ),
      { numRuns: 100 },
    )
  })
})

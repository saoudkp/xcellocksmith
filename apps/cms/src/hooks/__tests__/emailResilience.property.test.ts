// Feature: payload-cms-backend, Property 8: Email failures do not break parent operations
// **Validates: Requirements 16.5**

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

const mockSendEmail = vi.fn()

vi.mock('@/email/send', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

// Must import after mock setup
import { sendQuoteNotification } from '../sendQuoteNotification'
import { sendReviewNotification } from '../sendReviewNotification'

/**
 * Helper to invoke an afterChange hook.
 */
function runHook(
  hook: Function,
  doc: Record<string, unknown>,
  operation: 'create' | 'update',
) {
  return hook({
    doc,
    operation,
    req: {},
    collection: { slug: 'test' },
    previousDoc: undefined,
  })
}

/** Arbitrary for random error messages. */
const errorMessageArb = fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0)

/** Arbitrary for a non-empty name. */
const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0)

/** Arbitrary for a phone string. */
const phoneArb = fc.string({ minLength: 7, maxLength: 15 }).filter((s) => s.trim().length > 0)

/** Arbitrary for a valid email. */
const emailArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z]+$/.test(s)),
    fc.string({ minLength: 2, maxLength: 6 }).filter((s) => /^[a-z]+$/.test(s)),
  )
  .map(([user, domain]) => `${user}@${domain}.com`)

/** Arbitrary for star rating 1-5. */
const starRatingArb = fc.integer({ min: 1, max: 5 })

/** Arbitrary for review text. */
const reviewTextArb = fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0)

describe('Property 8: Email failures do not break parent operations', () => {
  beforeEach(() => {
    mockSendEmail.mockReset()
  })

  it('sendQuoteNotification returns doc when sendEmail throws', async () => {
    await fc.assert(
      fc.asyncProperty(nameArb, phoneArb, emailArb, errorMessageArb, async (name, phone, email, errMsg) => {
        mockSendEmail.mockReset()
        mockSendEmail.mockRejectedValue(new Error(errMsg))

        const doc = { id: 'q-1', name, phone, email }
        const result = await runHook(sendQuoteNotification, doc, 'create')

        // Hook should return the doc without throwing
        expect(result).toBe(doc)
      }),
      { numRuns: 100 },
    )
  })

  it('sendQuoteNotification returns doc when sendEmail throws (no customer email)', async () => {
    await fc.assert(
      fc.asyncProperty(nameArb, phoneArb, errorMessageArb, async (name, phone, errMsg) => {
        mockSendEmail.mockReset()
        mockSendEmail.mockRejectedValue(new Error(errMsg))

        const doc = { id: 'q-2', name, phone }
        const result = await runHook(sendQuoteNotification, doc, 'create')

        expect(result).toBe(doc)
      }),
      { numRuns: 100 },
    )
  })

  it('sendReviewNotification returns doc when sendEmail throws', async () => {
    await fc.assert(
      fc.asyncProperty(nameArb, starRatingArb, reviewTextArb, errorMessageArb, async (customerName, starRating, reviewText, errMsg) => {
        mockSendEmail.mockReset()
        mockSendEmail.mockRejectedValue(new Error(errMsg))

        const doc = { id: 'r-1', customerName, starRating, reviewText }
        const result = await runHook(sendReviewNotification, doc, 'create')

        // Hook should return the doc without throwing
        expect(result).toBe(doc)
      }),
      { numRuns: 100 },
    )
  })

  it('hooks still return doc when sendEmail throws non-Error objects', async () => {
    await fc.assert(
      fc.asyncProperty(nameArb, phoneArb, async (name, phone) => {
        mockSendEmail.mockReset()
        mockSendEmail.mockRejectedValue('string error')

        const doc = { id: 'q-3', name, phone }
        const result = await runHook(sendQuoteNotification, doc, 'create')

        expect(result).toBe(doc)
      }),
      { numRuns: 100 },
    )
  })
})

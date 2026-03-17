// Feature: payload-cms-backend, Property 7: Quote request triggers correct email notifications
// **Validates: Requirements 11.4, 16.1, 16.2**

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

const mockSendEmail = vi.fn().mockResolvedValue(undefined)

vi.mock('@/email/send', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

// Must import after mock setup
import { sendQuoteNotification } from '../sendQuoteNotification'

/**
 * Helper to invoke the afterChange hook with the given doc and operation.
 */
function runHook(doc: Record<string, unknown>, operation: 'create' | 'update') {
  return (sendQuoteNotification as Function)({
    doc,
    operation,
    req: {},
    collection: { slug: 'quote-requests' },
    previousDoc: undefined,
  })
}

/** Arbitrary for a non-empty name string. */
const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0)

/** Arbitrary for a phone string. */
const phoneArb = fc.string({ minLength: 7, maxLength: 15 }).filter((s) => s.trim().length > 0)

/** Arbitrary for a valid email string. */
const emailArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /^[a-z]+$/.test(s)),
    fc.string({ minLength: 2, maxLength: 6 }).filter((s) => /^[a-z]+$/.test(s)),
  )
  .map(([user, domain]) => `${user}@${domain}.com`)

/** Arbitrary for optional fields on a quote request. */
const optionalFieldsArb = fc.record({
  serviceType: fc.constantFrom('residential', 'commercial', 'automotive', undefined),
  location: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
  notes: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
})

describe('Property 7: Quote request triggers correct email notifications', () => {
  beforeEach(() => {
    mockSendEmail.mockClear()
    mockSendEmail.mockResolvedValue(undefined)
  })

  it('always sends business notification on create', async () => {
    await fc.assert(
      fc.asyncProperty(nameArb, phoneArb, optionalFieldsArb, async (name, phone, opts) => {
        mockSendEmail.mockClear()

        const doc = { id: 'test-id', name, phone, ...opts }
        const result = await runHook(doc, 'create')

        // Business notification is always sent
        expect(mockSendEmail).toHaveBeenCalled()
        const firstCall = mockSendEmail.mock.calls[0][0]
        expect(firstCall.to).toBe('admin@xcel-locksmith.com')
        expect(firstCall.subject).toContain('New Quote Request')

        // Hook returns the doc
        expect(result).toBe(doc)
      }),
      { numRuns: 100 },
    )
  })

  it('sends customer confirmation only when email is provided', async () => {
    await fc.assert(
      fc.asyncProperty(nameArb, phoneArb, emailArb, optionalFieldsArb, async (name, phone, email, opts) => {
        mockSendEmail.mockClear()

        const doc = { id: 'test-id', name, phone, email, ...opts }
        const result = await runHook(doc, 'create')

        // Should have 2 calls: business + customer
        expect(mockSendEmail).toHaveBeenCalledTimes(2)

        const businessCall = mockSendEmail.mock.calls[0][0]
        expect(businessCall.to).toBe('admin@xcel-locksmith.com')

        const customerCall = mockSendEmail.mock.calls[1][0]
        expect(customerCall.to).toBe(email)
        expect(customerCall.subject).toContain('Quote Request')

        expect(result).toBe(doc)
      }),
      { numRuns: 100 },
    )
  })

  it('does not send customer confirmation when email is absent', async () => {
    await fc.assert(
      fc.asyncProperty(nameArb, phoneArb, optionalFieldsArb, async (name, phone, opts) => {
        mockSendEmail.mockClear()

        const doc = { id: 'test-id', name, phone, ...opts }
        // Ensure no email field
        delete (doc as Record<string, unknown>).email
        const result = await runHook(doc, 'create')

        // Only 1 call: business notification
        expect(mockSendEmail).toHaveBeenCalledTimes(1)
        expect(mockSendEmail.mock.calls[0][0].to).toBe('admin@xcel-locksmith.com')

        expect(result).toBe(doc)
      }),
      { numRuns: 100 },
    )
  })

  it('does not send any emails on update operations', async () => {
    await fc.assert(
      fc.asyncProperty(nameArb, phoneArb, emailArb, async (name, phone, email) => {
        mockSendEmail.mockClear()

        const doc = { id: 'test-id', name, phone, email }
        const result = await runHook(doc, 'update')

        expect(mockSendEmail).not.toHaveBeenCalled()
        expect(result).toBe(doc)
      }),
      { numRuns: 100 },
    )
  })
})

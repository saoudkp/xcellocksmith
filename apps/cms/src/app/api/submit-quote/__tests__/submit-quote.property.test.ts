// Feature: payload-cms-backend, Property 5: Quote endpoint validates input via Zod schema
// **Validates: Requirements 11.5**

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { quoteSchema } from '../schema'

/**
 * Arbitrary for valid quote data — used as a baseline to confirm the schema
 * accepts well-formed input.
 */
const validQuoteArb = fc.record({
  name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  phone: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
})

/**
 * Arbitrary that produces bodies with a missing or empty `name` field.
 */
const missingNameArb = fc.record({
  name: fc.constantFrom('', undefined as unknown as string),
  phone: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
})

/**
 * Arbitrary that produces bodies with a missing or empty `phone` field.
 */
const missingPhoneArb = fc.record({
  name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  phone: fc.constantFrom('', undefined as unknown as string),
})

/**
 * Arbitrary that produces bodies with an invalid email format.
 * Generates strings that are not valid emails (no @ sign, etc.).
 */
const invalidEmailArb = fc.record({
  name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  phone: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  email: fc
    .string({ minLength: 1 })
    .filter((s) => !s.includes('@') || !s.includes('.')),
})


/**
 * Arbitrary that produces bodies with an invalid serviceType enum value.
 */
const invalidServiceTypeArb = fc.record({
  name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  phone: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  serviceType: fc
    .string({ minLength: 1 })
    .filter((s) => !['residential', 'commercial', 'automotive'].includes(s)),
})

describe('Property 5: Quote endpoint validates input via Zod schema', () => {
  it('accepts valid input with required name and phone', () => {
    fc.assert(
      fc.property(validQuoteArb, (data) => {
        const result = quoteSchema.safeParse(data)
        expect(result.success).toBe(true)
      }),
      { numRuns: 100 },
    )
  })

  it('rejects input with missing or empty name', () => {
    fc.assert(
      fc.property(missingNameArb, (data) => {
        const result = quoteSchema.safeParse(data)
        expect(result.success).toBe(false)
      }),
      { numRuns: 100 },
    )
  })

  it('rejects input with missing or empty phone', () => {
    fc.assert(
      fc.property(missingPhoneArb, (data) => {
        const result = quoteSchema.safeParse(data)
        expect(result.success).toBe(false)
      }),
      { numRuns: 100 },
    )
  })

  it('rejects input with invalid email format', () => {
    fc.assert(
      fc.property(invalidEmailArb, (data) => {
        const result = quoteSchema.safeParse(data)
        // If email is present and not a valid email, it should fail
        if (data.email && data.email.length > 0) {
          // The schema uses z.string().email().optional(), so a non-email string should fail
          expect(result.success).toBe(false)
        }
      }),
      { numRuns: 100 },
    )
  })

  it('rejects input with invalid serviceType enum value', () => {
    fc.assert(
      fc.property(invalidServiceTypeArb, (data) => {
        const result = quoteSchema.safeParse(data)
        expect(result.success).toBe(false)
      }),
      { numRuns: 100 },
    )
  })
})

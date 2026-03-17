// Feature: payload-cms-backend, Property 4: Honeypot silently rejects spam submissions
// **Validates: Requirements 11.3**

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { rejectHoneypot } from '../rejectHoneypot'

/**
 * Helper to invoke the beforeChange hook with the given data and operation.
 */
function runHook(data: Record<string, unknown>, operation: 'create' | 'update') {
  return (rejectHoneypot as Function)({
    data,
    operation,
    req: {},
    collection: { slug: 'quote-requests' },
    originalDoc: undefined,
  })
}

/**
 * Arbitrary for non-empty honeypot strings (simulating bot-filled fields).
 */
const nonEmptyHoneypotArb = fc
  .string({ minLength: 1 })
  .filter((s) => s.trim().length > 0)

/**
 * Arbitrary for empty/falsy honeypot values that should pass through.
 */
const emptyHoneypotArb = fc.constantFrom('', undefined, null)

describe('Property 4: Honeypot silently rejects spam submissions', () => {
  it('rejects creation when honeypot is a non-empty string', async () => {
    await fc.assert(
      fc.asyncProperty(nonEmptyHoneypotArb, async (honeypot) => {
        await expect(
          runHook({ name: 'Bot', phone: '555-0000', honeypot }, 'create'),
        ).rejects.toThrow()
      }),
      { numRuns: 100 },
    )
  })

  it('allows creation when honeypot is empty or undefined', async () => {
    await fc.assert(
      fc.asyncProperty(emptyHoneypotArb, async (honeypot) => {
        const data: Record<string, unknown> = { name: 'Real User', phone: '555-1234' }
        if (honeypot !== undefined && honeypot !== null) {
          data.honeypot = honeypot
        }
        const result = await runHook(data, 'create')
        expect(result).toBeDefined()
        expect(result.name).toBe('Real User')
      }),
      { numRuns: 100 },
    )
  })

  it('allows update operations even with non-empty honeypot', async () => {
    await fc.assert(
      fc.asyncProperty(nonEmptyHoneypotArb, async (honeypot) => {
        const result = await runHook(
          { name: 'Admin Edit', phone: '555-9999', honeypot },
          'update',
        )
        expect(result).toBeDefined()
        expect(result.name).toBe('Admin Edit')
      }),
      { numRuns: 100 },
    )
  })

  it('returns data unchanged when honeypot check passes', async () => {
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)
    const phoneArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0)

    await fc.assert(
      fc.asyncProperty(nameArb, phoneArb, async (name, phone) => {
        const input = { name, phone }
        const result = await runHook(input, 'create')
        expect(result).toEqual(input)
      }),
      { numRuns: 100 },
    )
  })
})

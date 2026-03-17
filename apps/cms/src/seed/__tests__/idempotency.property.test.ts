// Feature: payload-cms-backend, Property 13: Seed script is idempotent
// **Validates: Requirements 17.7**

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// Mock payload and @payload-config BEFORE importing seed/index.ts.
// The seed file has a top-level seed() call that invokes getPayload,
// so we must mock getPayload to return a stub with find/create/updateGlobal
// to prevent crashes during module evaluation.
vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    find: vi.fn().mockResolvedValue({ docs: [], totalDocs: 0 }),
    create: vi.fn().mockResolvedValue({ id: 1 }),
    updateGlobal: vi.fn().mockResolvedValue({}),
  }),
}))

// Prevent the top-level seed() call from crashing the test via process.exit
const originalExit = process.exit
vi.spyOn(process, 'exit').mockImplementation((() => {}) as any)

vi.mock('@payload-config', () => ({ default: {} }))

// Mock data-mappers to return empty arrays so the top-level seed() doesn't blow up
vi.mock('../data-mappers', () => ({
  getServiceCategories: vi.fn().mockReturnValue([]),
  getServices: vi.fn().mockReturnValue([]),
  getServiceAreas: vi.fn().mockReturnValue([]),
  getTeamMembers: vi.fn().mockReturnValue([]),
  getReviews: vi.fn().mockReturnValue([]),
  getFaqs: vi.fn().mockReturnValue([]),
  getVehicleMakes: vi.fn().mockReturnValue([]),
  getGalleryItems: vi.fn().mockReturnValue([]),
  getSiteSettings: vi.fn().mockReturnValue({}),
  getHomepageLayout: vi.fn().mockReturnValue({}),
  getNavigation: vi.fn().mockReturnValue({}),
}))

import { seedIfNotExists } from '../index'

/**
 * Arbitrary for a collection name (lowercase alpha, 2-20 chars).
 */
const collectionArb = fc
  .stringMatching(/^[a-z][a-z-]*[a-z]$/)
  .filter((s) => s.length >= 2 && s.length <= 20 && !s.includes('--'))

/**
 * Arbitrary for a unique field name (simple identifier).
 */
const fieldNameArb = fc
  .stringMatching(/^[a-z][a-zA-Z0-9]*$/)
  .filter((s) => s.length >= 1 && s.length <= 20)

/**
 * Arbitrary for a unique value (non-empty string).
 */
const uniqueValueArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0)

/**
 * Arbitrary for document data (simple key-value object).
 */
const dataArb = fc.dictionary(
  fc.stringMatching(/^[a-z][a-zA-Z0-9]*$/).filter((s) => s.length >= 1 && s.length <= 15),
  fc.oneof(fc.string(), fc.integer(), fc.boolean()),
  { minKeys: 1, maxKeys: 5 },
)

describe('Property 13: Seed script is idempotent', () => {
  it('returns existing doc and does NOT call create when document already exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        collectionArb,
        fieldNameArb,
        uniqueValueArb,
        dataArb,
        fc.integer({ min: 1, max: 10000 }),
        async (collection, uniqueField, uniqueValue, data, docId) => {
          const existingDoc = { id: docId, [uniqueField]: uniqueValue, ...data }

          const mockPayload = {
            find: vi.fn().mockResolvedValue({ docs: [existingDoc] }),
            create: vi.fn(),
          }

          const result = await seedIfNotExists(mockPayload as any, {
            collection,
            uniqueField,
            uniqueValue,
            data,
          })

          // Should query the collection with the correct where clause
          expect(mockPayload.find).toHaveBeenCalledWith({
            collection,
            where: { [uniqueField]: { equals: uniqueValue } },
            limit: 1,
          })

          // Should NOT create a new document
          expect(mockPayload.create).not.toHaveBeenCalled()

          // Should return the existing document
          expect(result).toBe(existingDoc)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('creates a new doc when no existing document is found', async () => {
    await fc.assert(
      fc.asyncProperty(
        collectionArb,
        fieldNameArb,
        uniqueValueArb,
        dataArb,
        fc.integer({ min: 1, max: 10000 }),
        async (collection, uniqueField, uniqueValue, data, newId) => {
          const createdDoc = { id: newId, ...data }

          const mockPayload = {
            find: vi.fn().mockResolvedValue({ docs: [] }),
            create: vi.fn().mockResolvedValue(createdDoc),
          }

          const result = await seedIfNotExists(mockPayload as any, {
            collection,
            uniqueField,
            uniqueValue,
            data,
          })

          // Should query first
          expect(mockPayload.find).toHaveBeenCalledWith({
            collection,
            where: { [uniqueField]: { equals: uniqueValue } },
            limit: 1,
          })

          // Should create the document
          expect(mockPayload.create).toHaveBeenCalledWith({
            collection,
            data,
          })

          // Should return the newly created document
          expect(result).toBe(createdDoc)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('calling seedIfNotExists twice with same params results in no duplicate creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        collectionArb,
        fieldNameArb,
        uniqueValueArb,
        dataArb,
        fc.integer({ min: 1, max: 10000 }),
        async (collection, uniqueField, uniqueValue, data, docId) => {
          const createdDoc = { id: docId, [uniqueField]: uniqueValue, ...data }

          // First call: no existing doc → creates one
          // Second call: doc now exists → skips creation
          const mockPayload = {
            find: vi
              .fn()
              .mockResolvedValueOnce({ docs: [] })
              .mockResolvedValueOnce({ docs: [createdDoc] }),
            create: vi.fn().mockResolvedValue(createdDoc),
          }

          const opts = { collection, uniqueField, uniqueValue, data }

          const result1 = await seedIfNotExists(mockPayload as any, opts)
          const result2 = await seedIfNotExists(mockPayload as any, opts)

          // find should have been called exactly twice
          expect(mockPayload.find).toHaveBeenCalledTimes(2)

          // create should have been called exactly once (first call only)
          expect(mockPayload.create).toHaveBeenCalledTimes(1)

          // Both calls return the same document
          expect(result1).toEqual(createdDoc)
          expect(result2).toBe(createdDoc)
        },
      ),
      { numRuns: 100 },
    )
  })
})

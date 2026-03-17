// Feature: payload-cms-backend, Property 11: Media upload produces all configured image sizes
// **Validates: Requirements 3.2**

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import Media from '../Media'

/**
 * Expected image sizes as defined in the design document.
 */
const EXPECTED_IMAGE_SIZES = [
  { name: 'thumbnail', width: 300, height: 300 },
  { name: 'card', width: 600, height: 400 },
  { name: 'hero', width: 1200, height: 600 },
  { name: 'og', width: 1200, height: 630 },
] as const

const EXPECTED_SIZE_NAMES = EXPECTED_IMAGE_SIZES.map((s) => s.name)

/**
 * MIME types that are accepted but should not trigger image resizing.
 */
const NON_RESIZABLE_MIME_TYPES = ['image/svg+xml', 'application/pdf']

/**
 * Extract the upload config from the Media collection.
 */
const uploadConfig = Media.upload as Record<string, unknown> | undefined
const imageSizes = (
  typeof uploadConfig === 'object' && uploadConfig !== null
    ? (uploadConfig.imageSizes as Array<{ name: string; width: number; height: number }>)
    : undefined
) ?? []
const mimeTypes = (
  typeof uploadConfig === 'object' && uploadConfig !== null
    ? (uploadConfig.mimeTypes as string[])
    : undefined
) ?? []

describe('Property 11: Media upload produces all configured image sizes', () => {
  it('defines exactly 4 image sizes', () => {
    expect(imageSizes).toHaveLength(4)
  })

  it('each expected image size has the correct name and dimensions', () => {
    for (const expected of EXPECTED_IMAGE_SIZES) {
      const found = imageSizes.find((s) => s.name === expected.name)
      expect(found, `image size "${expected.name}" should exist`).toBeDefined()
      expect(found!.width).toBe(expected.width)
      expect(found!.height).toBe(expected.height)
    }
  })

  it('random image size names from the config match the expected set', () => {
    const configuredNameArb = fc.constantFrom(...imageSizes.map((s) => s.name))

    fc.assert(
      fc.property(configuredNameArb, (name) => {
        expect(EXPECTED_SIZE_NAMES).toContain(name)
      }),
      { numRuns: 100 },
    )
  })

  it('every expected size name is present in the config for any random selection', () => {
    const expectedNameArb = fc.constantFrom(...EXPECTED_SIZE_NAMES)

    fc.assert(
      fc.property(expectedNameArb, (name) => {
        const found = imageSizes.find((s) => s.name === name)
        expect(found).toBeDefined()

        const expected = EXPECTED_IMAGE_SIZES.find((s) => s.name === name)!
        expect(found!.width).toBe(expected.width)
        expect(found!.height).toBe(expected.height)
      }),
      { numRuns: 100 },
    )
  })

  it('SVG and PDF MIME types are accepted in the allowed list', () => {
    const nonResizableArb = fc.constantFrom(...NON_RESIZABLE_MIME_TYPES)

    fc.assert(
      fc.property(nonResizableArb, (mime) => {
        expect(mimeTypes).toContain(mime)
      }),
      { numRuns: 100 },
    )
  })

  it('no duplicate image size names exist in the config', () => {
    const names = imageSizes.map((s) => s.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

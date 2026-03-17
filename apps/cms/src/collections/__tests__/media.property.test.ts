// Feature: payload-cms-backend, Property 12: Media validates MIME type and requires alt text
// **Validates: Requirements 3.3, 3.4**

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import Media from '../Media'

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
]

/**
 * Arbitrary that generates a valid MIME type from the allowed set.
 */
const validMimeTypeArb = fc.constantFrom(...ALLOWED_MIME_TYPES)

/**
 * Arbitrary that generates an invalid MIME type that is NOT in the allowed set.
 */
const invalidMimeTypeArb = fc.constantFrom(
  'text/html',
  'text/plain',
  'text/css',
  'text/javascript',
  'application/json',
  'application/xml',
  'application/zip',
  'application/octet-stream',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'application/msword',
  'application/vnd.ms-excel',
  'multipart/form-data',
)

describe('Property 12: Media validates MIME type and requires alt text', () => {
  const uploadConfig = Media.upload as Record<string, unknown> | undefined
  const mimeTypes =
    typeof uploadConfig === 'object' && uploadConfig !== null
      ? (uploadConfig.mimeTypes as string[] | undefined)
      : undefined

  it('allowed MIME types are present in the media config', () => {
    fc.assert(
      fc.property(validMimeTypeArb, (mimeType) => {
        expect(mimeTypes).toBeDefined()
        expect(mimeTypes).toContain(mimeType)
      }),
      { numRuns: 100 },
    )
  })

  it('invalid MIME types are NOT in the allowed list', () => {
    fc.assert(
      fc.property(invalidMimeTypeArb, (mimeType) => {
        expect(mimeTypes).toBeDefined()
        expect(mimeTypes).not.toContain(mimeType)
      }),
      { numRuns: 100 },
    )
  })

  it('the allowed list contains exactly the 5 specified MIME types', () => {
    expect(mimeTypes).toBeDefined()
    expect(mimeTypes).toHaveLength(ALLOWED_MIME_TYPES.length)
    for (const mime of ALLOWED_MIME_TYPES) {
      expect(mimeTypes).toContain(mime)
    }
  })

  it('alt field is required', () => {
    const altField = Media.fields.find(
      (f) => 'name' in f && f.name === 'alt',
    )
    expect(altField).toBeDefined()
    expect(altField).toHaveProperty('required', true)
  })

  it('caption field is NOT required', () => {
    const captionField = Media.fields.find(
      (f) => 'name' in f && f.name === 'caption',
    )
    expect(captionField).toBeDefined()
    expect(captionField).not.toHaveProperty('required', true)
  })

  it('random MIME types are correctly classified as allowed or rejected', () => {
    const anyMimeTypeArb = fc.oneof(validMimeTypeArb, invalidMimeTypeArb)

    fc.assert(
      fc.property(anyMimeTypeArb, (mimeType) => {
        const isAllowed = ALLOWED_MIME_TYPES.includes(mimeType)
        if (isAllowed) {
          expect(mimeTypes).toContain(mimeType)
        } else {
          expect(mimeTypes).not.toContain(mimeType)
        }
      }),
      { numRuns: 100 },
    )
  })
})

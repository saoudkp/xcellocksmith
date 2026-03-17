import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveDraft, publishContent, loadSectionContent } from '../sectionPersistence'
import type { RichTextSectionHeading } from '../../types/sectionEditor'

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid RichTextSectionHeading for tests. */
const sampleContent: RichTextSectionHeading = {
  heading: {
    root: {
      type: 'root',
      children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Hello', version: 1 }], version: 1 }],
      version: 1,
    },
  },
  subheading: null,
  accent: null,
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response
}

// ---------------------------------------------------------------------------
// saveDraft
// ---------------------------------------------------------------------------

describe('saveDraft', () => {
  it('sends draftData and status=draft for sections-settings', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ reviews: { draftData: sampleContent, status: 'draft' } }))

    const result = await saveDraft('sections-settings', 'reviews', sampleContent)

    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledOnce()

    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/globals/sections-settings')
    expect(opts.method).toBe('POST')

    const body = JSON.parse(opts.body)
    expect(body.reviews.draftData).toEqual(sampleContent)
    expect(body.reviews.status).toBe('draft')
    // publishedData should NOT be included in a draft save
    expect(body.reviews.publishedData).toBeUndefined()
  })

  it('uses sectionHeader prefix for services-settings', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ sectionHeader: { draftData: sampleContent, status: 'draft' } }))

    const result = await saveDraft('services-settings', 'sectionHeader', sampleContent)

    expect(result.success).toBe(true)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.sectionHeader.draftData).toEqual(sampleContent)
    expect(body.sectionHeader.status).toBe('draft')
  })

  it('returns error on HTTP failure', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse('Unauthorized', 401))

    const result = await saveDraft('sections-settings', 'reviews', sampleContent)

    expect(result.success).toBe(false)
    expect(result.error).toContain('401')
  })

  it('returns error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network down'))

    const result = await saveDraft('sections-settings', 'reviews', sampleContent)

    expect(result.success).toBe(false)
    expect(result.error).toContain('Network')
  })
})

// ---------------------------------------------------------------------------
// publishContent
// ---------------------------------------------------------------------------

describe('publishContent', () => {
  it('sends both draftData and publishedData with status=published', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ reviews: { publishedData: sampleContent, status: 'published' } }))

    const result = await publishContent('sections-settings', 'reviews', sampleContent)

    expect(result.success).toBe(true)

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.reviews.draftData).toEqual(sampleContent)
    expect(body.reviews.publishedData).toEqual(sampleContent)
    expect(body.reviews.status).toBe('published')
  })

  it('uses sectionHeader prefix for services-settings', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ sectionHeader: { publishedData: sampleContent, status: 'published' } }))

    const result = await publishContent('services-settings', 'sectionHeader', sampleContent)

    expect(result.success).toBe(true)
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.sectionHeader.publishedData).toEqual(sampleContent)
    expect(body.sectionHeader.status).toBe('published')
  })

  it('returns error on HTTP failure', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse('Server Error', 500))

    const result = await publishContent('sections-settings', 'gallery', sampleContent)

    expect(result.success).toBe(false)
    expect(result.error).toContain('500')
  })
})

// ---------------------------------------------------------------------------
// loadSectionContent
// ---------------------------------------------------------------------------

describe('loadSectionContent', () => {
  it('returns draft content when both draft and published exist', async () => {
    const published: RichTextSectionHeading = { heading: null, subheading: null, accent: null }
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        reviews: { draftData: sampleContent, publishedData: published, status: 'draft' },
      }),
    )

    const result = await loadSectionContent('sections-settings', 'reviews')

    expect(result.content).toEqual(sampleContent)
    expect(result.publishedContent).toEqual(published)
    expect(result.status).toBe('draft')
  })

  it('falls back to published content when draft is null', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        reviews: { draftData: null, publishedData: sampleContent, status: 'published' },
      }),
    )

    const result = await loadSectionContent('sections-settings', 'reviews')

    expect(result.content).toEqual(sampleContent)
    expect(result.publishedContent).toEqual(sampleContent)
    expect(result.status).toBe('published')
  })

  it('returns null content when both draft and published are absent', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ reviews: { status: 'draft' } }),
    )

    const result = await loadSectionContent('sections-settings', 'reviews')

    expect(result.content).toBeNull()
    expect(result.publishedContent).toBeNull()
    expect(result.status).toBe('draft')
  })

  it('reads from sectionHeader for services-settings', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        sectionHeader: { draftData: sampleContent, publishedData: null, status: 'draft' },
      }),
    )

    const result = await loadSectionContent('services-settings', 'sectionHeader')

    expect(result.content).toEqual(sampleContent)
    expect(result.publishedContent).toBeNull()
    expect(result.status).toBe('draft')
  })

  it('returns error when section group is missing', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({}))

    const result = await loadSectionContent('sections-settings', 'reviews')

    expect(result.content).toBeNull()
    expect(result.error).toContain('reviews')
  })

  it('returns error on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Offline'))

    const result = await loadSectionContent('sections-settings', 'reviews')

    expect(result.content).toBeNull()
    expect(result.error).toContain('Network')
  })
})

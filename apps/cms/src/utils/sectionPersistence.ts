/**
 * Draft/publish persistence utilities for the WYSIWYG Section Editor.
 *
 * These functions use the Payload REST API (browser-side fetch) to
 * read and write draft/published data for section headings stored in
 * the `sections-settings` and `services-settings` globals.
 *
 * Data layout per section group:
 *   - `draftData`     — JSON blob with the in-progress heading content
 *   - `publishedData` — JSON blob with the live heading content
 *   - `status`        — `'draft'` | `'published'`
 *
 * For `sections-settings` the fields live under the section key
 * (e.g. `reviews.draftData`).  For `services-settings` they live
 * under `sectionHeader.draftData`.
 *
 * @see Requirements 11.3, 11.4, 11.8, 11.9, 11.11, 11.12
 */

import type { RichTextSectionHeading, PublishStatus } from '../types/sectionEditor'
import { validateSectionContent } from './sectionValidation'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supported global slugs. */
export type GlobalSlug = 'sections-settings' | 'services-settings'

/** Result returned by every persistence operation. */
export interface PersistenceResult {
  success: boolean
  error?: string
  /** Updated configuration returned from the API after a successful save. */
  data?: Record<string, unknown>
}

/** Shape returned by `loadSectionContent`. */
export interface SectionContentData {
  /** The content to display in the editor (draft if exists, else published). */
  content: RichTextSectionHeading | null
  /** The published snapshot (may be null if never published). */
  publishedContent: RichTextSectionHeading | null
  /** Current status of the section. */
  status: PublishStatus
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the field-path prefix for a given global + section key.
 *
 * - `sections-settings` → the section key itself (e.g. `"reviews"`)
 * - `services-settings` → always `"sectionHeader"`
 */
function fieldPrefix(globalSlug: GlobalSlug, sectionKey: string): string {
  return globalSlug === 'services-settings' ? 'sectionHeader' : sectionKey
}

/**
 * Builds a nested update body from a dot-separated path and a set of
 * field values.  For example `buildBody("reviews", { draftData: {…} })`
 * produces `{ reviews: { draftData: {…} } }`.
 */
function buildBody(
  prefix: string,
  fields: Record<string, unknown>,
): Record<string, unknown> {
  return { [prefix]: fields }
}

/**
 * POST to the Payload globals REST endpoint.
 * Uses `credentials: 'include'` so the admin session cookie is sent.
 */
async function postGlobal(
  globalSlug: GlobalSlug,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`/api/globals/${globalSlug}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return { ok: false, error: `Save failed (${res.status}): ${text}` }
    }

    const data = (await res.json()) as Record<string, unknown>
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: `Network error: ${String(err)}` }
  }
}

/**
 * GET the current global document from the Payload REST API.
 */
async function fetchGlobal(
  globalSlug: GlobalSlug,
): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    const res = await fetch(`/api/globals/${globalSlug}`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return { ok: false, error: `Fetch failed (${res.status}): ${text}` }
    }

    const data = (await res.json()) as Record<string, unknown>
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: `Network error: ${String(err)}` }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Save content as a draft without affecting the published frontend.
 *
 * Writes to the `draftData` JSON field and sets `status` to `'draft'`.
 * Cache invalidation is skipped because the `afterChange` hook only
 * fires revalidation when `status === 'published'`.
 *
 * @see Requirement 11.3 — Save Draft saves with Draft_Status
 * @see Requirement 11.12 — no cache invalidation on draft save
 */
export async function saveDraft(
  globalSlug: GlobalSlug,
  sectionKey: string,
  data: RichTextSectionHeading,
): Promise<PersistenceResult> {
  // Validate content structure before persisting (Requirement 9.2)
  const validation = validateSectionContent(data)
  if (!validation.valid) {
    return {
      success: false,
      error: `Invalid content: ${validation.errors.join('; ')}`,
    }
  }

  const prefix = fieldPrefix(globalSlug, sectionKey)
  const body = buildBody(prefix, {
    draftData: data,
    status: 'draft',
  })

  const result = await postGlobal(globalSlug, body)

  if (!result.ok) {
    return { success: false, error: result.error }
  }

  // Return updated configuration to frontend (Requirement 9.5)
  return { success: true, data: result.data }
}

/**
 * Publish content — copies the provided data to both `draftData` and
 * `publishedData`, then sets `status` to `'published'`.
 *
 * The `afterChange` hook on the global will detect the published status
 * and invalidate the frontend cache automatically.
 *
 * @see Requirement 11.4  — Publish saves with Published_Status
 * @see Requirement 11.11 — Publish replaces published version with draft
 * @see Requirement 11.12 — cache invalidation on publish
 */
export async function publishContent(
  globalSlug: GlobalSlug,
  sectionKey: string,
  data: RichTextSectionHeading,
): Promise<PersistenceResult> {
  // Validate content structure before persisting (Requirement 9.2)
  const validation = validateSectionContent(data)
  if (!validation.valid) {
    return {
      success: false,
      error: `Invalid content: ${validation.errors.join('; ')}`,
    }
  }

  const prefix = fieldPrefix(globalSlug, sectionKey)
  const body = buildBody(prefix, {
    draftData: data,
    publishedData: data,
    status: 'published',
  })

  const result = await postGlobal(globalSlug, body)

  if (!result.ok) {
    return { success: false, error: result.error }
  }

  // Return updated configuration to frontend (Requirement 9.5)
  return { success: true, data: result.data }
}

/**
 * Load section content for the editor.
 *
 * Returns the draft version if it exists, otherwise the published version.
 * Also returns the published snapshot separately so the UI can show a
 * "changes pending" indicator when draft differs from published.
 *
 * @see Requirement 11.9 — display draft if exists, otherwise published
 * @see Requirement 11.8 — maintain separate draft and published storage
 */
export async function loadSectionContent(
  globalSlug: GlobalSlug,
  sectionKey: string,
): Promise<SectionContentData & { error?: string }> {
  const result = await fetchGlobal(globalSlug)

  if (!result.ok || !result.data) {
    return {
      content: null,
      publishedContent: null,
      status: 'draft',
      error: result.error,
    }
  }

  const prefix = fieldPrefix(globalSlug, sectionKey)
  const group = result.data[prefix] as Record<string, unknown> | undefined

  if (!group) {
    return {
      content: null,
      publishedContent: null,
      status: 'draft',
      error: `Section group "${prefix}" not found in ${globalSlug}`,
    }
  }

  const draftData = (group.draftData as RichTextSectionHeading) ?? null
  const publishedData = (group.publishedData as RichTextSectionHeading) ?? null
  const status = (group.status as PublishStatus) ?? 'draft'

  // Prefer draft content for the editor; fall back to published
  const content = draftData ?? publishedData

  return {
    content,
    publishedContent: publishedData,
    status,
  }
}

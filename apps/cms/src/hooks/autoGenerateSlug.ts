import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Generates a URL-safe slug from a name or title field when the slug is empty.
 * Attached as a `beforeValidate` hook on collections that need auto-slug generation.
 *
 * Slug rules:
 * - Lowercase
 * - Spaces and special characters replaced with hyphens
 * - No consecutive hyphens
 * - No leading or trailing hyphens
 * - Deterministic: same input always produces the same slug
 */
export const autoGenerateSlug: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (!data) return data

  // Only generate slug if it's empty/undefined
  if (data.slug) return data

  // Look for name first, then title as fallback
  const source: string | undefined = data.name ?? data.title

  if (!source) return data

  const slug = source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric chars (except spaces and hyphens)
    .replace(/[\s]+/g, '-')        // replace spaces with hyphens
    .replace(/-{2,}/g, '-')        // collapse consecutive hyphens
    .replace(/^-+/, '')            // trim leading hyphens
    .replace(/-+$/, '')            // trim trailing hyphens

  return {
    ...data,
    slug,
  }
}

export default autoGenerateSlug

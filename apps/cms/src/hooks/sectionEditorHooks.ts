import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

/**
 * `afterChange` hook for the **sections-settings** global.
 *
 * Content is auto-published on save — no draft/publish workflow.
 * Always invalidates the cache tag so the frontend picks up changes.
 */
export const invalidateSectionsCache: GlobalAfterChangeHook = async ({ doc, req }) => {
  try {
    req.payload.logger.info('sections-settings saved — invalidating cache')
    revalidateTag('sections-settings')
  } catch (error) {
    req.payload.logger.error(`Failed to invalidate sections-settings cache: ${String(error)}`)
  }
  return doc
}

/**
 * `afterChange` hook for services data (now merged into sections-settings).
 *
 * Invalidates the `services-settings` cache tag so the frontend
 * picks up changes to services header and category configs.
 */
export const invalidateServicesCache: GlobalAfterChangeHook = async ({ doc, req }) => {
  try {
    req.payload.logger.info('services settings saved — invalidating cache')
    revalidateTag('services-settings')
  } catch (error) {
    req.payload.logger.error(`Failed to invalidate services-settings cache: ${String(error)}`)
  }
  return doc
}

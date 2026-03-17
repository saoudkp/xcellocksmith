import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Triggers sitemap regeneration when services, service-areas, or service-categories change.
 * Attached as an `afterChange` hook on services, service-areas, and service-categories collections.
 */
export const regenerateSitemap: CollectionAfterChangeHook = async ({ doc, req, collection }) => {
  try {
    req.payload.logger.info(
      `Regenerating sitemap after change in ${collection.slug}`,
    )
    revalidatePath('/sitemap.xml')
    revalidateTag('sitemap')
  } catch (error) {
    req.payload.logger.error(`Failed to regenerate sitemap: ${String(error)}`)
  }

  return doc
}

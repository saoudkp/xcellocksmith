import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Triggers ISR revalidation for the changed city page.
 * Attached as an `afterChange` hook on the service-areas collection.
 */
export const revalidateCityPages: CollectionAfterChangeHook = async ({ doc, req }) => {
  try {
    const slug = doc.slug as string | undefined

    if (slug) {
      const pagePath = `/cities/${slug}`
      req.payload.logger.info(`Revalidating city page: ${pagePath}`)
      revalidatePath(pagePath)
    }

    revalidateTag('service-areas')
  } catch (error) {
    req.payload.logger.error(`Failed to revalidate city page: ${String(error)}`)
  }

  return doc
}

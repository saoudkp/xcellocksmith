import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Triggers ISR revalidation for the changed service page.
 * Attached as an `afterChange` hook on the services collection.
 */
export const revalidateServicePages: CollectionAfterChangeHook = async ({ doc, req }) => {
  try {
    const category =
      typeof doc.category === 'object' && doc.category?.slug
        ? doc.category.slug
        : doc.category

    const slug = doc.slug as string | undefined

    if (slug) {
      const pagePath = category
        ? `/services/${category}/${slug}`
        : `/services/${slug}`

      req.payload.logger.info(`Revalidating service page: ${pagePath}`)
      revalidatePath(pagePath)
    }

    revalidateTag('services')
  } catch (error) {
    req.payload.logger.error(`Failed to revalidate service page: ${String(error)}`)
  }

  return doc
}

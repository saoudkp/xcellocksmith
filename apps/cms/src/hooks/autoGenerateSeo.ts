import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Auto-generates SEO title and description when they're empty.
 * Uses the service/area title + business context for optimal search ranking.
 */
export const autoGenerateSeo: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (!data) return data

  const title = data.title || data.name || data.cityName || ''
  if (!title) return data

  // Auto-generate seoTitle if empty
  if (!data.seoTitle) {
    if (data.cityName) {
      // Service Area
      data.seoTitle = `Locksmith in ${data.cityName}, ${data.state || 'OH'} | 24/7 Emergency Service | Xcel Locksmith`
    } else if (data.category || data.categorySlug) {
      // Service
      data.seoTitle = `${title} in Cleveland, OH | Fast & Affordable | Xcel Locksmith`
    } else {
      data.seoTitle = `${title} | Xcel Locksmith Cleveland, OH`
    }
  }

  // Auto-generate seoDescription if empty
  if (!data.seoDescription) {
    const shortDesc = data.shortDescription || data.description || ''
    if (data.cityName) {
      data.seoDescription = `Need a locksmith in ${data.cityName}, ${data.state || 'OH'}? Xcel Locksmith offers 24/7 emergency lockout, lock repair, key replacement & more. Fast 20-30 min response. Call now for a free quote!`
    } else if (shortDesc) {
      data.seoDescription = `${shortDesc.slice(0, 120).trim()}${shortDesc.length > 120 ? '...' : ''} Professional locksmith service in Cleveland, OH. Call Xcel Locksmith for fast, reliable service.`
    } else {
      data.seoDescription = `${title} — professional locksmith service in Cleveland, OH and surrounding areas. 24/7 emergency service, transparent pricing. Call Xcel Locksmith today!`
    }
  }

  return data
}

export default autoGenerateSeo

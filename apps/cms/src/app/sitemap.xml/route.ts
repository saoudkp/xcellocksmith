import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://xcellocksmith.com'

interface SitemapEntry {
  loc: string
  lastmod: string
  priority: string
  changefreq: string
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (entry) =>
        `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`
}

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const [categories, services, serviceAreas] = await Promise.all([
      payload.find({
        collection: 'service-categories',
        where: { isActive: { equals: true } },
        limit: 0,
      }),
      payload.find({
        collection: 'services',
        where: { isActive: { equals: true } },
        limit: 0,
      }),
      payload.find({
        collection: 'service-areas',
        where: { isActive: { equals: true } },
        limit: 0,
      }),
    ])

    const entries: SitemapEntry[] = []

    for (const doc of categories.docs) {
      entries.push({
        loc: `${BASE_URL}/services/${doc.slug}`,
        lastmod: new Date(doc.updatedAt).toISOString(),
        changefreq: 'weekly',
        priority: '0.9',
      })
    }

    for (const doc of services.docs) {
      const categorySlug =
        typeof doc.category === 'object' && doc.category !== null
          ? (doc.category as { slug?: string }).slug
          : undefined
      const path = categorySlug
        ? `/services/${categorySlug}/${doc.slug}`
        : `/services/${doc.slug}`
      entries.push({
        loc: `${BASE_URL}${path}`,
        lastmod: new Date(doc.updatedAt).toISOString(),
        changefreq: 'weekly',
        priority: '0.8',
      })
    }

    for (const doc of serviceAreas.docs) {
      entries.push({
        loc: `${BASE_URL}/cities/${doc.slug}`,
        lastmod: new Date(doc.updatedAt).toISOString(),
        changefreq: 'weekly',
        priority: '0.8',
      })
    }

    const xml = buildSitemapXml(entries)

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}

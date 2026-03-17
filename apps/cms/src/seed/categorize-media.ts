/**
 * One-time script to bulk-categorize existing media files.
 * Checks which collections reference each media item and assigns a category.
 *
 * Run from apps/cms: npx payload run ./src/seed/categorize-media.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'

async function categorizeMedia(): Promise<void> {
  const payload = await getPayload({ config })

  console.log('🏷️  Categorizing existing media...\n')

  // Build a map of mediaId -> category by scanning all collections that reference media
  const categoryMap = new Map<string | number, string>()

  // Gallery items → gallery
  console.log('  Scanning gallery-items...')
  const galleryDocs = await payload.find({ collection: 'gallery-items' as any, limit: 500, depth: 0 })
  for (const doc of galleryDocs.docs) {
    if (doc.beforeImage) categoryMap.set(doc.beforeImage as string | number, 'gallery')
    if (doc.afterImage) categoryMap.set(doc.afterImage as string | number, 'gallery')
  }
  console.log(`    Found ${galleryDocs.docs.length} gallery items`)

  // Services → services
  console.log('  Scanning services...')
  const serviceDocs = await payload.find({ collection: 'services' as any, limit: 500, depth: 0 })
  for (const doc of serviceDocs.docs) {
    if (doc.heroImage) categoryMap.set(doc.heroImage as string | number, 'services')
  }
  console.log(`    Found ${serviceDocs.docs.length} services`)

  // Service categories → services
  console.log('  Scanning service-categories...')
  const catDocs = await payload.find({ collection: 'service-categories' as any, limit: 500, depth: 0 })
  for (const doc of catDocs.docs) {
    if (doc.heroImage) categoryMap.set(doc.heroImage as string | number, 'services')
  }
  console.log(`    Found ${catDocs.docs.length} service categories`)

  // Team members → team
  console.log('  Scanning team-members...')
  const teamDocs = await payload.find({ collection: 'team-members' as any, limit: 500, depth: 0 })
  for (const doc of teamDocs.docs) {
    if (doc.photo) categoryMap.set(doc.photo as string | number, 'team')
    const certs = (doc.certifications as Array<Record<string, unknown>>) || []
    for (const cert of certs) {
      if (cert.file) categoryMap.set(cert.file as string | number, 'team')
    }
  }
  console.log(`    Found ${teamDocs.docs.length} team members`)

  // Vehicle makes → vehicles
  console.log('  Scanning vehicle-makes...')
  const vehicleDocs = await payload.find({ collection: 'vehicle-makes' as any, limit: 500, depth: 0 })
  for (const doc of vehicleDocs.docs) {
    if (doc.logo) categoryMap.set(doc.logo as string | number, 'vehicles')
  }
  console.log(`    Found ${vehicleDocs.docs.length} vehicle makes`)

  // Quote requests → quotes
  console.log('  Scanning quote-requests...')
  const quoteDocs = await payload.find({ collection: 'quote-requests' as any, limit: 500, depth: 0 })
  for (const doc of quoteDocs.docs) {
    if (doc.photo) categoryMap.set(doc.photo as string | number, 'quotes')
  }
  console.log(`    Found ${quoteDocs.docs.length} quote requests`)

  console.log(`\n  Total media references found: ${categoryMap.size}`)

  // Now update all media
  const allMedia = await payload.find({ collection: 'media' as any, limit: 1000, depth: 0 })
  let updated = 0
  let skipped = 0

  for (const media of allMedia.docs) {
    const existing = (media as Record<string, unknown>).mediaCategory as string | null
    // Skip if already properly categorized
    if (existing && existing !== 'uncategorized') {
      skipped++
      continue
    }

    const category = categoryMap.get(media.id) || 'uncategorized'

    await payload.update({
      collection: 'media' as any,
      id: media.id,
      data: { mediaCategory: category } as any,
    })
    updated++
    if (category !== 'uncategorized') {
      console.log(`  ✅ ${(media as any).filename} → ${category}`)
    }
  }

  console.log(`\n🎉 Done! Updated ${updated} media files, skipped ${skipped} already categorized (${allMedia.docs.length} total)`)
  process.exit(0)
}

categorizeMedia().catch((err) => {
  console.error('❌ Categorization failed:', err)
  process.exit(1)
})

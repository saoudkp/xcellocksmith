import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getServiceCategories,
  getServices,
  getServiceAreas,
  getTeamMembers,
  getReviews,
  getFaqs,
  getVehicleMakes,
  getGalleryItems,
  getServiceImagePaths,
  getSiteSettings,
  getHomepageLayout,
  getNavigation,
} from './data-mappers'
import { uploadLocalFile } from './upload-media'

const seedDir = path.dirname(fileURLToPath(import.meta.url))

/**
 * Queries a collection for an existing document matching a unique field value.
 * If no match is found, creates the document. Returns the existing or newly created doc.
 *
 * This ensures idempotent seeding — running the script multiple times won't create duplicates.
 */
export async function seedIfNotExists<T extends Record<string, unknown>>(
  payload: Payload,
  options: {
    collection: string
    uniqueField: string
    uniqueValue: string | number
    data: Record<string, unknown> | object
  },
): Promise<T> {
  const { collection, uniqueField, uniqueValue, data } = options

  const existing = await payload.find({
    collection: collection as any,
    where: { [uniqueField]: { equals: uniqueValue } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log(`  ⏭  Skipped ${collection} (${uniqueField}=${uniqueValue}) — already exists`)
    return existing.docs[0] as unknown as T
  }

  const created = await payload.create({
    collection: collection as any,
    data: data as any,
  })

  console.log(`  ✅ Created ${collection} (${uniqueField}=${uniqueValue})`)
  return created as unknown as T
}

/**
 * Ensures at least one admin user exists.
 * If no users are found, creates a default admin account.
 */
async function ensureAdmin(payload: Payload): Promise<void> {
  const { totalDocs } = await payload.find({
    collection: 'users',
    limit: 0,
  })

  if (totalDocs > 0) {
    console.log(`⏭  Admin user already exists (${totalDocs} user(s) found)`)
    return
  }

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@xcellocksmith.com'
  const password = process.env.SEED_ADMIN_PASSWORD || 'changeme123'

  await payload.create({
    collection: 'users',
    data: { email, password },
  })

  console.log(`✅ Created default admin user (${email})`)
}

/**
 * Main seed function — initializes Payload and orchestrates all seeding steps.
 */
export async function seed(): Promise<void> {
  console.log('🌱 Starting seed script...\n')

  const payload = await getPayload({ config })

  // Step 1: Ensure admin user exists
  console.log('👤 Checking admin user...')
  await ensureAdmin(payload)
  console.log()

  // Step 2: Seed collections
  console.log('📂 Seeding service categories...')
  const categoryMap = await seedServiceCategories(payload)
  console.log()

  console.log('🔧 Seeding services...')
  await seedServices(payload, categoryMap)
  console.log()

  console.log('📍 Seeding service areas...')
  await seedServiceAreas(payload)
  console.log()

  console.log('👥 Seeding team members...')
  await seedTeamMembers(payload)
  console.log()

  console.log('⭐ Seeding reviews...')
  await seedReviews(payload)
  console.log()

  console.log('❓ Seeding FAQs...')
  await seedFaqs(payload)
  console.log()

  console.log('🚗 Seeding vehicle makes & models...')
  await seedVehicleMakesAndModels(payload)
  console.log()

  console.log('🖼️  Seeding gallery items...')
  await seedGalleryItems(payload)
  console.log()

  console.log('📸 Uploading service images...')
  await seedServiceImages(payload)
  console.log()

  // Step 3: Seed globals
  console.log('⚙️  Seeding site-settings global...')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: getSiteSettings(),
  })
  console.log('  ✅ Updated site-settings')
  console.log()

  console.log('🏠 Seeding homepage-layout global...')
  await payload.updateGlobal({
    slug: 'homepage-layout',
    data: getHomepageLayout(),
  })
  console.log('  ✅ Updated homepage-layout')
  console.log()

  console.log('🧭 Seeding navigation global...')
  await payload.updateGlobal({
    slug: 'navigation',
    data: getNavigation(),
  })
  console.log('  ✅ Updated navigation')
  console.log()

  console.log('\n🎉 Seed script complete!')
}

// ---------------------------------------------------------------------------
// Collection seeders
// ---------------------------------------------------------------------------

/**
 * Seeds the 3 service categories and returns a slug→id map for service seeding.
 */
async function seedServiceCategories(
  payload: Payload,
): Promise<Record<string, string | number>> {
  const categories = getServiceCategories()
  const map: Record<string, string | number> = {}

  for (const cat of categories) {
    const doc = await seedIfNotExists(payload, {
      collection: 'service-categories',
      uniqueField: 'slug',
      uniqueValue: cat.slug,
      data: cat,
    })
    map[cat.slug] = doc.id as string | number
  }

  return map
}

/**
 * Seeds 29 services, merging data from services.ts + serviceDetails.
 * Resolves category relationship via the slug→id map.
 */
async function seedServices(
  payload: Payload,
  categoryMap: Record<string, string | number>,
): Promise<void> {
  const serviceList = getServices()

  for (const svc of serviceList) {
    const categoryId = categoryMap[svc.categorySlug]
    if (!categoryId) {
      console.log(`  ⚠️  Skipping service "${svc.title}" — category "${svc.categorySlug}" not found`)
      continue
    }

    const { categorySlug, ...rest } = svc
    await seedIfNotExists(payload, {
      collection: 'services',
      uniqueField: 'slug',
      uniqueValue: svc.slug,
      data: {
        ...rest,
        category: categoryId,
      },
    })
  }
}

/**
 * Seeds 24 service areas from locations data.
 */
async function seedServiceAreas(payload: Payload): Promise<void> {
  const areas = getServiceAreas()

  for (const area of areas) {
    await seedIfNotExists(payload, {
      collection: 'service-areas',
      uniqueField: 'slug',
      uniqueValue: area.slug,
      data: area,
    })
  }
}

/**
 * Seeds 4 team members with certifications.
 * Skips photo upload (external URLs not available in CMS context).
 */
async function seedTeamMembers(payload: Payload): Promise<void> {
  const members = getTeamMembers()

  for (const member of members) {
    try {
      await seedIfNotExists(payload, {
        collection: 'team-members',
        uniqueField: 'name',
        uniqueValue: member.name,
        data: member,
      })
    } catch (err) {
      console.log(`  ⚠️  Could not seed team member "${member.name}": ${(err as Error).message}`)
    }
  }
}

/**
 * Seeds 5 reviews with isApproved: true and source: 'website'.
 */
async function seedReviews(payload: Payload): Promise<void> {
  const reviewList = getReviews()

  for (const review of reviewList) {
    await seedIfNotExists(payload, {
      collection: 'reviews',
      uniqueField: 'customerName',
      uniqueValue: review.customerName,
      data: review,
    })
  }
}

/**
 * Seeds 7 FAQs with richText answers.
 */
async function seedFaqs(payload: Payload): Promise<void> {
  const faqList = getFaqs()

  for (const faq of faqList) {
    await seedIfNotExists(payload, {
      collection: 'faqs',
      uniqueField: 'question',
      uniqueValue: faq.question,
      data: faq,
    })
  }
}

/**
 * Seeds 10 vehicle makes with nested models and supported services.
 * Uses the new inline models array structure.
 */
async function seedVehicleMakesAndModels(payload: Payload): Promise<void> {
  const makes = getVehicleMakes()

  for (const make of makes) {
    // Check if already exists
    const existing = await payload.find({
      collection: 'vehicle-makes' as any,
      where: { name: { equals: make.name } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      // Update existing with full data (logoUrl, models with services)
      await payload.update({
        collection: 'vehicle-makes' as any,
        id: existing.docs[0].id,
        data: {
          logoUrl: make.logoUrl,
          models: make.models,
          isActive: make.isActive,
          sortOrder: make.sortOrder,
        } as any,
      })
      console.log(`  🔄 Updated vehicle-makes (name=${make.name}) with full data`)
    } else {
      await payload.create({
        collection: 'vehicle-makes' as any,
        data: make as any,
      })
      console.log(`  ✅ Created vehicle-makes (name=${make.name})`)
    }
  }
}

/**
 * Seeds 9 gallery items with before/after images uploaded to media.
 */
async function seedGalleryItems(payload: Payload): Promise<void> {
  const items = getGalleryItems()

  // Upload unique gallery images (6 files: before-1/2/3, after-1/2/3)
  const mediaCache: Record<string, string | number> = {}

  for (const item of items) {
    try {
      // Check if gallery item already exists
      const existing = await payload.find({
        collection: 'gallery-items' as any,
        where: { title: { equals: item.title } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        console.log(`  ⏭  Skipped gallery-items (title=${item.title}) — already exists`)
        continue
      }

      // Upload before image (reuse if same path)
      const beforePath = path.resolve(seedDir, item.beforeImagePath)
      if (!mediaCache[item.beforeImagePath]) {
        mediaCache[item.beforeImagePath] = await uploadLocalFile(
          payload, beforePath, `Before: ${item.title}`,
        )
      }

      // Upload after image (reuse if same path)
      const afterPath = path.resolve(seedDir, item.afterImagePath)
      if (!mediaCache[item.afterImagePath]) {
        mediaCache[item.afterImagePath] = await uploadLocalFile(
          payload, afterPath, `After: ${item.title}`,
        )
      }

      await payload.create({
        collection: 'gallery-items' as any,
        data: {
          title: item.title,
          category: item.category,
          description: item.description,
          beforeImage: mediaCache[item.beforeImagePath],
          afterImage: mediaCache[item.afterImagePath],
          isActive: item.isActive,
          sortOrder: item.sortOrder,
        } as any,
      })
      console.log(`  ✅ Created gallery-items (title=${item.title})`)
    } catch (err) {
      console.log(`  ⚠️  Could not seed gallery item "${item.title}": ${(err as Error).message}`)
    }
  }
}

/**
 * Uploads service hero images and links them to existing service documents.
 */
async function seedServiceImages(payload: Payload): Promise<void> {
  const imagePaths = getServiceImagePaths()

  for (const [slug, relPath] of Object.entries(imagePaths)) {
    try {
      // Find the service
      const svc = await payload.find({
        collection: 'services' as any,
        where: { slug: { equals: slug } },
        limit: 1,
      })

      if (svc.docs.length === 0) {
        console.log(`  ⚠️  Service "${slug}" not found, skipping image`)
        continue
      }

      const doc = svc.docs[0] as any
      if (doc.heroImage) {
        console.log(`  ⏭  Service "${slug}" already has a hero image`)
        continue
      }

      const absPath = path.resolve(seedDir, relPath)
      const mediaId = await uploadLocalFile(payload, absPath, `${doc.title} — hero image`)

      await payload.update({
        collection: 'services' as any,
        id: doc.id,
        data: { heroImage: mediaId } as any,
      })
      console.log(`  ✅ Linked hero image to service "${slug}"`)
    } catch (err) {
      console.log(`  ⚠️  Could not upload image for "${slug}": ${(err as Error).message}`)
    }
  }
}

// When run via `payload run`, the default export is called automatically.
// When imported as a module (e.g. tests), only the named `seed` export is used.
export default seed

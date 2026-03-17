/**
 * Fix shared media references in gallery items.
 * Duplicates media records so each gallery item has its own unique before/after images.
 *
 * Run: npx tsx ./src/seed/fix-gallery-media.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'

async function fixGalleryMedia() {
  const payload = await getPayload({ config })

  console.log('🔧 Fixing shared gallery media...\n')

  const items = await payload.find({
    collection: 'gallery-items' as any,
    limit: 100,
    depth: 1,
    sort: 'sortOrder',
  })

  // Track which media IDs have already been "claimed" by a gallery item
  const claimedBefore = new Map<number | string, string>()
  const claimedAfter = new Map<number | string, string>()

  let duplicated = 0

  for (const item of items.docs) {
    const title = item.title as string
    const beforeMedia = item.beforeImage as Record<string, unknown> | null
    const afterMedia = item.afterImage as Record<string, unknown> | null

    if (!beforeMedia || !afterMedia) {
      console.log(`  ⚠️  ${title} — missing before/after image, skipping`)
      continue
    }

    const beforeId = beforeMedia.id as number | string
    const afterId = afterMedia.id as number | string

    let newBeforeId = beforeId
    let newAfterId = afterId

    // Check if this before image is already claimed by another item
    if (claimedBefore.has(beforeId)) {
      console.log(`  🔄 ${title} — duplicating before image (shared with "${claimedBefore.get(beforeId)}")`)
      newBeforeId = await duplicateMedia(payload, beforeMedia, `Before: ${title}`)
      duplicated++
    } else {
      claimedBefore.set(beforeId, title)
    }

    // Check if this after image is already claimed by another item
    if (claimedAfter.has(afterId)) {
      console.log(`  🔄 ${title} — duplicating after image (shared with "${claimedAfter.get(afterId)}")`)
      newAfterId = await duplicateMedia(payload, afterMedia, `After: ${title}`)
      duplicated++
    } else {
      claimedAfter.set(afterId, title)
    }

    // Update the gallery item if any media was duplicated
    if (newBeforeId !== beforeId || newAfterId !== afterId) {
      await payload.update({
        collection: 'gallery-items' as any,
        id: item.id,
        data: {
          beforeImage: newBeforeId,
          afterImage: newAfterId,
        } as any,
      })
      console.log(`  ✅ ${title} — updated to use unique media`)
    } else {
      console.log(`  ✓  ${title} — already unique`)
    }
  }

  console.log(`\n🎉 Done! Duplicated ${duplicated} shared media files.`)
  process.exit(0)
}

async function duplicateMedia(
  payload: any,
  originalMedia: Record<string, unknown>,
  newAlt: string,
): Promise<number | string> {
  const filename = originalMedia.filename as string
  const url = originalMedia.url as string

  // Try to read the file from disk (local storage)
  const mediaDir = path.resolve(process.cwd(), 'media')
  const filePath = path.join(mediaDir, filename)

  if (!fs.existsSync(filePath)) {
    console.log(`    ⚠️  File not found on disk: ${filePath}, creating reference-only copy`)
    // Create a new media record pointing to the same file but as a separate document
    // This won't work perfectly for local storage, but for S3 it would
    const newDoc = await payload.create({
      collection: 'media' as any,
      data: {
        alt: newAlt,
        caption: (originalMedia.caption as string) || '',
        mediaCategory: 'gallery',
      } as any,
      file: {
        data: fs.readFileSync(filePath.replace(filename, filename)),
        name: `copy-${Date.now()}-${filename}`,
        mimetype: (originalMedia.mimeType as string) || 'image/jpeg',
        size: (originalMedia.filesize as number) || 0,
      },
    })
    return newDoc.id as number | string
  }

  const data = fs.readFileSync(filePath)
  const ext = path.extname(filename)
  const baseName = path.basename(filename, ext)
  const newFilename = `${baseName}-${Date.now()}${ext}`

  const newDoc = await payload.create({
    collection: 'media' as any,
    data: {
      alt: newAlt,
      caption: (originalMedia.caption as string) || '',
      mediaCategory: 'gallery',
    } as any,
    file: {
      data,
      name: newFilename,
      mimetype: (originalMedia.mimeType as string) || 'image/jpeg',
      size: data.length,
    },
  })

  console.log(`    📄 Created new media: ${newFilename} (id=${newDoc.id})`)
  return newDoc.id as number | string
}

fixGalleryMedia().catch((err) => {
  console.error('❌ Fix failed:', err)
  process.exit(1)
})

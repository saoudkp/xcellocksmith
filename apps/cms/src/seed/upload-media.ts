/**
 * Uploads local image files to the Payload Media collection.
 * Skips files that already exist (matched by filename).
 */
import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

/**
 * Uploads a single local file to the media collection.
 * Returns the media document ID, or the existing ID if already uploaded.
 */
export async function uploadLocalFile(
  payload: Payload,
  filePath: string,
  alt: string,
): Promise<string | number> {
  const filename = path.basename(filePath)

  // Check if already uploaded
  const existing = await payload.find({
    collection: 'media' as any,
    where: { filename: { equals: filename } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    console.log(`  ⏭  Media "${filename}" already exists`)
    return existing.docs[0].id as string | number
  }

  const ext = path.extname(filePath).toLowerCase()
  const mimeType = MIME_MAP[ext] || 'image/jpeg'
  const data = fs.readFileSync(filePath)

  const doc = await payload.create({
    collection: 'media' as any,
    data: { alt },
    file: {
      data,
      name: filename,
      mimetype: mimeType,
      size: data.length,
    },
  })

  console.log(`  ✅ Uploaded media "${filename}"`)
  return doc.id as string | number
}

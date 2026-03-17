// compress-media.mjs
// Compresses all images in the media folder that exceed 2MB
// Run with: node compress-media.mjs

import sharp from 'sharp'
import { readdir, stat, rename } from 'fs/promises'
import { join, extname } from 'path'

const MEDIA_DIR = './media'
const MAX_BYTES = 2 * 1024 * 1024 // 2MB

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp'])

async function compressImage(filePath, ext, originalSize) {
  const tmpPath = filePath + '.tmp'

  // Start with quality 85, reduce until under 2MB
  let quality = 85
  let success = false

  while (quality >= 40) {
    let pipeline = sharp(filePath)

    if (ext === '.png') {
      // PNG: convert to webp for better compression, or use png compression
      pipeline = pipeline.png({ quality, compressionLevel: 9 })
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality })
    } else {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true })
    }

    await pipeline.toFile(tmpPath)

    const { size } = await stat(tmpPath)
    if (size <= MAX_BYTES) {
      await rename(tmpPath, filePath)
      console.log(`  ✓ ${filePath.split('/').pop()} | ${(originalSize/1024/1024).toFixed(2)}MB → ${(size/1024/1024).toFixed(2)}MB (quality ${quality})`)
      success = true
      break
    }

    quality -= 10
  }

  if (!success) {
    // Last resort: resize down to max 1920px wide
    let pipeline = sharp(filePath).resize({ width: 1920, withoutEnlargement: true })
    if (ext === '.png') pipeline = pipeline.png({ quality: 60, compressionLevel: 9 })
    else if (ext === '.webp') pipeline = pipeline.webp({ quality: 60 })
    else pipeline = pipeline.jpeg({ quality: 60, mozjpeg: true })

    await pipeline.toFile(tmpPath)
    const { size } = await stat(tmpPath)
    await rename(tmpPath, filePath)
    console.log(`  ✓ ${filePath.split('/').pop()} | ${(originalSize/1024/1024).toFixed(2)}MB → ${(size/1024/1024).toFixed(2)}MB (resized + quality 60)`)
  }
}

async function main() {
  const files = await readdir(MEDIA_DIR)
  let processed = 0

  for (const file of files) {
    const ext = extname(file).toLowerCase()
    if (!SUPPORTED.has(ext)) continue

    const filePath = join(MEDIA_DIR, file)
    const { size } = await stat(filePath)

    if (size > MAX_BYTES) {
      console.log(`Compressing: ${file} (${(size/1024/1024).toFixed(2)}MB)`)
      await compressImage(filePath, ext, size)
      processed++
    }
  }

  if (processed === 0) {
    console.log('All images are already under 2MB.')
  } else {
    console.log(`\nDone. Compressed ${processed} image(s).`)
  }
}

main().catch(console.error)

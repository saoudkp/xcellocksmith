import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'

async function fix() {
  const payload = await getPayload({ config })
  const mediaDir = path.resolve(process.cwd(), 'media')

  // Find all media where the file doesn't exist on disk
  const all = await payload.find({ collection: 'media' as any, limit: 200, depth: 0 })
  
  let fixed = 0
  for (const doc of all.docs) {
    const filename = (doc as any).filename as string
    if (!filename) continue
    
    const filePath = path.join(mediaDir, filename)
    if (fs.existsSync(filePath)) continue

    console.log(`\n🔧 Broken: id=${doc.id} | ${filename}`)
    
    // Try to find the original file this was copied from
    // The pattern is: originalname-timestamp.ext
    // Extract the original name by removing the timestamp
    const ext = path.extname(filename)
    const base = path.basename(filename, ext)
    // Remove the timestamp suffix (last part after the last dash that's all digits)
    const parts = base.split('-')
    // Find where the timestamp starts (a long number at the end)
    let origBase = base
    for (let i = parts.length - 1; i >= 0; i--) {
      if (/^\d{10,}$/.test(parts[i])) {
        origBase = parts.slice(0, i).join('-')
        break
      }
    }
    
    const origFile = path.join(mediaDir, `${origBase}${ext}`)
    console.log(`  Looking for original: ${origBase}${ext}`)
    
    if (!fs.existsSync(origFile)) {
      console.log(`  ❌ Original not found either, deleting broken record`)
      // Delete the broken media and update any gallery items pointing to it
      // Find the original media by the base name
      const origMedia = await payload.find({
        collection: 'media' as any,
        where: { filename: { equals: `${origBase}${ext}` } },
        limit: 1,
        depth: 0,
      })
      
      if (origMedia.docs.length > 0) {
        const origId = origMedia.docs[0].id
        console.log(`  Found original media id=${origId}, updating gallery items...`)
        
        // Update gallery items that reference the broken media
        const galleries = await payload.find({ collection: 'gallery-items' as any, limit: 100, depth: 0 })
        for (const g of galleries.docs) {
          const updates: Record<string, unknown> = {}
          if (g.beforeImage === doc.id) updates.beforeImage = origId
          if (g.afterImage === doc.id) updates.afterImage = origId
          if (Object.keys(updates).length > 0) {
            await payload.update({ collection: 'gallery-items' as any, id: g.id, data: updates as any })
            console.log(`  ✅ Updated gallery item "${g.title}" to use original media`)
          }
        }
      }
      
      // Delete the broken media record
      await payload.delete({ collection: 'media' as any, id: doc.id })
      console.log(`  🗑️  Deleted broken media id=${doc.id}`)
      fixed++
      continue
    }
    
    // Copy the original file with the expected filename
    console.log(`  📄 Copying ${origBase}${ext} → ${filename}`)
    fs.copyFileSync(origFile, filePath)
    
    // Also copy thumbnail variants
    for (const suffix of ['-300x300', '-600x400', '-1200x600', '-1200x630']) {
      const origVariant = path.join(mediaDir, `${origBase}${suffix}${ext}`)
      const newVariant = path.join(mediaDir, `${base}${suffix}${ext}`)
      if (fs.existsSync(origVariant) && !fs.existsSync(newVariant)) {
        fs.copyFileSync(origVariant, newVariant)
        console.log(`  📄 Copied variant ${base}${suffix}${ext}`)
      }
    }
    fixed++
  }

  console.log(`\n🎉 Fixed ${fixed} broken media files`)
  process.exit(0)
}

fix().catch(e => { console.error(e); process.exit(1) })

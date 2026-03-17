import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'

async function check() {
  const payload = await getPayload({ config })
  const mediaDir = path.resolve(process.cwd(), 'media')
  
  // Check all duplicated media (ids 40-50)
  const r = await payload.find({ collection: 'media' as any, where: { id: { greater_than: 39 } }, limit: 20, depth: 0 })
  
  console.log('\n📸 Duplicated media check:')
  for (const d of r.docs) {
    const filename = (d as any).filename as string
    const exists = fs.existsSync(path.join(mediaDir, filename))
    console.log(`  id=${d.id} | ${filename} | exists=${exists}`)
  }
  process.exit(0)
}
check()

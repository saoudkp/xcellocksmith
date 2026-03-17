// sync-media-sizes.mjs
// Updates the filesize (and dimensions) in the DB to match the actual files on disk.
// Run with: node sync-media-sizes.mjs

import { stat } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import pg from 'pg'
import { readFileSync } from 'fs'

// Manually parse .env
const envFile = readFileSync('.env', 'utf8')
for (const line of envFile.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx).trim()
  const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
  process.env[key] = val
}

const { Client } = pg
const MEDIA_DIR = './media'

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// Fetch all media records that have a filename
const { rows } = await client.query(
  `SELECT id, filename, filesize, width, height FROM media WHERE filename IS NOT NULL`
)

console.log(`Checking ${rows.length} media records...\n`)

let updated = 0

for (const row of rows) {
  const filePath = join(MEDIA_DIR, row.filename)

  let fileStat
  try {
    fileStat = await stat(filePath)
  } catch {
    // file not on local disk (e.g. stored in S3), skip
    continue
  }

  const actualSize = fileStat.size

  // Get actual dimensions
  let width = row.width
  let height = row.height
  try {
    const meta = await sharp(filePath).metadata()
    width = meta.width ?? row.width
    height = meta.height ?? row.height
  } catch {
    // not an image (e.g. PDF), skip dimensions
  }

  const sizeChanged = actualSize !== row.filesize
  const dimsChanged = width !== row.width || height !== row.height

  if (sizeChanged || dimsChanged) {
    await client.query(
      `UPDATE media SET filesize = $1, width = $2, height = $3 WHERE id = $4`,
      [actualSize, width, height, row.id]
    )
    console.log(
      `Updated: ${row.filename}\n` +
      `  filesize: ${(row.filesize / 1024 / 1024).toFixed(2)}MB → ${(actualSize / 1024 / 1024).toFixed(2)}MB` +
      (dimsChanged ? `\n  dims: ${row.width}x${row.height} → ${width}x${height}` : '')
    )
    updated++
  }
}

await client.end()
console.log(`\nDone. Updated ${updated} record(s).`)

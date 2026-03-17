/**
 * Seed runner for Payload CLI.
 *
 * Usage (from apps/cms directory):
 *   node node_modules/payload/bin.js run ./seed.ts
 */
import { seed } from './src/seed/index'

await seed()
process.exit(0)

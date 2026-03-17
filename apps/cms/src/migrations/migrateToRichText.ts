/**
 * Migration script: convert existing plain-text section headings to Lexical
 * rich-text format and initialise the draft/publish workflow fields.
 *
 * Can be run standalone via the Payload CLI:
 *   node node_modules/payload/bin.js run ./src/migrations/migrateToRichText.ts
 *
 * Or imported and called programmatically:
 *   import { migrateToRichText } from './migrations/migrateToRichText'
 *   await migrateToRichText(payload)
 *
 * @see Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 5.5, 5.6
 */

import type { Payload } from 'payload'
import { plainTextToLexical, markAccentedWord } from '../utils/lexicalHelpers'
import type { RichTextSectionHeading } from '../types/sectionEditor'

// ---------------------------------------------------------------------------
// Section group keys in sections-settings that need migration
// ---------------------------------------------------------------------------

const SECTION_GROUPS = [
  'reviews',
  'gallery',
  'quote',
  'vehicleVerifier',
  'team',
  'serviceArea',
  'faq',
  'contact',
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SectionGroupData {
  heading?: string
  subheading?: string
  headingAccent?: string
  publishedData?: unknown
  draftData?: unknown
  status?: string
  [key: string]: unknown
}

/**
 * Build a `RichTextSectionHeading` from plain-text heading, subheading,
 * and an optional accented word.
 */
function buildRichTextHeading(
  heading: string | undefined,
  subheading: string | undefined,
  accentWord?: string,
): RichTextSectionHeading {
  let headingJson = heading ? plainTextToLexical(heading) : null
  const subheadingJson = subheading ? plainTextToLexical(subheading) : null

  // If an accent word is specified, mark it in the heading
  let accentJson = null
  if (accentWord && headingJson) {
    headingJson = markAccentedWord(headingJson, accentWord, {
      fontWeight: 'bold',
    })
    accentJson = plainTextToLexical(accentWord, { fontWeight: 'bold' } as { color?: string; font?: string })
  }

  return { heading: headingJson, subheading: subheadingJson, accent: accentJson }
}

// ---------------------------------------------------------------------------
// Sections-settings migration
// ---------------------------------------------------------------------------

async function migrateSectionsSettings(payload: Payload): Promise<void> {
  payload.logger.info('📄 Reading sections-settings global...')

  const sectionsData = (await payload.findGlobal({ slug: 'sections-settings' })) as unknown as Record<string, unknown>

  const updates: Record<string, unknown> = {}
  let migrated = 0
  let skipped = 0

  for (const groupKey of SECTION_GROUPS) {
    const group = sectionsData[groupKey] as SectionGroupData | undefined
    if (!group) {
      payload.logger.info(`  ⏭  ${groupKey}: group not found — skipping`)
      skipped++
      continue
    }

    // Skip if already migrated (publishedData already set)
    if (group.publishedData) {
      payload.logger.info(`  ⏭  ${groupKey}: already migrated — skipping`)
      skipped++
      continue
    }

    try {
      const richHeading = buildRichTextHeading(
        group.heading,
        group.subheading,
        group.headingAccent,
      )

      // Preserve all existing field values, only add rich text + publish fields
      updates[groupKey] = {
        ...group,
        publishedData: richHeading,
        draftData: null,
        status: 'published',
      }

      migrated++
      payload.logger.info(`  ✅ ${groupKey}: migrated heading="${group.heading ?? ''}"`)
    } catch (error) {
      // Requirement 8.5: log error and retain original values
      payload.logger.error(
        `  ❌ ${groupKey}: migration failed — retaining original values. Error: ${String(error)}`,
      )
      skipped++
    }
  }

  if (migrated > 0) {
    payload.logger.info(`💾 Saving sections-settings (${migrated} migrated, ${skipped} skipped)...`)
    await payload.updateGlobal({
      slug: 'sections-settings',
      data: updates,
    })
    payload.logger.info('  ✅ sections-settings saved')
  } else {
    payload.logger.info('  ℹ️  No sections-settings groups needed migration')
  }
}

// ---------------------------------------------------------------------------
// Services-settings migration
// ---------------------------------------------------------------------------

async function migrateServicesSettings(payload: Payload): Promise<void> {
  payload.logger.info('📄 Reading services-settings global...')

  const servicesData = (await payload.findGlobal({ slug: 'services-settings' })) as unknown as Record<string, unknown>
  const sectionHeader = servicesData.sectionHeader as SectionGroupData | undefined

  if (!sectionHeader) {
    payload.logger.info('  ⏭  sectionHeader: group not found — skipping')
    return
  }

  // Skip if already migrated
  if (sectionHeader.publishedData) {
    payload.logger.info('  ⏭  sectionHeader: already migrated — skipping')
    return
  }

  try {
    const richHeading = buildRichTextHeading(
      sectionHeader.heading,
      sectionHeader.description as string | undefined, // Services uses "description" instead of "subheading"
      sectionHeader.headingAccent as string | undefined,
    )

    const updatedHeader: Record<string, unknown> = {
      ...sectionHeader,
      publishedData: richHeading,
      draftData: null,
      status: 'published',
    }

    payload.logger.info('💾 Saving services-settings...')
    await payload.updateGlobal({
      slug: 'services-settings',
      data: { sectionHeader: updatedHeader },
    })
    payload.logger.info(
      `  ✅ sectionHeader: migrated heading="${sectionHeader.heading ?? ''}" accent="${sectionHeader.headingAccent ?? ''}"`,
    )
  } catch (error) {
    // Requirement 8.5: log error and retain original values
    payload.logger.error(
      `  ❌ sectionHeader: migration failed — retaining original values. Error: ${String(error)}`,
    )
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run the full migration: convert all plain-text section headings to Lexical
 * rich-text format and initialise draft/publish fields.
 *
 * Safe to run multiple times — already-migrated sections are skipped.
 */
export async function migrateToRichText(payload: Payload): Promise<void> {
  payload.logger.info('🚀 Starting rich-text migration...\n')

  await migrateSectionsSettings(payload)
  payload.logger.info('')

  await migrateServicesSettings(payload)
  payload.logger.info('')

  payload.logger.info('🎉 Rich-text migration complete!')
}

// ---------------------------------------------------------------------------
// Standalone runner — executed via `payload run`
// ---------------------------------------------------------------------------

export default migrateToRichText

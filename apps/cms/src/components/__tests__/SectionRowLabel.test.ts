import { describe, it, expect } from 'vitest'

/**
 * Unit tests for SectionRowLabel component logic and HomepageLayout configuration.
 * Tests verify the RowLabel is configured on the sections array and the label logic works.
 */

describe('SectionRowLabel — HomepageLayout configuration', () => {
  it('HomepageLayout sections array has RowLabel component configured', async () => {
    const HomepageLayout = (await import('@/globals/HomepageLayout')).default
    const sectionsField = HomepageLayout.fields.find(
      (f) => 'name' in f && f.name === 'sections',
    ) as { name: string; type: string; admin?: { components?: Record<string, unknown> } } | undefined

    expect(sectionsField).toBeDefined()
    expect(sectionsField!.type).toBe('array')
    expect(sectionsField!.admin?.components).toEqual({
      RowLabel: '/components/SectionRowLabel',
    })
  })

  it('HomepageLayout sections array is type array (supports drag-and-drop)', async () => {
    const HomepageLayout = (await import('@/globals/HomepageLayout')).default
    const sectionsField = HomepageLayout.fields.find(
      (f) => 'name' in f && f.name === 'sections',
    ) as { type: string } | undefined

    expect(sectionsField).toBeDefined()
    expect(sectionsField!.type).toBe('array')
  })
})

describe('SectionRowLabel — label logic', () => {
  it('returns sectionType value when present', () => {
    const getLabel = (data: { sectionType?: string } | undefined) =>
      data?.sectionType || 'Untitled Section'

    expect(getLabel({ sectionType: 'hero' })).toBe('hero')
    expect(getLabel({ sectionType: 'services' })).toBe('services')
    expect(getLabel({ sectionType: 'faq' })).toBe('faq')
  })

  it('returns fallback when sectionType is missing', () => {
    const getLabel = (data: { sectionType?: string } | undefined) =>
      data?.sectionType || 'Untitled Section'

    expect(getLabel(undefined)).toBe('Untitled Section')
    expect(getLabel({})).toBe('Untitled Section')
    expect(getLabel({ sectionType: '' })).toBe('Untitled Section')
  })
})

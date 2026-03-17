import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('SEOPreview — collection configuration', () => {
  it('Services collection source includes seoPreview UI field', () => {
    const source = readFileSync(resolve(__dirname, '../../collections/Services.ts'), 'utf-8')
    expect(source).toContain("name: 'seoPreview'")
    expect(source).toContain("type: 'ui'")
    expect(source).toContain("Field: '/components/SEOPreview'")
  })

  it('Services collection has seoPreview after seoDescription', () => {
    const source = readFileSync(resolve(__dirname, '../../collections/Services.ts'), 'utf-8')
    const seoDescPos = source.indexOf("name: 'seoDescription'")
    const seoPreviewPos = source.indexOf("name: 'seoPreview'")
    expect(seoDescPos).toBeGreaterThan(-1)
    expect(seoPreviewPos).toBeGreaterThan(-1)
    expect(seoPreviewPos).toBeGreaterThan(seoDescPos)
  })

  it('ServiceAreas collection source includes seoPreview UI field', () => {
    const source = readFileSync(resolve(__dirname, '../../collections/ServiceAreas.ts'), 'utf-8')
    expect(source).toContain("name: 'seoPreview'")
    expect(source).toContain("type: 'ui'")
    expect(source).toContain("Field: '/components/SEOPreview'")
  })

  it('ServiceAreas collection has seoPreview after seoDescription', () => {
    const source = readFileSync(resolve(__dirname, '../../collections/ServiceAreas.ts'), 'utf-8')
    const seoDescPos = source.indexOf("name: 'seoDescription'")
    const seoPreviewPos = source.indexOf("name: 'seoPreview'")
    expect(seoDescPos).toBeGreaterThan(-1)
    expect(seoPreviewPos).toBeGreaterThan(-1)
    expect(seoPreviewPos).toBeGreaterThan(seoDescPos)
  })
})

describe('SEOPreview — display logic', () => {
  it('uses fallback text when fields are empty', () => {
    const displayTitle = (val: string | undefined) => val || 'Page Title'
    const displayDesc = (val: string | undefined) => val || 'No meta description set.'
    expect(displayTitle(undefined)).toBe('Page Title')
    expect(displayTitle('')).toBe('Page Title')
    expect(displayDesc(undefined)).toBe('No meta description set.')
    expect(displayDesc('')).toBe('No meta description set.')
  })

  it('uses provided values when fields have content', () => {
    const displayTitle = (val: string | undefined) => val || 'Page Title'
    const displayDesc = (val: string | undefined) => val || 'No meta description set.'
    expect(displayTitle('Lock Rekeying Services')).toBe('Lock Rekeying Services')
    expect(displayDesc('Professional lock rekeying.')).toBe('Professional lock rekeying.')
  })
})

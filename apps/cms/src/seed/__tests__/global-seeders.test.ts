import { describe, it, expect } from 'vitest'
import { getSiteSettings, getHomepageLayout, getNavigation } from '../data-mappers'
import { defaultBrand, defaultContact, defaultSections, defaultNavItems } from '../../../../../src/data/siteConfig'

describe('Global seeders', () => {
  describe('getSiteSettings', () => {
    it('maps businessName from defaultBrand.name', () => {
      const settings = getSiteSettings()
      expect(settings.businessName).toBe(defaultBrand.name)
    })

    it('maps tagline from defaultBrand.tagline', () => {
      const settings = getSiteSettings()
      expect(settings.tagline).toBe(defaultBrand.tagline)
    })

    it('maps phone from defaultContact.phoneDisplay', () => {
      const settings = getSiteSettings()
      expect(settings.phone).toBe(defaultContact.phoneDisplay)
    })

    it('maps email from defaultContact.email', () => {
      const settings = getSiteSettings()
      expect(settings.email).toBe(defaultContact.email)
    })

    it('parses address into city and state', () => {
      const settings = getSiteSettings()
      expect(settings.address.city).toBe('Cleveland')
      expect(settings.address.state).toBe('OH')
    })

    it('seeds hours as a single "Every Day" / "24/7/365" entry', () => {
      const settings = getSiteSettings()
      expect(settings.hours).toEqual([{ day: 'Every Day', hours: '24/7/365' }])
    })

    it('maps responseTime from defaultBrand.responseTime', () => {
      const settings = getSiteSettings()
      expect(settings.responseTime).toBe(defaultBrand.responseTime)
    })
  })

  describe('getHomepageLayout', () => {
    it('maps all sections from defaultSections', () => {
      const layout: any = getHomepageLayout()
      expect(layout.sections).toHaveLength(defaultSections.length)
    })

    it('maps sectionType from section type', () => {
      const layout: any = getHomepageLayout()
      defaultSections.forEach((s, i) => {
        expect(layout.sections[i].sectionType).toBe(s.type)
      })
    })

    it('maps heading and subheading with empty string defaults', () => {
      const layout: any = getHomepageLayout()
      layout.sections.forEach((s: any) => {
        expect(typeof s.heading).toBe('string')
        expect(typeof s.subheading).toBe('string')
      })
    })

    it('maps isActive and sortOrder', () => {
      const layout: any = getHomepageLayout()
      defaultSections.forEach((s, i) => {
        expect(layout.sections[i].isActive).toBe(s.isActive)
        expect(layout.sections[i].sortOrder).toBe(s.order)
      })
    })
  })

  describe('getNavigation', () => {
    it('maps all nav items from defaultNavItems', () => {
      const nav = getNavigation()
      expect(nav.items).toHaveLength(defaultNavItems.length)
    })

    it('maps label, href, isActive, and sortOrder', () => {
      const nav = getNavigation()
      defaultNavItems.forEach((n, i) => {
        expect(nav.items[i].label).toBe(n.label)
        expect(nav.items[i].href).toBe(n.href)
        expect(nav.items[i].isActive).toBe(n.isActive)
        expect(nav.items[i].sortOrder).toBe(n.order)
      })
    })
  })
})

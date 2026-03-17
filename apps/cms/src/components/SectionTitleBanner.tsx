'use client'

/**
 * SectionTitleBanner — Displays "Page Section Settings — {Section Name}"
 * as a styled title banner. Reads the current section from form state.
 */

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

const SECTION_LABELS: Record<string, string> = {
  services: 'Services',
  reviews: 'Reviews',
  gallery: 'Gallery',
  quote: 'Free Quote',
  vehicleVerifier: 'Vehicle Check',
  team: 'Our Team',
  serviceArea: 'Service Area',
  faq: 'FAQ',
  contact: 'Contact Us',
}

const SectionTitleBanner: React.FC = () => {
  const selectorField = useFormFields(([fields]) => fields._sectionSelector)
  const sectionKey = (selectorField?.value as string) || ''
  const label = SECTION_LABELS[sectionKey] || 'Section'

  return (
    <div
      style={{
        padding: '12px 16px',
        marginBottom: 16,
        background: 'var(--theme-elevation-100, #2a2a2a)',
        borderRadius: 8,
        borderLeft: '4px solid #3b82f6',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--theme-text, #fff)',
        }}
      >
        Page Section Settings — {label}
      </h3>
    </div>
  )
}

export default SectionTitleBanner

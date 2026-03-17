'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

const sectionLabels: Record<string, string> = {
  hero: 'Hero Banner',
  services: 'Services',
  reviews: 'Reviews',
  gallery: 'Before/After Gallery',
  quote: 'Get a Quote',
  'vehicle-verifier': 'Vehicle Checker',
  team: 'Our Team',
  map: 'Service Area Map',
  faq: 'FAQ',
  contact: 'Contact',
  'visitor-counter': 'Visitor Counter',
}

export const SectionRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ sectionType?: string; isActive?: boolean }>()

  const type = data?.sectionType || ''
  const label = sectionLabels[type] || type || 'Untitled Section'
  const active = data?.isActive !== false

  return (
    <span style={{ opacity: active ? 1 : 0.5 }}>
      {label}{!active && ' (hidden)'}
    </span>
  )
}

export default SectionRowLabel

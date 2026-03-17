'use client'

/**
 * LoadDefaultsButton — UI-only field that restores default heading/subheading
 * content for the currently selected section from sectionDefaults.json.
 */

import React, { useCallback, useState } from 'react'
import { useForm } from '@payloadcms/ui'

const SECTION_DEFAULTS: Record<string, { heading: string; subheading: string; headingAccent?: string }> = {
  services: {
    heading: 'Complete Locksmith Services',
    subheading: '29 professional locksmith services across residential, commercial & automotive — all backed by transparent pricing and our no-hidden-fees guarantee.',
    headingAccent: 'Services',
  },
  reviews: {
    heading: 'What Our Customers Say',
    subheading: 'Real reviews from real Cleveland area customers',
  },
  gallery: {
    heading: 'Before & After Gallery',
    subheading: 'Browse our work across residential, automotive & commercial locksmithing. Click a category to see all projects.',
  },
  quote: {
    heading: 'Get a Free Quote in Seconds',
    subheading: "Tell us what you need and we'll give you an upfront price — no surprises, no hidden fees.",
  },
  vehicleVerifier: {
    heading: 'Vehicle Compatibility Check',
    subheading: 'Select your vehicle make and model to verify which automotive locksmith services we support.',
  },
  team: {
    heading: 'Meet Our Expert Team',
    subheading: 'Licensed, certified, and background-checked professionals with decades of combined locksmith experience serving Cleveland and surrounding communities.',
  },
  serviceArea: {
    heading: 'Our Service Area',
    subheading: 'Serving Cleveland and 24 surrounding communities with fast 20–30 minute response times.',
  },
  faq: {
    heading: 'Frequently Asked Questions',
    subheading: "Get answers to the most common locksmith questions. Still have questions? Call us 24/7.",
  },
  contact: {
    heading: 'Get in Touch',
    subheading: "Reach us anytime — we're always just a call, text, or message away.",
  },
}

const LoadDefaultsButton: React.FC = () => {
  const { getFields, dispatchFields } = useForm()
  const [loaded, setLoaded] = useState(false)

  const handleClick = useCallback(() => {
    const fields = getFields()
    const selector = fields._sectionSelector?.value as string | undefined
    if (!selector) {
      alert('Please select a section first.')
      return
    }

    const defaults = SECTION_DEFAULTS[selector]
    if (!defaults) return

    // Determine field paths based on section
    const prefix = selector === 'services' ? 'services' : selector
    const headingPath = `${prefix}.heading`
    const subPath = selector === 'services' ? `${prefix}.description` : `${prefix}.subheading`

    dispatchFields({
      type: 'UPDATE',
      path: headingPath,
      value: defaults.heading,
    })
    dispatchFields({
      type: 'UPDATE',
      path: subPath,
      value: defaults.subheading,
    })

    if (selector === 'services' && defaults.headingAccent) {
      dispatchFields({
        type: 'UPDATE',
        path: 'services.headingAccent',
        value: defaults.headingAccent,
      })
    }

    setLoaded(true)
    setTimeout(() => setLoaded(false), 2000)
  }, [getFields, dispatchFields])

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        type="button"
        onClick={handleClick}
        style={{
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 6,
          cursor: 'pointer',
          border: '1px solid var(--theme-elevation-150, #555)',
          background: loaded
            ? 'var(--theme-success-500, #22c55e)'
            : 'var(--theme-elevation-100, #333)',
          color: 'var(--theme-text, #fff)',
          transition: 'background 0.2s',
        }}
      >
        {loaded ? '✓ Defaults Loaded' : '↻ Load Default Content'}
      </button>
    </div>
  )
}

export default LoadDefaultsButton

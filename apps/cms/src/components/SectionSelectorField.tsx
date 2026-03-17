'use client'

/**
 * SectionSelectorField — Dropdown for selecting which page section to edit.
 * Labels match navigation menu names.
 *
 * Reads ?section= from the URL to auto-select the correct section
 * when navigating from frontend "Edit" links. Uses a delayed effect
 * to ensure it overrides the DB-restored value after Payload hydration.
 */

import React, { useEffect, useRef } from 'react'
import { useField } from '@payloadcms/ui'

const SECTION_OPTIONS = [
  { label: '— Select a section —', value: '' },
  { label: 'Services', value: 'services' },
  { label: 'Reviews', value: 'reviews' },
  { label: 'Gallery', value: 'gallery' },
  { label: 'Free Quote', value: 'quote' },
  { label: 'Vehicle Check', value: 'vehicleVerifier' },
  { label: 'Our Team', value: 'team' },
  { label: 'Service Area', value: 'serviceArea' },
  { label: 'FAQ', value: 'faq' },
  { label: 'Contact Us', value: 'contact' },
]

type Props = { path: string }

const SectionSelectorField: React.FC<Props> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const hasAutoSelected = useRef(false)
  const urlSectionRef = useRef<string | null>(null)

  // Capture the URL param once on first render
  if (urlSectionRef.current === null) {
    try {
      const params = new URLSearchParams(window.location.search)
      urlSectionRef.current = params.get('section') || ''
    } catch {
      urlSectionRef.current = ''
    }
  }

  // Apply URL param after Payload form hydration — use delayed effect
  // to ensure it runs after the DB value is restored
  useEffect(() => {
    const sectionParam = urlSectionRef.current
    if (!sectionParam || hasAutoSelected.current) return
    if (!SECTION_OPTIONS.some((opt) => opt.value === sectionParam)) return

    // Delay to let Payload's form hydration complete first
    const timer = setTimeout(() => {
      hasAutoSelected.current = true
      setValue(sectionParam)
    }, 100)

    return () => clearTimeout(timer)
  }, [setValue])

  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: 'block',
          marginBottom: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--theme-text, #fff)',
        }}
      >
        Select Section to Edit
      </label>
      <p style={{ fontSize: 12, color: 'var(--theme-elevation-400, #999)', marginBottom: 8, marginTop: 0 }}>
        Choose which page section to edit — labels match your navigation menu.
      </p>
      <select
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '8px 12px',
          fontSize: 14,
          borderRadius: 6,
          border: '1px solid var(--theme-elevation-150, #555)',
          background: 'var(--theme-elevation-100, #333)',
          color: 'var(--theme-text, #fff)',
          cursor: 'pointer',
        }}
      >
        {SECTION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SectionSelectorField

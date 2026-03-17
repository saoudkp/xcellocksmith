'use client'

import React from 'react'

/**
 * Describes a selectable section option in the dropdown.
 *
 * - `key`    — internal identifier matching the group name in the Payload global
 *              (e.g. `"reviews"`, `"services"`)
 * - `label`  — user-friendly display name shown in the dropdown
 * - `global` — the Payload global slug that stores this section's data
 */
export interface SectionOption {
  key: string
  label: string
  global: 'sections-settings' | 'services-settings'
}

/**
 * All selectable sections.
 *
 * The first eight come from the `SectionsSettings` global; the last entry
 * (`services`) is sourced from the separate `ServicesSettings` global.
 *
 * @see Requirements 1.1, 1.2, 1.4, 6.1
 */
export const SECTION_OPTIONS: SectionOption[] = [
  { key: 'reviews', label: 'Reviews Section', global: 'sections-settings' },
  { key: 'gallery', label: 'Gallery Section', global: 'sections-settings' },
  { key: 'quote', label: 'Quote Section', global: 'sections-settings' },
  { key: 'vehicleVerifier', label: 'Vehicle Compatibility Section', global: 'sections-settings' },
  { key: 'team', label: 'Team Section', global: 'sections-settings' },
  { key: 'serviceArea', label: 'Service Area Section', global: 'sections-settings' },
  { key: 'faq', label: 'FAQ Section', global: 'sections-settings' },
  { key: 'contact', label: 'Contact Section', global: 'sections-settings' },
  { key: 'services', label: 'Services Section', global: 'services-settings' },
]

export interface SectionSelectorProps {
  /** Currently selected section key (controlled). */
  value: string
  /** Callback fired when the user picks a different section. */
  onChange: (option: SectionOption) => void
}

/**
 * Dropdown selector for choosing which section heading to edit.
 *
 * Renders all `SectionsSettings` groups plus the `ServicesSettings`
 * entry in a single `<select>`.  The parent component owns the
 * selected-section state and receives updates via `onChange`.
 *
 * @see Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 6.1
 */
const SectionSelector: React.FC<SectionSelectorProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = SECTION_OPTIONS.find((o) => o.key === e.target.value)
    if (selected) {
      onChange(selected)
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor="section-selector"
        style={{
          display: 'block',
          marginBottom: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--theme-text, #fff)',
        }}
      >
        Section
      </label>
      <select
        id="section-selector"
        value={value}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 14,
          borderRadius: 4,
          border: '1px solid var(--theme-elevation-150, #555)',
          background: 'var(--theme-elevation-50, #222)',
          color: 'var(--theme-text, #fff)',
          cursor: 'pointer',
        }}
      >
        {SECTION_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SectionSelector

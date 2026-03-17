'use client'

import React, { useState, useCallback } from 'react'
import { useField } from '@payloadcms/ui'

const presetColors = [
  { label: 'White', value: '#ffffff' },
  { label: 'Light Gray', value: '#d1d5db' },
  { label: 'Gray', value: '#9ca3af' },
  { label: 'Dark Gray', value: '#4b5563' },
  { label: 'Black', value: '#000000' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Yellow', value: '#facc15' },
  { label: 'Lime', value: '#84cc16' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Sky', value: '#0ea5e9' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Fuchsia', value: '#d946ef' },
  { label: 'Pink', value: '#ec4899' },
]

type Props = { path: string }

const ColorPickerField: React.FC<Props> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const [customHex, setCustomHex] = useState('')

  const handleCustom = useCallback(() => {
    const hex = customHex.startsWith('#') ? customHex : `#${customHex}`
    if (/^#[0-9a-fA-F]{3,8}$/.test(hex)) {
      setValue(hex)
      setCustomHex('')
    }
  }, [customHex, setValue])

  const current = value || '#ffffff'

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: current,
          border: '2px solid var(--theme-elevation-150, #ccc)',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, color: 'var(--theme-elevation-500, #888)', fontFamily: 'monospace' }}>
          {current}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {presetColors.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            onClick={() => setValue(c.value)}
            style={{
              width: 28, height: 28, borderRadius: 4,
              background: c.value,
              border: current === c.value ? '2px solid var(--theme-text, #fff)' : '1px solid var(--theme-elevation-150, #555)',
              cursor: 'pointer',
              outline: current === c.value ? '2px solid var(--theme-elevation-500, #888)' : 'none',
              outlineOffset: 1,
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'scale(1.15)' }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="color"
          value={current}
          onChange={(e) => setValue(e.target.value)}
          style={{ width: 36, height: 28, padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}
          title="Open system color picker"
        />
        <input
          type="text"
          placeholder="#hex"
          value={customHex}
          onChange={(e) => setCustomHex(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCustom() } }}
          style={{
            width: 90, padding: '4px 8px', fontSize: 12, fontFamily: 'monospace',
            border: '1px solid var(--theme-elevation-150, #555)',
            borderRadius: 4, background: 'var(--theme-elevation-50, #222)',
            color: 'var(--theme-text, #fff)',
          }}
        />
        <button type="button" onClick={handleCustom} style={{
          padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
          background: 'var(--theme-elevation-100, #333)', color: 'var(--theme-text, #fff)',
          border: '1px solid var(--theme-elevation-150, #555)',
        }}>
          Apply
        </button>
      </div>
    </div>
  )
}

export default ColorPickerField

'use client'

/**
 * RestoreSettingsPanel — UI component for Default Settings global.
 *
 * Two actions:
 * 1. "Restore Default Content" — resets all section headings to sectionDefaults.json
 * 2. "Restore Previous Settings" — reverts to the last saved snapshot
 *
 * Both show a confirmation dialog before proceeding.
 */

import React, { useCallback, useState } from 'react'

const CMS_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000'

const SECTION_DEFAULTS: Record<string, Record<string, string>> = {
  services: {
    heading: 'Complete Locksmith Services',
    description: '29 professional locksmith services across residential, commercial & automotive — all backed by transparent pricing and our no-hidden-fees guarantee.',
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

type Status = 'idle' | 'confirming-defaults' | 'confirming-previous' | 'loading' | 'success' | 'error'

const RestoreSettingsPanel: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const fetchJson = async (url: string, opts?: RequestInit) => {
    const res = await fetch(url, { credentials: 'include', ...opts })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  const restoreDefaults = useCallback(async () => {
    setStatus('loading')
    try {
      // 1. Snapshot current state before overwriting
      const current = await fetchJson(`${CMS_URL}/api/globals/sections-settings`)

      // Save snapshot to default-settings global
      await fetchJson(`${CMS_URL}/api/globals/default-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _previousSnapshot: current }),
      })

      // 2. Build the defaults payload
      const body: Record<string, unknown> = {}
      for (const [key, vals] of Object.entries(SECTION_DEFAULTS)) {
        body[key] = { ...vals, richHeading: null, richSubheading: null, richAccent: null, richDescription: null }
      }

      // 3. Apply defaults
      await fetchJson(`${CMS_URL}/api/globals/sections-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      setStatus('success')
      setMessage('All section headings restored to defaults. Your previous settings have been saved.')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setMessage(`Failed to restore defaults: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setTimeout(() => setStatus('idle'), 4000)
    }
  }, [])

  const restorePrevious = useCallback(async () => {
    setStatus('loading')
    try {
      // 1. Fetch the saved snapshot
      const defaultSettings = await fetchJson(`${CMS_URL}/api/globals/default-settings`)
      const snapshot = defaultSettings._previousSnapshot

      if (!snapshot || typeof snapshot !== 'object') {
        setStatus('error')
        setMessage('No previous settings found. You need to have restored defaults at least once.')
        setTimeout(() => setStatus('idle'), 4000)
        return
      }

      // 2. Apply the snapshot back to sections-settings
      const { id, globalType, createdAt, updatedAt, _sectionSelector, ...sectionData } = snapshot as Record<string, unknown>
      await fetchJson(`${CMS_URL}/api/globals/sections-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionData),
      })

      setStatus('success')
      setMessage('Previous settings restored successfully.')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setMessage(`Failed to restore previous settings: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setTimeout(() => setStatus('idle'), 4000)
    }
  }, [])

  const containerStyle: React.CSSProperties = {
    padding: 24,
    maxWidth: 600,
  }

  const cardStyle: React.CSSProperties = {
    padding: 20,
    marginBottom: 16,
    background: 'var(--theme-elevation-50, #1a1a1a)',
    border: '1px solid var(--theme-elevation-150, #555)',
    borderRadius: 8,
  }

  const btnBase: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 6,
    cursor: 'pointer',
    border: 'none',
    transition: 'background 0.2s, opacity 0.2s',
  }

  const isLoading = status === 'loading'

  // Confirmation dialog
  if (status === 'confirming-defaults' || status === 'confirming-previous') {
    const isDefaults = status === 'confirming-defaults'
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, borderColor: '#ef4444' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
            ⚠️ Are you sure?
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--theme-elevation-400, #999)', lineHeight: 1.6 }}>
            {isDefaults
              ? 'This will reset ALL section headings and subheadings to their original default text. Your current edits will be saved as a snapshot so you can restore them later.'
              : 'This will revert all section headings and subheadings to the state they were in before the last default restore. You will lose any edits made after that restore.'}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={isDefaults ? restoreDefaults : restorePrevious}
              style={{ ...btnBase, background: '#ef4444', color: '#fff' }}
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              style={{ ...btnBase, background: 'var(--theme-elevation-100, #333)', color: 'var(--theme-text, #fff)', border: '1px solid var(--theme-elevation-150, #555)' }}
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--theme-elevation-400, #999)', lineHeight: 1.5 }}>
        Manage your section settings. Restore to factory defaults or revert to your previous saved state.
      </p>

      {/* Restore Defaults */}
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: 'var(--theme-text, #fff)' }}>
          Restore Default Content
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--theme-elevation-400, #999)' }}>
          Reset all section headings and subheadings to their original default text. Your current settings will be saved as a snapshot first.
        </p>
        <button
          type="button"
          onClick={() => setStatus('confirming-defaults')}
          disabled={isLoading}
          style={{ ...btnBase, background: '#3b82f6', color: '#fff', opacity: isLoading ? 0.5 : 1 }}
        >
          {isLoading ? 'Restoring…' : '↻ Restore Default Content'}
        </button>
      </div>

      {/* Restore Previous */}
      <div style={cardStyle}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: 'var(--theme-text, #fff)' }}>
          Restore Previous Settings
        </h4>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--theme-elevation-400, #999)' }}>
          Revert to the settings saved before the last default restore. Use this to recover your previous edits.
        </p>
        <button
          type="button"
          onClick={() => setStatus('confirming-previous')}
          disabled={isLoading}
          style={{ ...btnBase, background: 'var(--theme-elevation-100, #333)', color: 'var(--theme-text, #fff)', border: '1px solid var(--theme-elevation-150, #555)', opacity: isLoading ? 0.5 : 1 }}
        >
          {isLoading ? 'Restoring…' : '⏪ Restore Previous Settings'}
        </button>
      </div>

      {/* Status message */}
      {(status === 'success' || status === 'error') && (
        <div style={{
          padding: '10px 16px',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          background: status === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: status === 'success' ? '#22c55e' : '#ef4444',
          border: `1px solid ${status === 'success' ? '#22c55e' : '#ef4444'}`,
        }}>
          {message}
        </div>
      )}
    </div>
  )
}

export default RestoreSettingsPanel

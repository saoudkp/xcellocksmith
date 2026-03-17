'use client'

/**
 * WysiwygField — Gutenberg-style WYSIWYG custom field for Payload CMS.
 *
 * Renders a visible title label, toolbar (Bold, Italic, Underline, Color, Font,
 * Accent) and a contentEditable area. Stores content as JSON `{ html, text }`.
 *
 * When the editor has no saved content it auto-populates from the sibling
 * plain-text field (e.g. richHeading reads from heading) so the current
 * frontend text is always visible on first load.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'

// ---------------------------------------------------------------------------
// Preset colors & fonts
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  '#ffffff', '#d1d5db', '#9ca3af', '#4b5563', '#000000',
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6',
  '#8b5cf6', '#a855f7', '#ec4899', '#06b6d4', '#14b8a6',
]

const FONT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Display', value: 'Georgia, serif' },
  { label: 'Sans', value: 'Inter, system-ui, sans-serif' },
  { label: 'Mono', value: 'Courier New, monospace' },
  { label: 'Playfair Display', value: 'Playfair Display, serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Raleway', value: 'Raleway, sans-serif' },
  { label: 'Oswald', value: 'Oswald, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Lora', value: 'Lora, serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Roboto Slab', value: 'Roboto Slab, serif' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
  { label: 'Quicksand', value: 'Quicksand, sans-serif' },
  { label: 'Bebas Neue', value: 'Bebas Neue, sans-serif' },
  { label: 'Crimson Text', value: 'Crimson Text, serif' },
  { label: 'DM Sans', value: 'DM Sans, sans-serif' },
  { label: 'Space Grotesk', value: 'Space Grotesk, sans-serif' },
]

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@400;600;700&family=Raleway:wght@400;600;700&family=Oswald:wght@400;600;700&family=Poppins:wght@400;600;700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Roboto+Slab:wght@400;700&family=Nunito:wght@400;600;700&family=Quicksand:wght@400;600;700&family=Bebas+Neue&family=Crimson+Text:wght@400;700&family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap'

// ---------------------------------------------------------------------------
// Sibling fallback map: richText field → plain-text sibling
// ---------------------------------------------------------------------------

const FALLBACK_MAP: Record<string, string> = {
  richHeading: 'heading',
  richSubheading: 'subheading',
  richAccent: 'headingAccent',
  richDescription: 'description',
}

function getFallbackPath(path: string): string | null {
  const parts = path.split('.')
  const fieldName = parts[parts.length - 1]
  const siblingName = FALLBACK_MAP[fieldName]
  if (!siblingName) return null
  return [...parts.slice(0, -1), siblingName].join('.')
}

// Friendly title map
const TITLE_MAP: Record<string, string> = {
  richHeading: 'Heading',
  richSubheading: 'Subheading',
  richAccent: 'Accented Word',
  richDescription: 'Description',
}

// ---------------------------------------------------------------------------
// Toolbar button style
// ---------------------------------------------------------------------------

const btn: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 4,
  cursor: 'pointer',
  border: '1px solid var(--theme-elevation-150, #555)',
  background: 'var(--theme-elevation-100, #333)',
  color: 'var(--theme-text, #fff)',
  lineHeight: 1.4,
  minWidth: 28,
  textAlign: 'center' as const,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = { path: string; label?: string }

const WysiwygField: React.FC<Props> = ({ path, label }) => {
  const { value, setValue } = useField<string>({ path })
  const editorRef = useRef<HTMLDivElement>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [currentColor, setCurrentColor] = useState('#ffffff')
  const [isEmpty, setIsEmpty] = useState(true)
  const initializedRef = useRef(false)

  // Read sibling plain-text field for fallback content
  const fallbackPath = getFallbackPath(path)
  const fallbackValue = useFormFields(([fields]) => {
    if (!fallbackPath) return ''
    return (fields[fallbackPath]?.value as string) || ''
  })

  // Derive a visible title from the field name
  const fieldName = path.split('.').pop() || ''
  const title = label || TITLE_MAP[fieldName] || ''

  // Load Google Fonts CDN stylesheet once
  useEffect(() => {
    if (!document.querySelector(`link[href="${GOOGLE_FONTS_URL}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = GOOGLE_FONTS_URL
      document.head.appendChild(link)
    }
  }, [])

  // Parse stored value — JSON { html, text } or plain string
  const getInitialHtml = useCallback((): string => {
    if (!value) return ''
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object' && parsed.html) return parsed.html
    } catch {
      if (typeof value === 'string') return value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
    return ''
  }, [value])

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current && !initializedRef.current) {
      let html = getInitialHtml()
      // If no saved rich content, pre-fill from sibling plain-text field
      if (!html && fallbackValue) {
        const escaped = fallbackValue.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        html = escaped
      }
      editorRef.current.innerHTML = html
      setIsEmpty(!html || html === '<br>')
      initializedRef.current = true
    }
  }, [getInitialHtml, fallbackValue])

  // Save content to Payload field
  const saveContent = useCallback(() => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    const text = editorRef.current.innerText || ''
    setIsEmpty(!html || html === '<br>' || !text.trim())
    setValue(JSON.stringify({ html, text: text.trim() }))
  }, [setValue])

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, val)
    saveContent()
  }, [saveContent])

  const applyColor = useCallback((color: string) => {
    exec('foreColor', color)
    setCurrentColor(color)
    setShowColorPicker(false)
  }, [exec])

  const applyFont = useCallback((font: string) => {
    if (font) exec('fontName', font)
  }, [exec])

  const markAccent = useCallback(() => {
    exec('foreColor', '#3b82f6')
    exec('bold')
  }, [exec])

  return (
    <div style={{ marginBottom: 20 }}>
      {/* ── Title label ── */}
      {title && (
        <h4
          style={{
            margin: '0 0 8px',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--theme-text, #fff)',
          }}
        >
          {title}
        </h4>
      )}

      {/* ── Toolbar ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 4,
          padding: '6px 8px',
          background: 'var(--theme-elevation-100, #2a2a2a)',
          border: '1px solid var(--theme-elevation-150, #555)',
          borderBottom: 'none',
          borderRadius: '6px 6px 0 0',
        }}
      >
        <button type="button" onClick={() => exec('bold')} style={btn} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => exec('italic')} style={btn} title="Italic">
          <em>I</em>
        </button>
        <button type="button" onClick={() => exec('underline')} style={btn} title="Underline">
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--theme-elevation-200, #555)', margin: '0 4px' }} />

        {/* Color picker */}
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setShowColorPicker(v => !v)} style={btn} title="Text Color">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              A
              <span style={{
                display: 'inline-block', width: 14, height: 14, borderRadius: 2,
                background: currentColor, border: '1px solid var(--theme-elevation-200, #666)',
              }} />
            </span>
          </button>
          {showColorPicker && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: 4,
              padding: 8, background: 'var(--theme-elevation-50, #222)',
              border: '1px solid var(--theme-elevation-150, #555)', borderRadius: 6,
              display: 'flex', flexWrap: 'wrap', gap: 4, width: 180,
            }}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => applyColor(c)} style={{
                  width: 24, height: 24, borderRadius: 3, background: c, cursor: 'pointer',
                  border: currentColor === c ? '2px solid #fff' : '1px solid var(--theme-elevation-150, #555)',
                }} title={c} />
              ))}
              <input type="color" value={currentColor} onChange={e => applyColor(e.target.value)}
                style={{ width: 24, height: 24, padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}
                title="Custom color" />
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--theme-elevation-200, #555)', margin: '0 4px' }} />

        {/* Font selector */}
        <select onChange={e => applyFont(e.target.value)} defaultValue="" style={{
          padding: '4px 6px', fontSize: 12, borderRadius: 4,
          border: '1px solid var(--theme-elevation-150, #555)',
          background: 'var(--theme-elevation-100, #333)',
          color: 'var(--theme-text, #fff)', cursor: 'pointer', maxWidth: 120,
        }} title="Font">
          {FONT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div style={{ width: 1, height: 20, background: 'var(--theme-elevation-200, #555)', margin: '0 4px' }} />

        <button type="button" onClick={markAccent} style={{ ...btn, color: '#3b82f6', fontWeight: 700, fontSize: 11 }}
          title="Mark as accent (blue + bold)">
          ✦ Accent
        </button>
      </div>

      {/* ── Editor area ── */}
      <div style={{ position: 'relative' }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={saveContent}
          onBlur={saveContent}
          style={{
            padding: '10px 12px',
            minHeight: 80,
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--theme-text, #fff)',
            background: 'var(--theme-elevation-50, #1a1a1a)',
            border: '1px solid var(--theme-elevation-150, #555)',
            borderRadius: '0 0 6px 6px',
            outline: 'none',
          }}
        />
        {isEmpty && (
          <div style={{
            position: 'absolute', top: 10, left: 12, fontSize: 15,
            color: 'var(--theme-elevation-400, #666)', pointerEvents: 'none', userSelect: 'none',
          }}>
            Start typing here…
          </div>
        )}
      </div>
    </div>
  )
}

export default WysiwygField

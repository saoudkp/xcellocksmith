'use client'

/**
 * EditorToolbar — Formatting toolbar for the section heading editor.
 *
 * Provides bold, italic, underline toggles, a color picker, a font family
 * selector, and a "Mark as Accent" button. Uses document.execCommand for
 * formatting since we don't have direct Lexical React bindings available.
 *
 * @see Requirements 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import React, { useCallback, useState } from 'react'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRESET_COLORS = [
  '#ffffff', '#d1d5db', '#9ca3af', '#4b5563', '#000000',
  '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6',
  '#8b5cf6', '#a855f7', '#ec4899', '#06b6d4', '#14b8a6',
]

const FONT_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Display (Headings)', value: 'var(--font-display), ui-serif, Georgia, serif' },
  { label: 'Sans (Inter)', value: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif' },
  { label: 'Mono (Code)', value: 'var(--font-mono), ui-monospace, Courier New, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
]

// ---------------------------------------------------------------------------
// Shared button style
// ---------------------------------------------------------------------------

const btnBase: React.CSSProperties = {
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
  textAlign: 'center',
  transition: 'background 0.15s',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface EditorToolbarProps {
  /** Ref to the contentEditable element this toolbar controls. */
  editorRef: React.RefObject<HTMLDivElement | null>
  /** Called after any formatting command to notify parent of content change. */
  onContentChange?: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editorRef, onContentChange }) => {
  const [currentColor, setCurrentColor] = useState('#ffffff')
  const [currentFont, setCurrentFont] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const execCmd = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus()
      document.execCommand(command, false, value)
      onContentChange?.()
    },
    [editorRef, onContentChange],
  )

  const applyColor = useCallback(
    (color: string) => {
      execCmd('foreColor', color)
      setCurrentColor(color)
    },
    [execCmd],
  )

  const applyFont = useCallback(
    (fontFamily: string) => {
      if (!fontFamily) {
        execCmd('removeFormat')
      } else {
        execCmd('fontName', fontFamily)
      }
      setCurrentFont(fontFamily)
    },
    [execCmd],
  )

  const markAsAccent = useCallback(() => {
    applyColor('#3b82f6')
    execCmd('bold')
  }, [applyColor, execCmd])

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 4,
        padding: '6px 8px',
        borderBottom: '1px solid var(--theme-elevation-150, #555)',
        background: 'var(--theme-elevation-100, #2a2a2a)',
      }}
    >
      {/* Bold / Italic / Underline */}
      <button type="button" onClick={() => execCmd('bold')} style={btnBase} title="Bold">
        <strong>B</strong>
      </button>
      <button type="button" onClick={() => execCmd('italic')} style={btnBase} title="Italic">
        <em>I</em>
      </button>
      <button type="button" onClick={() => execCmd('underline')} style={btnBase} title="Underline">
        <span style={{ textDecoration: 'underline' }}>U</span>
      </button>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'var(--theme-elevation-200, #555)', margin: '0 4px' }} />

      {/* Color picker */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setShowColorPicker((v) => !v)}
          style={btnBase}
          title="Text Color"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            A
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                borderRadius: 2,
                background: currentColor,
                border: '1px solid var(--theme-elevation-200, #666)',
              }}
            />
          </span>
        </button>
        {showColorPicker && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 50,
              marginTop: 4,
              padding: 8,
              background: 'var(--theme-elevation-50, #222)',
              border: '1px solid var(--theme-elevation-150, #555)',
              borderRadius: 6,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              width: 180,
            }}
          >
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  applyColor(c)
                  setShowColorPicker(false)
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 3,
                  background: c,
                  border: currentColor === c
                    ? '2px solid var(--theme-text, #fff)'
                    : '1px solid var(--theme-elevation-150, #555)',
                  cursor: 'pointer',
                }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={currentColor}
              onChange={(e) => {
                applyColor(e.target.value)
                setShowColorPicker(false)
              }}
              style={{ width: 24, height: 24, padding: 0, border: 'none', cursor: 'pointer', background: 'transparent' }}
              title="Custom color"
            />
          </div>
        )}
      </div>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'var(--theme-elevation-200, #555)', margin: '0 4px' }} />

      {/* Font family selector */}
      <select
        value={currentFont}
        onChange={(e) => applyFont(e.target.value)}
        style={{
          padding: '4px 6px',
          fontSize: 12,
          borderRadius: 4,
          border: '1px solid var(--theme-elevation-150, #555)',
          background: 'var(--theme-elevation-100, #333)',
          color: 'var(--theme-text, #fff)',
          cursor: 'pointer',
          maxWidth: 160,
        }}
        title="Font Family"
      >
        {FONT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: 'var(--theme-elevation-200, #555)', margin: '0 4px' }} />

      {/* Mark as Accent */}
      <button
        type="button"
        onClick={markAsAccent}
        style={{ ...btnBase, color: '#3b82f6', fontWeight: 700, fontSize: 11 }}
        title="Mark selected text as accented word (applies accent color + bold)"
      >
        ✦ Accent
      </button>
    </div>
  )
}

export default EditorToolbar

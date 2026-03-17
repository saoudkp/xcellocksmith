'use client'

/**
 * LivePreviewPanel — Renders a real-time preview of section heading content
 * as it would appear on the frontend.
 *
 * Walks the Lexical JSON node tree and applies inline styles (colors, fonts,
 * bold/italic/underline) from text nodes.  Optionally displays an icon with
 * its color.
 *
 * @see Requirements 2.7, 10.6
 */

import React from 'react'
import type { LexicalJSON, LexicalElementNode, LexicalTextNode } from '../types/sectionEditor'
import { getIconComponent } from './IconPickerPanel'

// ---------------------------------------------------------------------------
// Format bitmask constants (Lexical stores format as a bitmask)
// ---------------------------------------------------------------------------

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_UNDERLINE = 8

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface LivePreviewPanelProps {
  /** Lexical JSON for the heading field. */
  heading: LexicalJSON | null
  /** Lexical JSON for the subheading / description field. */
  subheading: LexicalJSON | null
  /** Optional Lucide icon name to display alongside the heading. */
  iconName?: string
  /** Optional hex color for the icon. */
  iconColor?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a CSS style string (e.g. "color: #fff; font-family: serif") into
 * a React CSSProperties object.
 */
function parseStyleString(style: string | undefined): React.CSSProperties {
  if (!style) return {}
  const result: Record<string, string> = {}
  for (const part of style.split(';')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue
    const prop = trimmed.slice(0, colonIdx).trim()
    const value = trimmed.slice(colonIdx + 1).trim()
    // Convert kebab-case to camelCase for React
    const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    result[camelProp] = value
  }
  return result as React.CSSProperties
}

/**
 * Build React CSSProperties from a Lexical text node's format bitmask and
 * inline style string.
 */
function buildTextStyle(node: LexicalTextNode): React.CSSProperties {
  const style: React.CSSProperties = parseStyleString(node.style)
  const fmt = node.format ?? 0

  if (fmt & FORMAT_BOLD) style.fontWeight = 'bold'
  if (fmt & FORMAT_ITALIC) style.fontStyle = 'italic'
  if (fmt & FORMAT_UNDERLINE) style.textDecoration = 'underline'

  return style
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

/** Render a single Lexical text node as a styled <span>. */
function renderTextNode(node: LexicalTextNode, key: string): React.ReactNode {
  const style = buildTextStyle(node)
  return (
    <span key={key} style={style}>
      {node.text}
    </span>
  )
}

/** Render a block-level element (paragraph, heading, etc.). */
function renderBlock(block: LexicalElementNode, key: string): React.ReactNode {
  const children = block.children.map((child, i) => {
    if (child.type === 'text') {
      return renderTextNode(child as LexicalTextNode, `${key}-t${i}`)
    }
    if (child.type === 'linebreak') {
      return <br key={`${key}-br${i}`} />
    }
    return null
  })

  return (
    <div key={key} style={{ minHeight: '1em' }}>
      {children}
    </div>
  )
}

/** Render an entire LexicalJSON tree into React elements. */
function renderLexicalContent(json: LexicalJSON | null): React.ReactNode {
  if (!json?.root?.children?.length) return null
  return json.root.children.map((block, i) => renderBlock(block, `blk-${i}`))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  heading,
  subheading,
  iconName,
  iconColor,
}) => {
  const IconComp = getIconComponent(iconName)
  const hasContent =
    heading?.root?.children?.length || subheading?.root?.children?.length || IconComp

  return (
    <div
      style={{
        marginTop: 20,
        padding: 16,
        border: '1px solid var(--theme-elevation-150, #555)',
        borderRadius: 8,
        background: 'var(--theme-elevation-0, #111)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--theme-elevation-400, #888)',
          marginBottom: 12,
        }}
      >
        Live Preview
      </div>

      {!hasContent ? (
        <div style={{ fontSize: 13, color: 'var(--theme-elevation-400, #888)' }}>
          Start typing to see a preview…
        </div>
      ) : (
        <div>
          {/* Heading row with optional icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            {IconComp && (
              <IconComp size={28} color={iconColor || '#ffffff'} style={{ flexShrink: 0 }} />
            )}
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
              {renderLexicalContent(heading)}
            </div>
          </div>

          {/* Subheading */}
          {subheading?.root?.children?.length ? (
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.5,
                color: 'var(--theme-elevation-500, #aaa)',
                marginLeft: IconComp ? 38 : 0,
              }}
            >
              {renderLexicalContent(subheading)}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default LivePreviewPanel

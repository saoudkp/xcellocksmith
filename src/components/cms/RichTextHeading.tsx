'use client'

/**
 * RichTextHeading — Renders rich text content from the CMS as formatted HTML.
 *
 * Supports two content formats:
 * 1. WYSIWYG HTML — JSON string `{ html, text }` from the WysiwygField component
 * 2. Lexical JSON — legacy format from Payload richText fields
 *
 * Falls back to plain `fallbackText` when no content is provided.
 */

import React from 'react'
import * as Icons from 'lucide-react'

// ---------------------------------------------------------------------------
// Minimal Lexical JSON types (frontend-only, no CMS app dependency)
// ---------------------------------------------------------------------------

type LexicalFormatType = number

interface LexicalTextNode {
  type: 'text'
  text: string
  version: 1
  format?: LexicalFormatType
  style?: string
}

interface LexicalLinebreakNode {
  type: 'linebreak'
  version: 1
}

type LexicalInlineNode = LexicalTextNode | LexicalLinebreakNode

interface LexicalElementNode {
  type: string
  children: LexicalInlineNode[]
  version: 1
}

interface LexicalRootNode {
  type: 'root'
  children: LexicalElementNode[]
  version: 1
}

export interface LexicalJSON {
  root: LexicalRootNode
}

/** WYSIWYG field stores content as `{ html, text }` JSON string. */
export interface WysiwygContent {
  html: string
  text: string
}

/**
 * Union type: content can be Lexical JSON, a WYSIWYG `{html,text}` object,
 * or a raw JSON string that parses to one of those.
 */
export type RichContent = LexicalJSON | WysiwygContent | string | null | undefined

// ---------------------------------------------------------------------------
// Format bitmask constants
// ---------------------------------------------------------------------------

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_UNDERLINE = 8

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface RichTextHeadingProps {
  content: RichContent
  fallbackText: string
  className?: string
  iconName?: string
  iconColor?: string
}

// ---------------------------------------------------------------------------
// Light mode white-text fix
// ---------------------------------------------------------------------------

function isLightMode(): boolean {
  if (typeof document === 'undefined') return false
  return !document.documentElement.classList.contains('dark')
}

/** Hex colors that are "white-ish" — invisible on a white background. */
const WHITE_ISH = new Set([
  '#ffffff', '#fff', '#fefefe', '#fdfdfd', '#fcfcfc', '#fbfbfb', '#fafafa',
  '#f9f9f9', '#f8f8f8', '#f7f7f7', '#f5f5f5', '#f0f0f0',
  'rgb(255, 255, 255)', 'rgb(255,255,255)',
  'white',
])

const DARK_REPLACEMENT = '#1a1a2e'

function fixWhiteColors(html: string): string {
  if (!isLightMode()) return html
  return html.replace(/color:\s*([^;"]+)/gi, (match, colorVal: string) => {
    const trimmed = colorVal.trim().toLowerCase()
    if (WHITE_ISH.has(trimmed)) {
      return `color: ${DARK_REPLACEMENT}`
    }
    return match
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    const camelProp = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    result[camelProp] = value
  }
  return result as React.CSSProperties
}

function buildTextStyle(node: LexicalTextNode): React.CSSProperties {
  const style: React.CSSProperties = parseStyleString(node.style)
  const fmt = node.format ?? 0
  if (fmt & FORMAT_BOLD) style.fontWeight = 'bold'
  if (fmt & FORMAT_ITALIC) style.fontStyle = 'italic'
  if (fmt & FORMAT_UNDERLINE) style.textDecoration = 'underline'
  // Fix white text in light mode
  if (style.color && typeof style.color === 'string' && WHITE_ISH.has(style.color.trim().toLowerCase())) {
    if (isLightMode()) style.color = DARK_REPLACEMENT
  }
  return style
}

function getIconComponent(
  name: string | undefined,
): React.ComponentType<{ className?: string; style?: React.CSSProperties; size?: number }> | null {
  if (!name) return null
  const icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; size?: number }>>)[name]
  return icon ?? null
}

// ---------------------------------------------------------------------------
// Content detection & parsing
// ---------------------------------------------------------------------------

function isLexicalJSON(obj: unknown): obj is LexicalJSON {
  return !!obj && typeof obj === 'object' && 'root' in obj && !!(obj as LexicalJSON).root?.children
}

function isWysiwygContent(obj: unknown): obj is WysiwygContent {
  return !!obj && typeof obj === 'object' && 'html' in obj && typeof (obj as WysiwygContent).html === 'string'
}

function resolveContent(content: RichContent): LexicalJSON | WysiwygContent | null {
  if (!content) return null
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      if (isWysiwygContent(parsed)) return parsed
      if (isLexicalJSON(parsed)) return parsed
    } catch {
      // Not JSON
    }
    return null
  }
  if (isWysiwygContent(content)) return content
  if (isLexicalJSON(content)) return content
  return null
}

// ---------------------------------------------------------------------------
// Lexical renderers
// ---------------------------------------------------------------------------

function renderTextNode(node: LexicalTextNode, key: string): React.ReactNode {
  const style = buildTextStyle(node)
  return <span key={key} style={style}>{node.text}</span>
}

function renderBlock(block: LexicalElementNode, key: string): React.ReactNode {
  const children = block.children.map((child, i) => {
    if (child.type === 'text') return renderTextNode(child as LexicalTextNode, `${key}-t${i}`)
    if (child.type === 'linebreak') return <br key={`${key}-br${i}`} />
    return null
  })
  return <span key={key} style={{ display: 'inline' }}>{children}</span>
}

function renderLexicalContent(json: LexicalJSON): React.ReactNode {
  if (!json?.root?.children?.length) return null
  return json.root.children.map((block, i) => renderBlock(block, `blk-${i}`))
}

function hasLexicalContent(json: LexicalJSON): boolean {
  return json.root.children.some((block) =>
    block.children.some((child) => child.type === 'text' && (child as LexicalTextNode).text.trim().length > 0),
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const RichTextHeading: React.FC<RichTextHeadingProps> = ({
  content,
  fallbackText,
  className,
  iconName,
  iconColor,
}) => {
  const IconComp = getIconComponent(iconName)
  const resolved = resolveContent(content)

  // Re-render when theme changes (dark ↔ light)
  const [, setTick] = React.useState(0)
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          setTick((t) => t + 1)
        }
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  let renderedContent: React.ReactNode = fallbackText

  if (resolved) {
    if (isWysiwygContent(resolved) && resolved.html && resolved.text.trim()) {
      const safeHtml = fixWhiteColors(resolved.html)
      renderedContent = <span dangerouslySetInnerHTML={{ __html: safeHtml }} />
    } else if (isLexicalJSON(resolved) && hasLexicalContent(resolved)) {
      renderedContent = renderLexicalContent(resolved)
    }
  }

  return (
    <span className={className} style={{ display: 'inline' }}>
      {IconComp && (
        <IconComp
          size={24}
          className="inline-block align-middle mr-2 shrink-0 md:w-7 md:h-7"
          style={{ color: iconColor || '#ffffff' }}
        />
      )}
      {renderedContent}
    </span>
  )
}

export default RichTextHeading

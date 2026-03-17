'use client'

/**
 * SectionHeadingEditor — Rich text editor for section headings.
 *
 * Uses contentEditable divs for editing and converts to/from Lexical JSON
 * for persistence. Avoids direct @lexical/react imports which are not
 * available as direct dependencies in the CMS app.
 *
 * @see Requirements 2.1, 2.2, 2.8, 5.1, 5.2, 5.3
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LexicalJSON, LexicalTextNode, LexicalInlineNode, SectionFieldSchema } from '../types/sectionEditor'
import { plainTextToLexical, lexicalToPlainText } from '../utils/lexicalHelpers'
import EditorToolbar from './EditorToolbar'
import IconPickerPanel, { getIconComponent } from './IconPickerPanel'
import LivePreviewPanel from './LivePreviewPanel'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SectionHeadingEditorProps {
  sectionKey: string
  globalSlug: 'sections-settings' | 'services-settings'
  sectionData: Record<string, unknown> | null
  fieldSchema?: SectionFieldSchema
  onHeadingChange?: (json: LexicalJSON) => void
  onSubheadingChange?: (json: LexicalJSON) => void
  onIconChange?: (iconName: string) => void
  onIconColorChange?: (color: string) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve initial Lexical JSON for a field from section data. */
function resolveInitialContent(
  sectionData: Record<string, unknown> | null,
  richFieldName: string,
  plainFieldName: string,
): LexicalJSON {
  if (!sectionData) return plainTextToLexical('')
  const richData = sectionData[richFieldName]
  if (richData && typeof richData === 'object' && 'root' in (richData as Record<string, unknown>)) {
    return richData as LexicalJSON
  }
  const plainText = sectionData[plainFieldName]
  if (typeof plainText === 'string' && plainText.length > 0) {
    return plainTextToLexical(plainText)
  }
  return plainTextToLexical('')
}

// Format bitmask constants
const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_UNDERLINE = 8

/** Convert Lexical JSON to HTML string for contentEditable rendering. */
function lexicalToHtml(json: LexicalJSON | null): string {
  if (!json?.root?.children?.length) return ''
  const parts: string[] = []
  for (const block of json.root.children) {
    const inlineParts: string[] = []
    for (const child of block.children) {
      if (child.type === 'text') {
        const node = child as LexicalTextNode
        let style = node.style || ''
        const fmt = node.format ?? 0
        if (fmt & FORMAT_BOLD) style += '; font-weight: bold'
        if (fmt & FORMAT_ITALIC) style += '; font-style: italic'
        if (fmt & FORMAT_UNDERLINE) style += '; text-decoration: underline'
        style = style.replace(/^;\s*/, '')
        const escaped = node.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        inlineParts.push(style ? `<span style="${style}">${escaped}</span>` : escaped)
      } else if (child.type === 'linebreak') {
        inlineParts.push('<br>')
      }
    }
    parts.push(inlineParts.join(''))
  }
  return parts.join('<br>')
}

/** Convert HTML from contentEditable back to Lexical JSON. */
function htmlToLexical(html: string): LexicalJSON {
  const div = document.createElement('div')
  div.innerHTML = html

  function processNode(node: Node): LexicalInlineNode[] {
    const result: LexicalInlineNode[] = []
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || ''
        if (text) result.push({ type: 'text', text, version: 1 })
      } else if (child.nodeName === 'BR') {
        result.push({ type: 'linebreak', version: 1 })
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        const innerNodes = processNode(el)
        // Apply element styles/formatting to inner text nodes
        for (const inner of innerNodes) {
          if (inner.type === 'text') {
            const textNode = inner as LexicalTextNode
            // Merge inline styles
            const elStyle = el.getAttribute('style') || ''
            if (elStyle) {
              textNode.style = textNode.style ? `${textNode.style}; ${elStyle}` : elStyle
            }
            // Handle semantic tags
            let fmt = textNode.format ?? 0
            const tag = el.tagName.toLowerCase()
            if (tag === 'b' || tag === 'strong') fmt |= FORMAT_BOLD
            if (tag === 'i' || tag === 'em') fmt |= FORMAT_ITALIC
            if (tag === 'u') fmt |= FORMAT_UNDERLINE
            // Handle font tags from execCommand
            if (tag === 'font') {
              const color = el.getAttribute('color')
              if (color) {
                textNode.style = textNode.style ? `${textNode.style}; color: ${color}` : `color: ${color}`
              }
              const face = el.getAttribute('face')
              if (face) {
                textNode.style = textNode.style ? `${textNode.style}; font-family: ${face}` : `font-family: ${face}`
              }
            }
            if (fmt) textNode.format = fmt
          }
        }
        result.push(...innerNodes)
      }
    }
    return result
  }

  const children = processNode(div)
  // If empty, add an empty text node
  if (children.length === 0) {
    children.push({ type: 'text', text: '', version: 1 })
  }

  return {
    root: {
      type: 'root',
      children: [{
        type: 'paragraph',
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ---------------------------------------------------------------------------
// Sub-component: single editor instance
// ---------------------------------------------------------------------------

interface SingleEditorProps {
  label: string
  initialHtml: string
  placeholder?: string
  onChange?: (json: LexicalJSON) => void
  toolbarRef?: React.MutableRefObject<HTMLDivElement | null>
}

const SingleEditor: React.FC<SingleEditorProps> = ({
  label,
  initialHtml,
  placeholder = 'Start typing…',
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(!initialHtml)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialHtml) {
      editorRef.current.innerHTML = initialHtml
      setIsEmpty(!initialHtml)
    }
    // Only set on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInput = useCallback(() => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    setIsEmpty(!html || html === '<br>')
    onChange?.(htmlToLexical(html))
  }, [onChange])

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: 'block',
          marginBottom: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--theme-text, #fff)',
        }}
      >
        {label}
      </label>
      <div
        style={{
          border: '1px solid var(--theme-elevation-150, #555)',
          borderRadius: 4,
          background: 'var(--theme-elevation-50, #222)',
          minHeight: 60,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <EditorToolbar editorRef={editorRef} onContentChange={handleInput} />
        <div style={{ position: 'relative' }}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            style={{
              padding: '8px 12px',
              fontSize: 14,
              color: 'var(--theme-text, #fff)',
              outline: 'none',
              minHeight: 60,
            }}
          />
          {isEmpty && (
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 12,
                fontSize: 14,
                color: 'var(--theme-elevation-400, #888)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {placeholder}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const SectionHeadingEditor: React.FC<SectionHeadingEditorProps> = ({
  sectionKey,
  globalSlug,
  sectionData,
  fieldSchema,
  onHeadingChange,
  onSubheadingChange,
  onIconChange,
  onIconColorChange,
}) => {
  const headingRichField = 'richHeading'
  const headingPlainField = 'heading'
  const subheadingRichField = globalSlug === 'services-settings' ? 'richDescription' : 'richSubheading'
  const subheadingPlainField = globalSlug === 'services-settings' ? 'description' : 'subheading'
  const subheadingLabel = globalSlug === 'services-settings' ? 'Description' : 'Subheading'

  const headingContent = useMemo(
    () => resolveInitialContent(sectionData, headingRichField, headingPlainField),
    [sectionData, headingRichField, headingPlainField],
  )

  const subheadingContent = useMemo(
    () => resolveInitialContent(sectionData, subheadingRichField, subheadingPlainField),
    [sectionData, subheadingRichField, subheadingPlainField],
  )

  const headingHtml = useMemo(() => lexicalToHtml(headingContent), [headingContent])
  const subheadingHtml = useMemo(() => lexicalToHtml(subheadingContent), [subheadingContent])

  const [previewHeading, setPreviewHeading] = useState<LexicalJSON | null>(null)
  const [previewSubheading, setPreviewSubheading] = useState<LexicalJSON | null>(null)

  const handleHeadingChange = useCallback(
    (json: LexicalJSON) => {
      setPreviewHeading(json)
      onHeadingChange?.(json)
    },
    [onHeadingChange],
  )

  const handleSubheadingChange = useCallback(
    (json: LexicalJSON) => {
      setPreviewSubheading(json)
      onSubheadingChange?.(json)
    },
    [onSubheadingChange],
  )

  const currentIconName = (sectionData?.icon as string) || ''
  const currentIconColor = (sectionData?.color as string) || '#ffffff'
  const showIconPicker = !!fieldSchema?.icon
  const PreviewIcon = showIconPicker ? getIconComponent(currentIconName) : null

  if (!sectionData) {
    return (
      <div style={{ padding: 16, color: 'var(--theme-elevation-400, #888)' }}>
        Select a section to begin editing.
      </div>
    )
  }

  return (
    <div>
      {showIconPicker && (
        <IconPickerPanel
          iconName={currentIconName}
          iconColor={currentIconColor}
          onIconChange={onIconChange ?? (() => {})}
          onColorChange={onIconColorChange ?? (() => {})}
        />
      )}

      <div style={{ position: 'relative' }}>
        {PreviewIcon && (
          <div
            style={{
              position: 'absolute',
              top: 30,
              right: 8,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 6,
              background: 'var(--theme-elevation-100, #333)',
              border: '1px solid var(--theme-elevation-150, #555)',
              pointerEvents: 'none',
            }}
            title={`Icon: ${currentIconName}`}
          >
            <PreviewIcon size={16} color={currentIconColor} />
            <span style={{ fontSize: 10, color: 'var(--theme-elevation-500, #888)' }}>
              {currentIconName}
            </span>
          </div>
        )}
        <SingleEditor
          key={`${sectionKey}-heading`}
          label="Heading"
          initialHtml={headingHtml}
          placeholder="Enter heading text…"
          onChange={handleHeadingChange}
        />
      </div>

      <SingleEditor
        key={`${sectionKey}-subheading`}
        label={subheadingLabel}
        initialHtml={subheadingHtml}
        placeholder={`Enter ${subheadingLabel.toLowerCase()} text…`}
        onChange={handleSubheadingChange}
      />

      <LivePreviewPanel
        heading={previewHeading ?? headingContent}
        subheading={previewSubheading ?? subheadingContent}
        iconName={showIconPicker ? currentIconName : undefined}
        iconColor={showIconPicker ? currentIconColor : undefined}
      />
    </div>
  )
}

export default SectionHeadingEditor

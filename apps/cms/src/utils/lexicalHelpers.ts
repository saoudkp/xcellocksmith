/**
 * Lexical serialization utilities for plain text ↔ rich text conversion.
 *
 * These helpers produce valid Lexical JSON compatible with
 * `@payloadcms/richtext-lexical` and consume the shared types from
 * `../types/sectionEditor`.
 *
 * @see Requirements 5.2, 5.4, 8.2
 */

import type {
  LexicalJSON,
  LexicalTextNode,
  LexicalElementNode,
  LexicalRootNode,
  LexicalInlineNode,
} from '../types/sectionEditor'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a CSS `style` string from optional color / font values.
 *
 * Lexical stores inline styles as a single CSS string on text nodes.
 * Additional style properties from `extra` are merged in.
 */
function buildStyleString(opts?: {
  color?: string
  font?: string
  [key: string]: string | undefined
}): string {
  if (!opts) return ''
  const parts: string[] = []
  if (opts.color) parts.push(`color: ${opts.color}`)
  if (opts.font) parts.push(`font-family: ${opts.font}`)

  // Merge any extra style keys (e.g. fontWeight, fontStyle)
  for (const [key, value] of Object.entries(opts)) {
    if (key === 'color' || key === 'font' || !value) continue
    // Convert camelCase → kebab-case for CSS
    const cssProp = key.replace(/([A-Z])/g, '-$1').toLowerCase()
    parts.push(`${cssProp}: ${value}`)
  }
  return parts.join('; ')
}

/** Create a single Lexical text node. */
function createTextNode(
  text: string,
  style?: string,
  format?: number,
): LexicalTextNode {
  const node: LexicalTextNode = { type: 'text', text, version: 1 }
  if (style) node.style = style
  if (format) node.format = format
  return node
}

/** Wrap inline children in a paragraph element node. */
function createParagraph(children: LexicalInlineNode[]): LexicalElementNode {
  return {
    type: 'paragraph',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert a plain text string into a valid Lexical JSON structure.
 *
 * Optionally applies inline `color` and `font` styles to every text node.
 *
 * @example
 * ```ts
 * const json = plainTextToLexical('Hello world', { color: '#3b82f6' })
 * ```
 *
 * @see Requirement 5.2 — convert existing heading text to Rich_Text_Field
 * @see Requirement 8.2 — convert plain text heading values to Lexical format
 */
export function plainTextToLexical(
  text: string,
  styles?: { color?: string; font?: string },
): LexicalJSON {
  const style = buildStyleString(styles)
  const textNode = createTextNode(text, style || undefined)

  const root: LexicalRootNode = {
    type: 'root',
    children: [createParagraph([textNode])],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }

  return { root }
}

/**
 * Extract the concatenated plain text from a Lexical JSON structure.
 *
 * Walks every paragraph / block element and joins the text content of
 * each text node.  Linebreak nodes are converted to `\n`.
 *
 * @see Requirement 5.2 — round-trip between plain text and rich text
 */
export function lexicalToPlainText(json: LexicalJSON): string {
  if (!json?.root?.children) return ''

  const blocks: string[] = []

  for (const block of json.root.children) {
    const inlineTexts: string[] = []
    for (const child of block.children) {
      if (child.type === 'text') {
        inlineTexts.push(child.text)
      } else if (child.type === 'linebreak') {
        inlineTexts.push('\n')
      }
    }
    blocks.push(inlineTexts.join(''))
  }

  return blocks.join('\n')
}

/**
 * Mark occurrences of `word` inside a Lexical JSON tree with accent styles.
 *
 * The function splits text nodes that contain the target word so that the
 * matched portion becomes its own node with the supplied `accentStyles`
 * applied.  The match is case-insensitive.
 *
 * `accentStyles` is a plain object whose keys are CSS property names
 * (camelCase or kebab-case) that will be merged into the node's `style`
 * string.  Common keys: `color`, `font`, `fontWeight`, `fontStyle`.
 *
 * @example
 * ```ts
 * const styled = markAccentedWord(json, 'Services', { color: '#3b82f6', fontWeight: 'bold' })
 * ```
 *
 * @see Requirement 5.4 — identify and format existing accented word values
 */
export function markAccentedWord(
  lexicalJson: LexicalJSON,
  word: string,
  accentStyles: Record<string, string | undefined>,
): LexicalJSON {
  if (!word) return lexicalJson

  const accentStyle = buildStyleString(accentStyles)

  /**
   * Process a single text node — if it contains the target word, split it
   * into up to three nodes: before, accented, after.
   */
  function processTextNode(node: LexicalTextNode): LexicalInlineNode[] {
    const idx = node.text.toLowerCase().indexOf(word.toLowerCase())
    if (idx === -1) return [node]

    const result: LexicalInlineNode[] = []
    const before = node.text.slice(0, idx)
    const match = node.text.slice(idx, idx + word.length)
    const after = node.text.slice(idx + word.length)

    if (before) {
      result.push(createTextNode(before, node.style || undefined, node.format))
    }

    // Merge existing style with accent style
    const mergedStyle = [node.style, accentStyle].filter(Boolean).join('; ')
    result.push(createTextNode(match, mergedStyle || undefined, node.format))

    if (after) {
      // Recursively process the remainder in case the word appears more than once
      const afterNode = createTextNode(after, node.style || undefined, node.format)
      result.push(...processTextNode(afterNode))
    }

    return result
  }

  // Deep-clone to avoid mutating the input
  const cloned: LexicalJSON = JSON.parse(JSON.stringify(lexicalJson))

  for (const block of cloned.root.children) {
    const newChildren: LexicalInlineNode[] = []
    for (const child of block.children) {
      if (child.type === 'text') {
        newChildren.push(...processTextNode(child as LexicalTextNode))
      } else {
        newChildren.push(child)
      }
    }
    block.children = newChildren
  }

  return cloned
}

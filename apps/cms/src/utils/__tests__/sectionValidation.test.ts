import { describe, it, expect } from 'vitest'
import { validateLexicalJSON, validateSectionContent } from '../sectionValidation'
import type { LexicalJSON, RichTextSectionHeading } from '../../types/sectionEditor'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid Lexical JSON structure. */
const validLexical: LexicalJSON = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Hello', version: 1 }],
        version: 1,
      },
    ],
    version: 1,
  },
}

// ---------------------------------------------------------------------------
// validateLexicalJSON
// ---------------------------------------------------------------------------

describe('validateLexicalJSON', () => {
  it('accepts null as valid (empty optional field)', () => {
    const result = validateLexicalJSON(null, 'heading')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('accepts a well-formed Lexical JSON structure', () => {
    const result = validateLexicalJSON(validLexical, 'heading')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects when root property is missing', () => {
    const result = validateLexicalJSON({} as LexicalJSON, 'heading')
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('missing "root"')
  })

  it('rejects when root.type is not "root"', () => {
    const bad = { root: { type: 'paragraph', children: [], version: 1 } } as unknown as LexicalJSON
    const result = validateLexicalJSON(bad, 'heading')
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('must have type "root"')
  })

  it('rejects when root.children is not an array', () => {
    const bad = { root: { type: 'root', children: 'nope', version: 1 } } as unknown as LexicalJSON
    const result = validateLexicalJSON(bad, 'heading')
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('missing a "children" array')
  })

  it('rejects element node without children array', () => {
    const bad: LexicalJSON = {
      root: {
        type: 'root',
        children: [{ type: 'paragraph', version: 1 } as any],
        version: 1,
      },
    }
    const result = validateLexicalJSON(bad, 'heading')
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('missing a "children" array')
  })

  it('rejects text node missing the text field', () => {
    const bad: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', version: 1 } as any],
            version: 1,
          },
        ],
        version: 1,
      },
    }
    const result = validateLexicalJSON(bad, 'heading')
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('missing the "text" field')
  })

  it('rejects text node missing the version field', () => {
    const bad: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'hi' } as any],
            version: 1,
          },
        ],
        version: 1,
      },
    }
    const result = validateLexicalJSON(bad, 'heading')
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('missing the "version" field')
  })

  it('accepts linebreak nodes', () => {
    const json: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Line 1', version: 1 },
              { type: 'linebreak', version: 1 },
              { type: 'text', text: 'Line 2', version: 1 },
            ],
            version: 1,
          },
        ],
        version: 1,
      },
    }
    const result = validateLexicalJSON(json, 'heading')
    expect(result.valid).toBe(true)
  })

  it('collects multiple errors from different nodes', () => {
    const bad: LexicalJSON = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', version: 1 } as any,
              { type: 'text', text: 'ok' } as any,
            ],
            version: 1,
          },
        ],
        version: 1,
      },
    }
    const result = validateLexicalJSON(bad, 'field')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// validateSectionContent
// ---------------------------------------------------------------------------

describe('validateSectionContent', () => {
  it('accepts valid section content with all null fields', () => {
    const data: RichTextSectionHeading = { heading: null, subheading: null, accent: null }
    const result = validateSectionContent(data)
    expect(result.valid).toBe(true)
  })

  it('accepts valid section content with populated heading', () => {
    const data: RichTextSectionHeading = {
      heading: validLexical,
      subheading: null,
      accent: null,
    }
    const result = validateSectionContent(data)
    expect(result.valid).toBe(true)
  })

  it('rejects when heading has invalid structure', () => {
    const data: RichTextSectionHeading = {
      heading: {} as LexicalJSON,
      subheading: null,
      accent: null,
    }
    const result = validateSectionContent(data)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('heading')
  })

  it('rejects null/undefined data', () => {
    const result = validateSectionContent(null as any)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('missing')
  })

  it('aggregates errors from multiple fields', () => {
    const data: RichTextSectionHeading = {
      heading: {} as LexicalJSON,
      subheading: {} as LexicalJSON,
      accent: null,
    }
    const result = validateSectionContent(data)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
  })
})

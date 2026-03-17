import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RichTextHeading, { type LexicalJSON } from './RichTextHeading'

/** Helper to build a minimal valid LexicalJSON with one paragraph and text nodes. */
function makeLexical(
  nodes: Array<{ text: string; format?: number; style?: string }>,
): LexicalJSON {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: nodes.map((n) => ({
            type: 'text' as const,
            text: n.text,
            version: 1 as const,
            format: n.format,
            style: n.style,
          })),
          version: 1,
        },
      ],
      version: 1,
    },
  }
}

describe('RichTextHeading', () => {
  it('renders fallbackText when content is null', () => {
    render(<RichTextHeading content={null} fallbackText="Hello World" />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('renders fallbackText when content is undefined', () => {
    render(<RichTextHeading content={undefined} fallbackText="Fallback" />)
    expect(screen.getByText('Fallback')).toBeInTheDocument()
  })

  it('renders fallbackText when content has empty root children', () => {
    const empty: LexicalJSON = {
      root: { type: 'root', children: [], version: 1 },
    }
    render(<RichTextHeading content={empty} fallbackText="Empty" />)
    expect(screen.getByText('Empty')).toBeInTheDocument()
  })

  it('renders rich text content instead of fallback when content is valid', () => {
    const content = makeLexical([{ text: 'Rich Heading' }])
    render(<RichTextHeading content={content} fallbackText="Plain" />)
    expect(screen.getByText('Rich Heading')).toBeInTheDocument()
    expect(screen.queryByText('Plain')).not.toBeInTheDocument()
  })

  it('applies bold style from format bitmask', () => {
    const content = makeLexical([{ text: 'Bold Text', format: 1 }])
    render(<RichTextHeading content={content} fallbackText="" />)
    const el = screen.getByText('Bold Text')
    expect(el).toHaveStyle({ fontWeight: 'bold' })
  })

  it('applies italic style from format bitmask', () => {
    const content = makeLexical([{ text: 'Italic Text', format: 2 }])
    render(<RichTextHeading content={content} fallbackText="" />)
    const el = screen.getByText('Italic Text')
    expect(el).toHaveStyle({ fontStyle: 'italic' })
  })

  it('applies underline style from format bitmask', () => {
    const content = makeLexical([{ text: 'Underlined', format: 8 }])
    render(<RichTextHeading content={content} fallbackText="" />)
    const el = screen.getByText('Underlined')
    expect(el).toHaveStyle({ textDecoration: 'underline' })
  })

  it('applies combined bold+italic from format bitmask', () => {
    const content = makeLexical([{ text: 'Bold Italic', format: 3 }])
    render(<RichTextHeading content={content} fallbackText="" />)
    const el = screen.getByText('Bold Italic')
    expect(el).toHaveStyle({ fontWeight: 'bold', fontStyle: 'italic' })
  })

  it('applies inline color and font-family from style string', () => {
    const content = makeLexical([
      { text: 'Styled', style: 'color: #ff0000; font-family: Georgia' },
    ])
    render(<RichTextHeading content={content} fallbackText="" />)
    const el = screen.getByText('Styled')
    expect(el).toHaveStyle({ color: '#ff0000', fontFamily: 'Georgia' })
  })

  it('renders multiple text nodes with different styles (accented word)', () => {
    const content = makeLexical([
      { text: 'Normal ' },
      { text: 'Accented', format: 1, style: 'color: #3b82f6' },
      { text: ' Word' },
    ])
    render(<RichTextHeading content={content} fallbackText="" />)
    expect(screen.getByText('Normal')).toBeInTheDocument()
    const accented = screen.getByText('Accented')
    expect(accented).toHaveStyle({ fontWeight: 'bold', color: '#3b82f6' })
    expect(screen.getByText('Word')).toBeInTheDocument()
  })

  it('renders linebreak nodes as <br>', () => {
    const content: LexicalJSON = {
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
    render(<RichTextHeading content={content} fallbackText="" />)
    expect(screen.getByText('Line 1')).toBeInTheDocument()
    expect(screen.getByText('Line 2')).toBeInTheDocument()
  })

  it('applies className prop to the wrapper', () => {
    const { container } = render(
      <RichTextHeading content={null} fallbackText="Test" className="custom-class" />,
    )
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('renders fallback when content has only whitespace text', () => {
    const content = makeLexical([{ text: '   ' }])
    render(<RichTextHeading content={content} fallbackText="Fallback" />)
    expect(screen.getByText('Fallback')).toBeInTheDocument()
  })
})

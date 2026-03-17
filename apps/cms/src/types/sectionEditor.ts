/**
 * Shared TypeScript interfaces for the WYSIWYG Section Heading Editor.
 *
 * These types define the Lexical rich-text JSON structures used by the
 * section editor, the per-section field configuration, and the
 * draft/publish state model.
 *
 * @see Requirements 2.1, 2.2, 11.8
 */

// ---------------------------------------------------------------------------
// Lexical JSON node types
// ---------------------------------------------------------------------------

/** Format flags stored as a bitmask by Lexical (0 = none). */
export type LexicalFormatType = number

/** Text-level node inside a Lexical paragraph. */
export interface LexicalTextNode {
  type: 'text'
  text: string
  version: 1
  format?: LexicalFormatType
  style?: string
  detail?: number
  mode?: 'normal' | 'token' | 'segmented'
}

/** A linebreak node inside a Lexical paragraph. */
export interface LexicalLinebreakNode {
  type: 'linebreak'
  version: 1
}

/** Inline child — either a text run or a linebreak. */
export type LexicalInlineNode = LexicalTextNode | LexicalLinebreakNode

/** Block-level element (paragraph, heading, etc.). */
export interface LexicalElementNode {
  type: string
  children: LexicalInlineNode[]
  direction?: 'ltr' | 'rtl' | null
  format?: string
  indent?: number
  version: 1
  /** Heading tag when type is 'heading' */
  tag?: string
}

/** Top-level root node of a serialised Lexical editor state. */
export interface LexicalRootNode {
  type: 'root'
  children: LexicalElementNode[]
  direction?: 'ltr' | 'rtl' | null
  format?: string
  indent?: number
  version: 1
}

/**
 * Serialised Lexical editor state — the JSON shape stored by
 * `@payloadcms/richtext-lexical` fields.
 */
export interface LexicalJSON {
  root: LexicalRootNode
}

// ---------------------------------------------------------------------------
// Rich text section heading data
// ---------------------------------------------------------------------------

/**
 * Rich text representation of a single section heading.
 *
 * Each field is stored as Lexical JSON so the WYSIWYG editor can
 * round-trip formatting (colours, fonts, accented words, etc.).
 *
 * @see Requirement 2.1 — Lexical editor framework
 * @see Requirement 2.2 — heading and subheading text formatting
 */
export interface RichTextSectionHeading {
  /** Lexical JSON for the main heading text. */
  heading: LexicalJSON | null
  /** Lexical JSON for the subheading / description text. */
  subheading: LexicalJSON | null
  /** Lexical JSON for the accented word (styled highlight within the heading). */
  accent: LexicalJSON | null
}

// ---------------------------------------------------------------------------
// Section editor configuration
// ---------------------------------------------------------------------------

/** Schema flags describing which optional fields a section supports. */
export interface SectionFieldSchema {
  /** Section supports an icon picker (e.g. Contact social links, Services). */
  icon?: boolean
  /** Section supports an accented word field. */
  accent?: boolean
  /** Section supports a description / long-text field. */
  description?: boolean
}

/**
 * Maps every editable section key to its field schema.
 *
 * The keys correspond to the group names in `SectionsSettings` and
 * `ServicesSettings` globals.  The editor uses this map to decide
 * which fields to render for the currently selected section.
 *
 * @see Requirement 2.2 — heading and subheading text formatting
 */
export type SectionEditorConfig = Record<string, SectionFieldSchema>

// ---------------------------------------------------------------------------
// Draft / Publish state
// ---------------------------------------------------------------------------

/** Possible publish statuses for section heading content. */
export type PublishStatus = 'draft' | 'published'

/**
 * Stores separate draft and published snapshots of a section heading
 * so that editors can prepare content without immediately pushing it
 * to the live frontend.
 *
 * @see Requirement 11.8 — separate storage for draft and published versions
 */
export interface DraftPublishState {
  /** The in-progress (unpublished) version of the section heading. */
  draft: RichTextSectionHeading | null
  /** The currently live version of the section heading. */
  published: RichTextSectionHeading | null
  /** Whether the content is in draft or published state. */
  status: PublishStatus
}

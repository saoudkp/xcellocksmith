/**
 * Content validation for Rich_Text_Field (Lexical JSON) before persistence.
 *
 * Validates that the Lexical JSON structure is well-formed before saving
 * to prevent corrupted or invalid data from being persisted.
 *
 * @see Requirements 9.2, 9.3
 */

import type {
  LexicalJSON,
  LexicalRootNode,
  LexicalElementNode,
  LexicalInlineNode,
  RichTextSectionHeading,
} from '../types/sectionEditor'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result of a content validation check. */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ---------------------------------------------------------------------------
// Internal validators
// ---------------------------------------------------------------------------

/**
 * Validates a single text node has the required fields.
 */
function validateTextNode(node: LexicalInlineNode, path: string): string[] {
  const errors: string[] = []

  if (node.type === 'text') {
    if (typeof node.text !== 'string') {
      errors.push(`${path}: text node is missing the "text" field or it is not a string`)
    }
    if (node.version == null) {
      errors.push(`${path}: text node is missing the "version" field`)
    }
  } else if (node.type === 'linebreak') {
    // linebreak nodes only need type and version
    if (node.version == null) {
      errors.push(`${path}: linebreak node is missing the "version" field`)
    }
  } else {
    errors.push(`${path}: unknown inline node type "${(node as Record<string, unknown>).type}"`)
  }

  return errors
}

/**
 * Validates a block-level element node (paragraph, heading, etc.).
 */
function validateElementNode(node: LexicalElementNode, path: string): string[] {
  const errors: string[] = []

  if (!node.type || typeof node.type !== 'string') {
    errors.push(`${path}: element node is missing a valid "type" field`)
    return errors
  }

  if (!Array.isArray(node.children)) {
    errors.push(`${path}: element node "${node.type}" is missing a "children" array`)
    return errors
  }

  node.children.forEach((child, i) => {
    errors.push(...validateTextNode(child, `${path}.children[${i}]`))
  })

  return errors
}

/**
 * Validates the root node of a Lexical JSON structure.
 */
function validateRootNode(root: LexicalRootNode, path: string): string[] {
  const errors: string[] = []

  if (root.type !== 'root') {
    errors.push(`${path}: root node must have type "root", got "${root.type}"`)
    return errors
  }

  if (!Array.isArray(root.children)) {
    errors.push(`${path}: root node is missing a "children" array`)
    return errors
  }

  root.children.forEach((child, i) => {
    errors.push(...validateElementNode(child, `${path}.children[${i}]`))
  })

  return errors
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validates a single LexicalJSON value.
 *
 * Checks that the structure has a root node with a children array,
 * and that text nodes contain the required fields (type, text, version).
 *
 * Returns `{ valid: true, errors: [] }` for `null` values since
 * null is a valid "empty" state for optional fields.
 */
export function validateLexicalJSON(
  json: LexicalJSON | null,
  fieldName: string,
): ValidationResult {
  if (json === null) {
    return { valid: true, errors: [] }
  }

  const errors: string[] = []

  if (typeof json !== 'object') {
    return { valid: false, errors: [`${fieldName}: expected an object, got ${typeof json}`] }
  }

  if (!json.root) {
    return { valid: false, errors: [`${fieldName}: missing "root" property`] }
  }

  errors.push(...validateRootNode(json.root, `${fieldName}.root`))

  return { valid: errors.length === 0, errors }
}

/**
 * Validates an entire `RichTextSectionHeading` before persistence.
 *
 * Checks each field (heading, subheading, accent) for valid Lexical JSON
 * structure. Returns a combined validation result with descriptive errors.
 *
 * @see Requirement 9.2 — validate Rich_Text_Field content before saving
 * @see Requirement 9.3 — display descriptive error messages for invalid content
 */
export function validateSectionContent(
  data: RichTextSectionHeading,
): ValidationResult {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Section content is missing or not an object'] }
  }

  const headingResult = validateLexicalJSON(data.heading, 'heading')
  const subheadingResult = validateLexicalJSON(data.subheading, 'subheading')
  const accentResult = validateLexicalJSON(data.accent, 'accent')

  errors.push(...headingResult.errors, ...subheadingResult.errors, ...accentResult.errors)

  return { valid: errors.length === 0, errors }
}

'use client'

/**
 * SectionEditorView — Unified custom admin view that composes all section
 * heading editor sub-components into a single editing interface.
 *
 * Manages state for the selected section, loads/saves data to the correct
 * Payload global, and wires up the draft/publish workflow with toast
 * notifications.
 *
 * @see Requirements 1.3, 2.8, 6.2, 6.5, 9.1
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import SectionSelector, { SECTION_OPTIONS } from './SectionSelector'
import type { SectionOption } from './SectionSelector'
import SectionHeadingEditor from './SectionHeadingEditor'
import DraftPublishControls from './DraftPublishControls'
import Toast from './Toast'
import type {
  LexicalJSON,
  PublishStatus,
  RichTextSectionHeading,
  SectionFieldSchema,
} from '../types/sectionEditor'
import { loadSectionContent, saveDraft, publishContent } from '../utils/sectionPersistence'
import type { GlobalSlug } from '../utils/sectionPersistence'

// ---------------------------------------------------------------------------
// Section field schema map — defines which optional fields each section
// supports. Only contact and services show the icon picker.
// @see Requirement 4.1
// ---------------------------------------------------------------------------

const SECTION_FIELD_SCHEMAS: Record<string, SectionFieldSchema> = {
  reviews: {},
  gallery: {},
  quote: {},
  vehicleVerifier: {},
  team: {},
  serviceArea: {},
  faq: {},
  contact: { icon: true },
  services: { icon: true },
}

// ---------------------------------------------------------------------------
// Toast state helper
// ---------------------------------------------------------------------------

interface ToastState {
  message: string
  type: 'success' | 'error'
  visible: boolean
}

const TOAST_HIDDEN: ToastState = { message: '', type: 'success', visible: false }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SectionEditorView: React.FC = () => {
  // -- Section selection state ------------------------------------------------
  const [selectedOption, setSelectedOption] = useState<SectionOption>(SECTION_OPTIONS[0])

  // -- Section data loaded from the API ---------------------------------------
  const [sectionData, setSectionData] = useState<Record<string, unknown> | null>(null)
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('draft')
  const [isLoading, setIsLoading] = useState(false)

  // -- Editor content tracked via onChange callbacks ---------------------------
  const headingRef = useRef<LexicalJSON | null>(null)
  const subheadingRef = useRef<LexicalJSON | null>(null)
  const iconRef = useRef<string>('')
  const iconColorRef = useRef<string>('#ffffff')

  // -- Unsaved changes tracking -----------------------------------------------
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // -- Saving state -----------------------------------------------------------
  const [isSaving, setIsSaving] = useState(false)

  // -- Toast notifications ----------------------------------------------------
  const [toast, setToast] = useState<ToastState>(TOAST_HIDDEN)

  // ---------------------------------------------------------------------------
  // Load section content on mount and when the selected section changes
  // ---------------------------------------------------------------------------

  const loadContent = useCallback(async (option: SectionOption) => {
    setIsLoading(true)
    setHasUnsavedChanges(false)

    try {
      const result = await loadSectionContent(option.global, option.key)

      if (result.error && !result.content) {
        setToast({ message: result.error, type: 'error', visible: true })
      }

      // Build a flat data record the SectionHeadingEditor can consume.
      // The content object has heading/subheading as LexicalJSON; we also
      // need to surface the raw section group data for icon/color fields.
      const content = result.content
      const data: Record<string, unknown> = {}

      if (content) {
        data.richHeading = content.heading
        // Map subheading to the correct field name per global slug
        if (option.global === 'services-settings') {
          data.richDescription = content.subheading
        } else {
          data.richSubheading = content.subheading
        }
      }

      setSectionData(data)
      setPublishStatus(result.status)

      // Seed refs with loaded content so save operations have data even if
      // the user hasn't typed anything yet.
      headingRef.current = content?.heading ?? null
      subheadingRef.current = content?.subheading ?? null
    } catch {
      setToast({ message: 'Failed to load section content.', type: 'error', visible: true })
      setSectionData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContent(selectedOption)
  }, [selectedOption, loadContent])

  // ---------------------------------------------------------------------------
  // Section selection handler
  // ---------------------------------------------------------------------------

  const handleSectionChange = useCallback((option: SectionOption) => {
    setSelectedOption(option)
  }, [])

  // ---------------------------------------------------------------------------
  // Editor change handlers — track current content in refs
  // ---------------------------------------------------------------------------

  const handleHeadingChange = useCallback((json: LexicalJSON) => {
    headingRef.current = json
    setHasUnsavedChanges(true)
  }, [])

  const handleSubheadingChange = useCallback((json: LexicalJSON) => {
    subheadingRef.current = json
    setHasUnsavedChanges(true)
  }, [])

  const handleIconChange = useCallback((iconName: string) => {
    iconRef.current = iconName
    setHasUnsavedChanges(true)
    // Update sectionData so the editor re-renders with the new icon
    setSectionData((prev) => (prev ? { ...prev, icon: iconName } : prev))
  }, [])

  const handleIconColorChange = useCallback((color: string) => {
    iconColorRef.current = color
    setHasUnsavedChanges(true)
    setSectionData((prev) => (prev ? { ...prev, color } : prev))
  }, [])

  // ---------------------------------------------------------------------------
  // Build the RichTextSectionHeading payload for persistence
  // ---------------------------------------------------------------------------

  const buildPayload = useCallback((): RichTextSectionHeading => {
    return {
      heading: headingRef.current,
      subheading: subheadingRef.current,
      accent: null,
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Save Draft handler
  // ---------------------------------------------------------------------------

  const handleSaveDraft = useCallback(async () => {
    setIsSaving(true)
    try {
      const result = await saveDraft(
        selectedOption.global as GlobalSlug,
        selectedOption.key,
        buildPayload(),
      )
      if (result.success) {
        setPublishStatus('draft')
        setHasUnsavedChanges(false)
        setToast({ message: 'Draft saved successfully.', type: 'success', visible: true })
      } else {
        setToast({
          message: result.error ?? 'Failed to save draft.',
          type: 'error',
          visible: true,
        })
      }
    } catch {
      setToast({ message: 'An unexpected error occurred while saving.', type: 'error', visible: true })
    } finally {
      setIsSaving(false)
    }
  }, [selectedOption, buildPayload])

  // ---------------------------------------------------------------------------
  // Publish handler
  // ---------------------------------------------------------------------------

  const handlePublish = useCallback(async () => {
    setIsSaving(true)
    try {
      const result = await publishContent(
        selectedOption.global as GlobalSlug,
        selectedOption.key,
        buildPayload(),
      )
      if (result.success) {
        setPublishStatus('published')
        setHasUnsavedChanges(false)
        setToast({ message: 'Content published successfully.', type: 'success', visible: true })
      } else {
        setToast({
          message: result.error ?? 'Failed to publish content.',
          type: 'error',
          visible: true,
        })
      }
    } catch {
      setToast({ message: 'An unexpected error occurred while publishing.', type: 'error', visible: true })
    } finally {
      setIsSaving(false)
    }
  }, [selectedOption, buildPayload])

  // ---------------------------------------------------------------------------
  // Toast dismiss
  // ---------------------------------------------------------------------------

  const handleToastClose = useCallback(() => {
    setToast(TOAST_HIDDEN)
  }, [])

  // ---------------------------------------------------------------------------
  // Resolve field schema for the selected section
  // ---------------------------------------------------------------------------

  const fieldSchema = SECTION_FIELD_SCHEMAS[selectedOption.key]

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      style={{
        maxWidth: 860,
        margin: '0 auto',
        padding: '24px 16px',
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--theme-text, #fff)',
          marginBottom: 20,
        }}
      >
        Section Heading Editor
      </h2>

      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={handleToastClose}
      />

      {/* Section selector dropdown */}
      <SectionSelector value={selectedOption.key} onChange={handleSectionChange} />

      {/* Draft / Publish controls */}
      <DraftPublishControls
        status={publishStatus}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isSaving={isSaving}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            color: 'var(--theme-elevation-400, #888)',
            fontSize: 14,
          }}
        >
          Loading section content…
        </div>
      )}

      {/* WYSIWYG editor — includes heading/subheading editors, icon picker, and live preview */}
      {!isLoading && (
        <SectionHeadingEditor
          key={selectedOption.key}
          sectionKey={selectedOption.key}
          globalSlug={selectedOption.global}
          sectionData={sectionData}
          fieldSchema={fieldSchema}
          onHeadingChange={handleHeadingChange}
          onSubheadingChange={handleSubheadingChange}
          onIconChange={handleIconChange}
          onIconColorChange={handleIconColorChange}
        />
      )}
    </div>
  )
}

export default SectionEditorView

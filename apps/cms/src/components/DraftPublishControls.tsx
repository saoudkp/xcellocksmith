'use client'

/**
 * DraftPublishControls — WordPress-style draft/publish toolbar for section
 * heading content.
 *
 * Renders a status badge (Draft / Published), a "changes pending" indicator
 * when draft content differs from published content, and Save Draft / Publish
 * action buttons with loading states.
 *
 * @see Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.10
 */

import React from 'react'
import type { PublishStatus } from '../types/sectionEditor'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DraftPublishControlsProps {
  /** Current publish status of the section content. */
  status: PublishStatus
  /** Whether the in-editor content differs from the last saved version. */
  hasUnsavedChanges: boolean
  /** Callback to save content as a draft (does not affect frontend). */
  onSaveDraft: () => void
  /** Callback to publish content (updates frontend). */
  onPublish: () => void
  /** Optional callback to open draft content in a preview panel. @see Requirements 11.6, 11.7 */
  onPreview?: () => void
  /** Whether a save or publish operation is currently in progress. */
  isSaving: boolean
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<PublishStatus, React.CSSProperties> = {
  draft: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 9999,
    background: 'rgba(234, 179, 8, 0.15)',
    color: '#eab308',
    border: '1px solid rgba(234, 179, 8, 0.3)',
  },
  published: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 9999,
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
}

const btnBase: React.CSSProperties = {
  padding: '6px 14px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 6,
  cursor: 'pointer',
  border: '1px solid var(--theme-elevation-150, #555)',
  background: 'var(--theme-elevation-100, #333)',
  color: 'var(--theme-text, #fff)',
  lineHeight: 1.4,
  transition: 'background 0.15s, opacity 0.15s',
}

const publishBtn: React.CSSProperties = {
  ...btnBase,
  background: '#22c55e',
  borderColor: '#16a34a',
  color: '#fff',
}

const previewBtn: React.CSSProperties = {
  ...btnBase,
  background: 'transparent',
  borderColor: '#3b82f6',
  color: '#3b82f6',
}

const pendingIndicator: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  fontSize: 12,
  color: '#f59e0b',
  fontWeight: 500,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DraftPublishControls: React.FC<DraftPublishControlsProps> = ({
  status,
  hasUnsavedChanges,
  onSaveDraft,
  onPublish,
  onPreview,
  isSaving,
}) => {
  const statusLabel = status === 'draft' ? 'Draft' : 'Published'
  const statusDot = status === 'draft' ? '#eab308' : '#22c55e'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderRadius: 8,
        border: '1px solid var(--theme-elevation-150, #555)',
        background: 'var(--theme-elevation-50, #1e1e1e)',
        marginBottom: 16,
      }}
    >
      {/* Left side — status badge + changes indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={STATUS_STYLES[status]}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusDot,
              display: 'inline-block',
            }}
          />
          {statusLabel}
        </span>

        {hasUnsavedChanges && (
          <span style={pendingIndicator}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Changes pending
          </span>
        )}
      </div>

      {/* Right side — action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving || !hasUnsavedChanges}
          style={{
            ...btnBase,
            opacity: isSaving || !hasUnsavedChanges ? 0.5 : 1,
            cursor: isSaving || !hasUnsavedChanges ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Saving…' : 'Save Draft'}
        </button>

        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            disabled={isSaving}
            style={{
              ...previewBtn,
              opacity: isSaving ? 0.5 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            Preview
          </button>
        )}

        <button
          type="button"
          onClick={onPublish}
          disabled={isSaving}
          style={{
            ...publishBtn,
            opacity: isSaving ? 0.5 : 1,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? 'Publishing…' : 'Publish'}
        </button>
      </div>
    </div>
  )
}

export default DraftPublishControls

'use client'

/**
 * Toast — Minimal notification component for save/publish feedback.
 *
 * Displays a small notification bar at the top of the editor area that
 * auto-dismisses after 3 seconds. Green for success, red for error.
 *
 * @see Requirements 9.3, 9.6
 */

import React, { useEffect } from 'react'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ToastProps {
  /** The message to display in the notification. */
  message: string
  /** Visual style: green for success, red for error. */
  type: 'success' | 'error'
  /** Whether the toast is currently visible. */
  visible: boolean
  /** Callback to dismiss the toast. */
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const baseStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  transition: 'opacity 0.2s ease',
  marginBottom: 12,
}

const typeStyles: Record<'success' | 'error', React.CSSProperties> = {
  success: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Toast: React.FC<ToastProps> = ({ message, type, visible, onClose }) => {
  useEffect(() => {
    if (!visible) return

    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div style={{ ...baseStyle, ...typeStyles[type] }} role="status" aria-live="polite">
      <span>
        {type === 'success' ? '✓' : '✕'}
      </span>
      <span>{message}</span>
    </div>
  )
}

export default Toast

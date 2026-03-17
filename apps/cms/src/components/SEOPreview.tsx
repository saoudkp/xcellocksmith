'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'

/**
 * SEO Preview component for Payload CMS admin UI.
 * Renders a Google-style search result preview using the current document's
 * seoTitle and seoDescription field values in real-time.
 */
export const SEOPreview: React.FC = () => {
  const seoTitle = useFormFields(([fields]) => fields['seoTitle']?.value as string | undefined)
  const seoDescription = useFormFields(
    ([fields]) => fields['seoDescription']?.value as string | undefined,
  )

  const displayTitle = seoTitle || 'Page Title'
  const displayDescription = seoDescription || 'No meta description set.'

  return (
    <div style={{ marginBottom: '24px' }}>
      <p
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--theme-elevation-500, #888)',
          marginBottom: '8px',
        }}
      >
        SEO Preview
      </p>
      <div
        style={{
          background: 'var(--theme-elevation-0, #fff)',
          border: '1px solid var(--theme-elevation-150, #ddd)',
          borderRadius: '8px',
          padding: '16px',
          maxWidth: '600px',
        }}
      >
        <p
          style={{
            fontSize: '1.125rem',
            color: '#1a0dab',
            margin: '0 0 4px',
            textDecoration: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayTitle}
        </p>
        <p
          style={{
            fontSize: '0.85rem',
            color: '#4d5156',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {displayDescription}
        </p>
      </div>
    </div>
  )
}

export default SEOPreview

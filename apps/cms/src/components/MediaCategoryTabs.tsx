'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation.js'

interface TabDef {
  label: string
  value: string
  description: string
}

const TABS: TabDef[] = [
  { label: 'All', value: '', description: 'All uploaded media files across every section' },
  { label: 'Before & After Gallery', value: 'gallery', description: 'Before & after project photos — Residential, Commercial, Automotive categories' },
  { label: 'Services', value: 'services', description: 'Service hero images and service category banners' },
  { label: 'Team', value: 'team', description: 'Team member photos and certification documents' },
  { label: 'Hero / Banners', value: 'hero', description: 'Homepage hero section background and banner images' },
  { label: 'Branding', value: 'branding', description: 'Logos, favicons, and brand assets' },
  { label: 'Vehicles', value: 'vehicles', description: 'Vehicle make logos for the compatibility checker' },
  { label: 'Quotes', value: 'quotes', description: 'Photos attached by customers in quote requests' },
  { label: 'Uncategorized', value: 'uncategorized', description: 'Media not yet assigned to a section' },
]

const MediaCategoryTabs: React.FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Detect if we're inside a Payload drawer (relationship field picker).
  // In a drawer, the pathname won't be /admin/collections/media — it'll be
  // the parent document's path. Don't render tabs in drawers to avoid
  // navigation issues that freeze the app.
  const isMediaListPage = pathname?.includes('/collections/media')
  if (!isMediaListPage) return null

  const currentCategory = searchParams.get('where[mediaCategory][equals]') || ''

  const handleTabClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('where[mediaCategory][equals]')
    params.delete('page')

    if (value) {
      params.set('where[mediaCategory][equals]', value)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const activeTab = TABS.find((t) => t.value === currentCategory)

  return (
    <div style={{ padding: '12px 0 4px' }}>
      <div
        style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--theme-elevation-150)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = currentCategory === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabClick(tab.value)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: isActive
                  ? '2px solid var(--theme-elevation-500)'
                  : '1px solid var(--theme-elevation-250)',
                background: isActive ? 'var(--theme-elevation-100)' : 'transparent',
                color: 'var(--theme-text)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      {activeTab && (
        <p
          style={{
            margin: '8px 0 4px',
            fontSize: '13px',
            color: 'var(--theme-elevation-600)',
            fontStyle: 'italic',
          }}
        >
          {activeTab.description}
        </p>
      )}
    </div>
  )
}

export default MediaCategoryTabs

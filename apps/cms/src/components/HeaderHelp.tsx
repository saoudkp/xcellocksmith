'use client'

import React, { useState, useRef, useEffect } from 'react'

const helpSections = [
  {
    title: 'Getting Started',
    content: 'Use the sidebar to navigate. Edit services, manage leads, update business info in Site Settings, and add gallery photos.',
  },
  {
    title: 'Editing Services',
    content: 'Click Services in the sidebar, select a service, edit the tabs (Basic Info, Content, SEO). SEO is auto-generated for you.',
  },
  {
    title: 'Managing Leads',
    content: 'Quote Requests shows incoming leads. Update status: New → Contacted → Quoted → Won/Lost. The pipeline on the dashboard tracks progress.',
  },
  {
    title: 'SEO is Automatic',
    content: 'When you save a service or area, SEO title and description are generated automatically. No action needed from you.',
  },
  {
    title: 'Homepage Layout',
    content: 'Go to Homepage Layout under Globals. Drag sections to reorder, toggle visibility, and override headings.',
  },
  {
    title: 'Gallery Photos',
    content: 'Go to Gallery Items, click Create New, upload before/after images, select a category, and save.',
  },
  {
    title: 'Slugs (URLs)',
    content: 'Slugs are auto-generated from titles. They create the URL for each page. You do not need to edit them.',
  },
]

export const HeaderHelp: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="xcel-header-help" ref={ref}>
      <button
        className="xcel-header-help-btn"
        onClick={() => setOpen(!open)}
        type="button"
        title="Help & Documentation"
        aria-label="Help and Documentation"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="xcel-header-help-label">Help</span>
      </button>

      {open && (
        <div className="xcel-header-help-dropdown">
          <div className="xcel-header-help-dropdown-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Help &amp; Documentation</span>
          </div>
          <div className="xcel-header-help-dropdown-body">
            {helpSections.map((section, idx) => (
              <div key={idx} className="xcel-header-help-item">
                <button
                  className={`xcel-header-help-item-trigger ${activeIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
                  type="button"
                >
                  <span>{section.title}</span>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: activeIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {activeIdx === idx && (
                  <div className="xcel-header-help-item-content">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HeaderHelp

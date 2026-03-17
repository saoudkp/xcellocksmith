'use client'

import React, { useState } from 'react'

interface Section {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

const sections: Section[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    content: (
      <div>
        <p>Welcome to the Xcel Locksmith Dashboard. Here is a quick overview of what you can do:</p>
        <ul>
          <li>Manage your <strong>services</strong> — edit pricing, descriptions, and images for all 29 locksmith services</li>
          <li>Track <strong>quote requests</strong> from customers and update their status as you work through leads</li>
          <li>Update your <strong>business info</strong>, phone number, hours, and address in Site Settings</li>
          <li>Add <strong>before/after photos</strong> to the gallery to showcase your work</li>
          <li>Manage <strong>customer reviews</strong> — approve, feature, or hide them</li>
          <li>Control which <strong>service areas</strong> you cover</li>
          <li>Reorder <strong>homepage sections</strong> by dragging them in Homepage Layout</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'editing-services',
    title: 'Editing Services',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    content: (
      <div>
        <p>To edit a service:</p>
        <ol>
          <li>Click <strong>Services</strong> in the left sidebar</li>
          <li>Click on the service you want to edit</li>
          <li>You will see tabs: <strong>Basic Info</strong>, <strong>Detailed Content</strong>, and <strong>SEO</strong></li>
          <li>Edit the title, price, description, or upload a new hero image</li>
          <li>Add benefits (selling points) that appear as a checklist</li>
          <li>Click <strong>Save</strong> when done — changes go live immediately</li>
        </ol>
        <p>The <strong>SEO tab</strong> is auto-filled for you. You do not need to touch it unless you want custom text.</p>
      </div>
    ),
  },
  {
    id: 'managing-leads',
    title: 'Managing Leads',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    content: (
      <div>
        <p>When a customer submits a quote request on your website, it appears here automatically.</p>
        <ol>
          <li>Go to <strong>Quote Requests</strong> in the sidebar</li>
          <li>New leads show up with status <strong>New</strong></li>
          <li>Click on a lead to see their details and update the status:</li>
        </ol>
        <ul>
          <li><strong>New</strong> — just came in, not yet contacted</li>
          <li><strong>Contacted</strong> — you have reached out to the customer</li>
          <li><strong>Quoted</strong> — you have sent them a price quote</li>
          <li><strong>Won</strong> — the customer accepted and you completed the job</li>
          <li><strong>Lost</strong> — the customer did not proceed</li>
        </ul>
        <p>The <strong>Lead Pipeline</strong> on the dashboard shows a visual summary of all your leads.</p>
      </div>
    ),
  },
  {
    id: 'seo-explained',
    title: 'SEO (Search Engine Optimization)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    content: (
      <div>
        <p>SEO helps your website show up on Google when people search for locksmith services.</p>
        <p><strong>Good news: SEO is automatic.</strong> When you create or edit a service or service area, the system automatically generates:</p>
        <ul>
          <li><strong>SEO Title</strong> — the title that appears in Google search results</li>
          <li><strong>SEO Description</strong> — the short summary shown below the title in Google</li>
        </ul>
        <p>You can see a preview of how your page will look in Google under the <strong>SEO tab</strong> of any service.</p>
        <p>The auto-generated SEO is optimized for local search (e.g., "locksmith in Cleveland, OH") to help you rank well in your area.</p>
        <p><strong>You do not need to do anything</strong> — just focus on writing good service descriptions and the SEO takes care of itself.</p>
      </div>
    ),
  },
  {
    id: 'slugs-explained',
    title: 'What Are Slugs?',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    content: (
      <div>
        <p>A <strong>slug</strong> is the part of a web address (URL) that identifies a specific page.</p>
        <p>For example, if your service is called "Deadbolt Installation", the slug would be:</p>
        <code style={{ display: 'block', padding: '8px 12px', background: '#f1f5f9', borderRadius: '6px', margin: '8px 0', fontSize: '0.9rem' }}>
          xcellocksmith.com/services/<strong>deadbolt-installation</strong>
        </code>
        <p><strong>Slugs are auto-generated</strong> from the service name. You do not need to create or edit them manually. The system converts your title into a URL-friendly format automatically.</p>
      </div>
    ),
  },
  {
    id: 'homepage-layout',
    title: 'Reordering the Homepage',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    content: (
      <div>
        <p>You can control which sections appear on your homepage and in what order:</p>
        <ol>
          <li>Click <strong>Homepage Layout</strong> in the sidebar under Globals</li>
          <li>You will see all homepage sections listed</li>
          <li><strong>Drag and drop</strong> rows to reorder sections</li>
          <li>Uncheck <strong>Show this section</strong> to hide a section without deleting it</li>
          <li>Optionally override the heading and subheading for any section</li>
          <li>Click <strong>Save</strong> to apply changes</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'gallery',
    title: 'Adding Gallery Photos',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    content: (
      <div>
        <p>Showcase your work with before and after photos:</p>
        <ol>
          <li>Go to <strong>Gallery Items</strong> in the sidebar</li>
          <li>Click <strong>Create New</strong></li>
          <li>Give it a title (e.g., "Front Door Lock Replacement")</li>
          <li>Select the category (Residential, Commercial, or Automotive)</li>
          <li>Upload a <strong>Before Image</strong> and an <strong>After Image</strong></li>
          <li>Optionally link it to a specific service</li>
          <li>Click <strong>Save</strong></li>
        </ol>
      </div>
    ),
  },
]

export const HelpGuide: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('getting-started')

  return (
    <div className="xcel-help-section">
      <div className="xcel-stats-header">
        <h3>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Help &amp; Documentation
        </h3>
        <span className="xcel-stats-subtitle">Learn how to use your dashboard</span>
      </div>

      <div className="xcel-help-accordion">
        {sections.map((section) => {
          const isOpen = openSection === section.id
          return (
            <div key={section.id} className={`xcel-help-item ${isOpen ? 'xcel-help-item--open' : ''}`}>
              <button
                className="xcel-help-trigger"
                onClick={() => setOpenSection(isOpen ? null : section.id)}
                type="button"
              >
                <span className="xcel-help-trigger-left">
                  {section.icon}
                  <span>{section.title}</span>
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isOpen && (
                <div className="xcel-help-content">
                  {section.content}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HelpGuide

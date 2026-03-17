'use client'

import React, { useEffect, useState } from 'react'

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const
type Status = (typeof STATUSES)[number]

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  new: {
    label: 'New', color: '#3b82f6',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  },
  contacted: {
    label: 'Contacted', color: '#d97706',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  },
  quoted: {
    label: 'Quoted', color: '#6366f1',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  won: {
    label: 'Won', color: '#059669',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  },
  lost: {
    label: 'Lost', color: '#dc2626',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  },
}

export const LeadPipeline: React.FC = () => {
  const [counts, setCounts] = useState<Record<Status, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPipeline() {
      try {
        const results = await Promise.all(
          STATUSES.map(async (status) => {
            const res = await fetch(`/api/quote-requests?limit=0&depth=0&where[status][equals]=${status}`)
            const data = await res.json()
            return [status, data.totalDocs ?? 0] as [Status, number]
          }),
        )
        setCounts(Object.fromEntries(results) as Record<Status, number>)
      } catch { setCounts(null) }
      finally { setLoading(false) }
    }
    fetchPipeline()
  }, [])

  if (loading || !counts) return null
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="xcel-pipeline-section">
      <h3 className="xcel-section-title">Lead Pipeline <span className="xcel-section-badge">{total}</span></h3>
      {total > 0 && (
        <div className="xcel-pipeline-bar">
          {STATUSES.map((s) => {
            const pct = (counts[s] / total) * 100
            return pct > 0 ? <div key={s} className="xcel-pipeline-bar-seg" style={{ width: `${pct}%`, backgroundColor: STATUS_CONFIG[s].color }} title={`${STATUS_CONFIG[s].label}: ${counts[s]}`} /> : null
          })}
        </div>
      )}
      <div className="xcel-pipeline-grid">
        {STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s]
          return (
            <div key={s} className="xcel-pipeline-card">
              <div className="xcel-pipeline-card-icon" style={{ color: cfg.color }}>{cfg.icon}</div>
              <span className="xcel-pipeline-card-count">{counts[s]}</span>
              <span className="xcel-pipeline-card-label">{cfg.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LeadPipeline

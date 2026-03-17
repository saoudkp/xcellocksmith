'use client'

import React, { useEffect, useState } from 'react'

interface Stats {
  totalQuoteRequests: number
  totalServices: number
  totalServiceAreas: number
  averageRating: number | null
  totalReviews: number
  totalGalleryItems: number
}

const CARDS: { key: keyof Stats; label: string; color: string; icon: React.ReactNode }[] = [
  {
    key: 'totalQuoteRequests',
    label: 'Quote Requests',
    color: '#dc2626',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    key: 'totalServices',
    label: 'Active Services',
    color: '#3b82f6',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    key: 'totalServiceAreas',
    label: 'Service Areas',
    color: '#059669',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    key: 'averageRating',
    label: 'Avg Rating',
    color: '#d97706',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    key: 'totalReviews',
    label: 'Reviews',
    color: '#6366f1',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    key: 'totalGalleryItems',
    label: 'Gallery Projects',
    color: '#7c3aed',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
]

export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [quotesRes, servicesRes, areasRes, reviewsRes, galleryRes] = await Promise.all([
          fetch('/api/quote-requests?limit=0&depth=0'),
          fetch('/api/services?limit=0&depth=0'),
          fetch('/api/service-areas?limit=0&depth=0'),
          fetch('/api/reviews?limit=0&depth=0&where[isApproved][equals]=true'),
          fetch('/api/gallery-items?limit=0&depth=0'),
        ])
        const [quotes, services, areas, reviews, gallery] = await Promise.all([
          quotesRes.json(), servicesRes.json(), areasRes.json(), reviewsRes.json(), galleryRes.json(),
        ])
        let averageRating: number | null = null
        if (reviews.totalDocs > 0) {
          const allReviewsRes = await fetch(`/api/reviews?limit=${reviews.totalDocs}&depth=0&where[isApproved][equals]=true`)
          const allReviews = await allReviewsRes.json()
          const ratings = allReviews.docs.map((r: { starRating?: number }) => r.starRating).filter((r: number | undefined): r is number => typeof r === 'number')
          if (ratings.length > 0) averageRating = Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
        }
        setStats({ totalQuoteRequests: quotes.totalDocs ?? 0, totalServices: services.totalDocs ?? 0, totalServiceAreas: areas.totalDocs ?? 0, averageRating, totalReviews: reviews.totalDocs ?? 0, totalGalleryItems: gallery.totalDocs ?? 0 })
      } catch { setStats(null) }
      finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="xcel-stats-loading"><div className="xcel-stats-spinner" /><span>Loading dashboard...</span></div>
  if (!stats) return null

  return (
    <div className="xcel-stats-section">
      <h3 className="xcel-section-title">Overview</h3>
      <div className="xcel-stats-grid">
        {CARDS.map((card) => {
          const value = stats[card.key]
          const display = card.key === 'averageRating' ? (value !== null ? `${value}/5` : '—') : String(value ?? 0)
          return (
            <div key={card.key} className="xcel-stat-card">
              <div className="xcel-stat-icon" style={{ color: card.color, backgroundColor: `${card.color}10` }}>{card.icon}</div>
              <div className="xcel-stat-content">
                <span className="xcel-stat-value">{display}</span>
                <span className="xcel-stat-label">{card.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DashboardStats

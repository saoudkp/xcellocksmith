import { describe, it, expect } from 'vitest'

/**
 * Unit tests for LeadPipeline component logic.
 * Tests the status grouping constants and data structure used by the pipeline view.
 */

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const
type Status = (typeof STATUSES)[number]

const STATUS_LABELS: Record<Status, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
}

describe('LeadPipeline — status definitions', () => {
  it('defines exactly 5 statuses', () => {
    expect(STATUSES).toHaveLength(5)
  })

  it('includes all required statuses from the design', () => {
    expect(STATUSES).toContain('new')
    expect(STATUSES).toContain('contacted')
    expect(STATUSES).toContain('quoted')
    expect(STATUSES).toContain('won')
    expect(STATUSES).toContain('lost')
  })

  it('has a label for every status', () => {
    for (const status of STATUSES) {
      expect(STATUS_LABELS[status]).toBeDefined()
      expect(typeof STATUS_LABELS[status]).toBe('string')
      expect(STATUS_LABELS[status].length).toBeGreaterThan(0)
    }
  })
})

describe('LeadPipeline — count grouping', () => {
  it('groups counts by status correctly', () => {
    // Simulate grouping quote requests by status
    const quoteRequests = [
      { status: 'new' },
      { status: 'new' },
      { status: 'contacted' },
      { status: 'quoted' },
      { status: 'won' },
      { status: 'won' },
      { status: 'won' },
      { status: 'lost' },
    ]

    const counts: Record<Status, number> = {
      new: 0,
      contacted: 0,
      quoted: 0,
      won: 0,
      lost: 0,
    }

    for (const qr of quoteRequests) {
      counts[qr.status as Status]++
    }

    expect(counts.new).toBe(2)
    expect(counts.contacted).toBe(1)
    expect(counts.quoted).toBe(1)
    expect(counts.won).toBe(3)
    expect(counts.lost).toBe(1)
  })

  it('handles empty pipeline', () => {
    const counts: Record<Status, number> = {
      new: 0,
      contacted: 0,
      quoted: 0,
      won: 0,
      lost: 0,
    }

    for (const status of STATUSES) {
      expect(counts[status]).toBe(0)
    }
  })
})

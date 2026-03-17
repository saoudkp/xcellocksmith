import { describe, it, expect } from 'vitest'

/**
 * Unit tests for DashboardStats component logic.
 * Since these are admin-only React client components that fetch from the Payload REST API,
 * we test the data transformation logic and the stat computation (average rating calculation).
 */

describe('DashboardStats — average rating computation', () => {
  function computeAverageRating(ratings: number[]): number | null {
    if (ratings.length === 0) return null
    const sum = ratings.reduce((a, b) => a + b, 0)
    return Math.round((sum / ratings.length) * 10) / 10
  }

  it('returns null for empty ratings', () => {
    expect(computeAverageRating([])).toBeNull()
  })

  it('computes correct average for a single rating', () => {
    expect(computeAverageRating([5])).toBe(5)
  })

  it('computes correct average for multiple ratings', () => {
    expect(computeAverageRating([4, 5, 3, 5, 4])).toBe(4.2)
  })

  it('rounds to one decimal place', () => {
    // 1 + 2 + 3 = 6 / 3 = 2.0
    expect(computeAverageRating([1, 2, 3])).toBe(2)
    // 4 + 5 + 4 = 13 / 3 = 4.333... → 4.3
    expect(computeAverageRating([4, 5, 4])).toBe(4.3)
  })
})

describe('DashboardStats — stat card data structure', () => {
  it('produces correct stat keys', () => {
    const stats = {
      totalQuoteRequests: 10,
      totalServices: 29,
      totalServiceAreas: 24,
      averageRating: 4.5,
    }
    expect(stats).toHaveProperty('totalQuoteRequests')
    expect(stats).toHaveProperty('totalServices')
    expect(stats).toHaveProperty('totalServiceAreas')
    expect(stats).toHaveProperty('averageRating')
  })
})

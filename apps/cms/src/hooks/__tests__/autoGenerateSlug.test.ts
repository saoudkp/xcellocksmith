import { describe, it, expect } from 'vitest'
import { autoGenerateSlug } from '../autoGenerateSlug'

// Helper to invoke the hook with minimal required args
function runHook(data: Record<string, unknown> | undefined) {
  return (autoGenerateSlug as Function)({
    data,
    operation: 'create',
    req: {},
    collection: { slug: 'test' },
    originalDoc: undefined,
  })
}

describe('autoGenerateSlug', () => {
  it('generates slug from name field when slug is empty', () => {
    const result = runHook({ name: 'Residential Locksmith' })
    expect(result.slug).toBe('residential-locksmith')
  })

  it('generates slug from title field when name is absent', () => {
    const result = runHook({ title: 'Lock Rekeying Service' })
    expect(result.slug).toBe('lock-rekeying-service')
  })

  it('prefers name over title when both are present', () => {
    const result = runHook({ name: 'From Name', title: 'From Title' })
    expect(result.slug).toBe('from-name')
  })

  it('does not overwrite an existing slug', () => {
    const result = runHook({ name: 'Something Else', slug: 'existing-slug' })
    expect(result.slug).toBe('existing-slug')
  })

  it('converts to lowercase', () => {
    const result = runHook({ name: 'UPPER CASE Name' })
    expect(result.slug).toBe('upper-case-name')
  })

  it('replaces special characters with hyphens', () => {
    const result = runHook({ name: 'Lock & Key (Service)' })
    expect(result.slug).toBe('lock-key-service')
  })

  it('collapses consecutive hyphens', () => {
    const result = runHook({ name: 'Lock   &   Key' })
    expect(result.slug).toBe('lock-key')
  })

  it('trims leading and trailing hyphens', () => {
    const result = runHook({ name: '  -Hello World-  ' })
    expect(result.slug).toBe('hello-world')
  })

  it('returns data unchanged when slug is already set', () => {
    const data = { name: 'Test', slug: 'my-slug', extra: 'field' }
    const result = runHook(data)
    expect(result).toEqual(data)
  })

  it('returns data unchanged when no name or title is present', () => {
    const data = { description: 'No name or title here' }
    const result = runHook(data)
    expect(result.slug).toBeUndefined()
  })

  it('returns undefined data as-is', () => {
    const result = runHook(undefined)
    expect(result).toBeUndefined()
  })

  it('handles empty string name gracefully', () => {
    const result = runHook({ name: '' })
    // empty string is falsy, so no source found
    expect(result.slug).toBeUndefined()
  })

  it('is deterministic - same input always produces same slug', () => {
    const input = { name: 'Emergency Lock Repair' }
    const result1 = runHook(input)
    const result2 = runHook(input)
    expect(result1.slug).toBe(result2.slug)
    expect(result1.slug).toBe('emergency-lock-repair')
  })
})

import { cn } from '../utils'

describe('cn (classnames utility)', () => {
  it('merges single class', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toContain('foo')
    expect(cn('foo', 'bar')).toContain('bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toContain('visible')
    expect(cn('base', false && 'hidden', true && 'visible')).not.toContain('hidden')
  })
})

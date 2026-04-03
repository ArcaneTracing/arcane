import {
  buildSpanTree,
  formatDuration,
  formatTimestamp,
  getSpanIcon,
} from '../trace-viewer-utils'
import type { NormalizedSpan } from '@/types/traces'

function makeSpan(
  spanId: string,
  parentSpanId: string | null,
  startTime: number,
  endTime: number,
  name = 'span'
): NormalizedSpan {
  return {
    spanId,
    parentSpanId,
    name,
    startTime,
    endTime,
    duration: endTime - startTime,
    attributes: [],
    events: [],
    resource: {},
  }
}

describe('trace-viewer-utils', () => {
  describe('getSpanIcon', () => {
    it('returns Workflow icon for any span name', () => {
      const icon = getSpanIcon('http.request')
      expect(icon).toBeDefined()
      expect(typeof icon).toBe('function')
    })
  })

  describe('buildSpanTree', () => {
    it('returns empty array for empty spans', () => {
      expect(buildSpanTree([])).toEqual([])
    })

    it('returns single root when one span has no parent', () => {
      const spans = [makeSpan('s1', null, 0, 10)]
      const tree = buildSpanTree(spans)
      expect(tree).toHaveLength(1)
      expect(tree[0].spanId).toBe('s1')
      expect(tree[0].children).toEqual([])
    })

    it('builds parent-child hierarchy', () => {
      const spans = [
        makeSpan('root', null, 0, 100),
        makeSpan('child1', 'root', 10, 50),
        makeSpan('child2', 'root', 51, 90),
      ]
      const tree = buildSpanTree(spans)
      expect(tree).toHaveLength(1)
      expect(tree[0].spanId).toBe('root')
      expect(tree[0].children).toHaveLength(2)
      expect(tree[0].children![0].spanId).toBe('child1')
      expect(tree[0].children![1].spanId).toBe('child2')
    })

    it('sorts children by start time', () => {
      const spans = [
        makeSpan('root', null, 0, 100),
        makeSpan('late', 'root', 60, 90),
        makeSpan('early', 'root', 10, 50),
      ]
      const tree = buildSpanTree(spans)
      expect(tree[0].children![0].spanId).toBe('early')
      expect(tree[0].children![1].spanId).toBe('late')
    })

    it('treats spans with unknown parent as roots', () => {
      const spans = [
        makeSpan('s1', 'missing', 0, 10),
        makeSpan('s2', null, 20, 30),
      ]
      const tree = buildSpanTree(spans)
      expect(tree).toHaveLength(2)
      expect(tree[0].spanId).toBe('s1')
      expect(tree[1].spanId).toBe('s2')
    })

    it('does not mutate original spans', () => {
      const spans = [makeSpan('s1', null, 0, 10)]
      const original = spans[0]
      buildSpanTree(spans)
      expect(original.children).toBeUndefined()
    })
  })

  describe('formatDuration', () => {
    it('formats sub-millisecond as microseconds', () => {
      expect(formatDuration(0.5)).toBe('500.00μs')
      expect(formatDuration(0.001)).toBe('1.00μs')
    })

    it('formats milliseconds', () => {
      expect(formatDuration(1)).toBe('1.00ms')
      expect(formatDuration(100)).toBe('100.00ms')
      expect(formatDuration(999)).toBe('999.00ms')
    })

    it('formats seconds', () => {
      expect(formatDuration(1000)).toBe('1.00s')
      expect(formatDuration(2500)).toBe('2.50s')
    })
  })

  describe('formatTimestamp', () => {
    it('returns Unknown for null', () => {
      expect(formatTimestamp(null as unknown as string)).toBe('Unknown')
    })

    it('returns Unknown for undefined', () => {
      expect(formatTimestamp(undefined as unknown as string)).toBe('Unknown')
    })

    it('returns Invalid Date for NaN number', () => {
      expect(formatTimestamp(Number.NaN)).toBe('Invalid Date')
    })

    it('formats number as locale date string', () => {
      const ts = new Date('2024-01-15T14:30:00.123Z').getTime()
      const result = formatTimestamp(ts)
      expect(result).toMatch(/2024/)
      expect(result).toMatch(/30/)
    })

    it('returns Unknown for empty string', () => {
      expect(formatTimestamp('')).toBe('Unknown')
    })

    it('parses numeric string and formats as date', () => {
      const ts = new Date('2024-06-01T12:00:00Z').getTime()
      const result = formatTimestamp(String(ts))
      expect(result).toMatch(/2024/)
      expect(result).toMatch(/06|6/)
    })

    it('returns Invalid Date for invalid numeric string', () => {
      expect(formatTimestamp('not-a-number')).toBe('Invalid Date')
    })

    it('parses ISO date string', () => {
      const result = formatTimestamp('2024-03-20T10:15:30.456Z')
      expect(result).toMatch(/2024/)
      expect(result).toMatch(/15/)
    })
  })
})

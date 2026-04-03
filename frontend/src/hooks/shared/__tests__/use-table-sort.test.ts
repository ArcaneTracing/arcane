import { renderHook, act } from '@testing-library/react'
import { useTableSort, compareTableItemValues, compareWithDirection } from '../use-table-sort'

interface TestItem {
  id: string
  name: string
  count: number
  date: string
}

describe('compareWithDirection', () => {
  it('returns -1 when cmp < 0 and direction asc', () => {
    expect(compareWithDirection(-1, 'asc')).toBe(-1)
  })

  it('returns 1 when cmp < 0 and direction desc', () => {
    expect(compareWithDirection(-1, 'desc')).toBe(1)
  })

  it('returns 1 when cmp > 0 and direction asc', () => {
    expect(compareWithDirection(1, 'asc')).toBe(1)
  })

  it('returns -1 when cmp > 0 and direction desc', () => {
    expect(compareWithDirection(1, 'desc')).toBe(-1)
  })

  it('returns 0 when cmp is 0', () => {
    expect(compareWithDirection(0, 'asc')).toBe(0)
    expect(compareWithDirection(0, 'desc')).toBe(0)
  })
})

describe('compareTableItemValues', () => {
  it('returns negative when a < b ascending', () => {
    expect(compareTableItemValues('Alice', 'Bob', 'name', 'asc')).toBeLessThan(0)
  })

  it('returns positive when a > b ascending', () => {
    expect(compareTableItemValues('Bob', 'Alice', 'name', 'asc')).toBeGreaterThan(0)
  })

  it('returns 0 when a === b', () => {
    expect(compareTableItemValues('Alice', 'Alice', 'name', 'asc')).toBe(0)
  })

  it('reverses order for descending', () => {
    expect(compareTableItemValues('Alice', 'Bob', 'name', 'desc')).toBeGreaterThan(0)
    expect(compareTableItemValues('Bob', 'Alice', 'name', 'desc')).toBeLessThan(0)
  })

  it('compares case-insensitively for non-date string key', () => {
    expect(compareTableItemValues('alpha', 'BETA', 'name', 'asc')).toBeLessThan(0)
    expect(compareTableItemValues('BETA', 'alpha', 'name', 'asc')).toBeGreaterThan(0)
  })

  it('uses date comparison when sortKey is in dateFields', () => {
    const earlier = '2024-01-01T00:00:00Z'
    const later = '2024-12-31T00:00:00Z'
    expect(compareTableItemValues(earlier, later, 'createdAt', 'asc')).toBeLessThan(0)
    expect(compareTableItemValues(later, earlier, 'createdAt', 'asc')).toBeGreaterThan(0)
  })

  it('uses default dateFields for createdAt and updatedAt', () => {
    const earlier = '2024-01-01'
    const later = '2024-06-01'
    expect(compareTableItemValues(earlier, later, 'updatedAt', 'asc')).toBeLessThan(0)
  })

  it('treats non-date key as string', () => {
    expect(compareTableItemValues(100, 200, 'other', 'asc')).toBeLessThan(0)
  })
})

describe('useTableSort (shared)', () => {
  const items: TestItem[] = [
    { id: '1', name: 'Charlie', count: 30, date: '2024-03-15' },
    { id: '2', name: 'Alice', count: 10, date: '2024-01-15' },
    { id: '3', name: 'Bob', count: 20, date: '2024-02-15' },
  ]

  it('returns unsorted items when no sort key', () => {
    const { result } = renderHook(() => useTableSort(items))
    expect(result.current.sortedItems).toEqual(items)
    expect(result.current.sortConfig.key).toBeNull()
  })

  it('sorts by string ascending', () => {
    const { result } = renderHook(() =>
      useTableSort(items, { defaultSortKey: 'name' })
    )
    expect(result.current.sortedItems.map((i) => i.name)).toEqual([
      'Alice',
      'Bob',
      'Charlie',
    ])
  })

  it('sorts by string descending when handleSort toggles', () => {
    const { result } = renderHook(() =>
      useTableSort(items, { defaultSortKey: 'name', defaultDirection: 'asc' })
    )
    act(() => {
      result.current.handleSort('name')
    })
    expect(result.current.sortConfig.direction).toBe('desc')
    expect(result.current.sortedItems.map((i) => i.name)).toEqual([
      'Charlie',
      'Bob',
      'Alice',
    ])
  })

  it('sorts by numeric field', () => {
    const { result } = renderHook(() =>
      useTableSort(items, {
        defaultSortKey: 'count',
        numericFields: ['count'],
      })
    )
    expect(result.current.sortedItems.map((i) => i.count)).toEqual([10, 20, 30])
  })

  it('sorts by date field', () => {
    const { result } = renderHook(() =>
      useTableSort(items, {
        defaultSortKey: 'date',
        dateFields: ['date'],
      })
    )
    expect(result.current.sortedItems.map((i) => i.date)).toEqual([
      '2024-01-15',
      '2024-02-15',
      '2024-03-15',
    ])
  })

  it('uses customSort when provided', () => {
    const customSort = (
      a: TestItem,
      b: TestItem,
      key: keyof TestItem,
      direction: string
    ) => {
      const diff = String(a[key]).localeCompare(String(b[key]))
      return direction === 'asc' ? diff : -diff
    }
    const { result } = renderHook(() =>
      useTableSort(items, { defaultSortKey: 'name', customSort })
    )
    expect(result.current.sortedItems.map((i) => i.name)).toEqual([
      'Alice',
      'Bob',
      'Charlie',
    ])
  })

  it('handles null/undefined values', () => {
    const itemsWithNull: TestItem[] = [
      { id: '1', name: 'B', count: 1, date: '' },
      { id: '2', name: '', count: 2, date: '2024-01-01' },
      { id: '3', name: 'A', count: 3, date: '' },
    ]
    const { result } = renderHook(() =>
      useTableSort(itemsWithNull, { defaultSortKey: 'name' })
    )
    expect(result.current.sortedItems.length).toBe(3)
  })
})

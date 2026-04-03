import { renderHook } from '@testing-library/react'
import { useTableFilter } from '../use-table-filter'

describe('useTableFilter', () => {
  it('returns all items when search is empty', () => {
    const items = [{ name: 'a' }, { name: 'b' }]
    const { result } = renderHook(() => useTableFilter(items, ''))
    expect(result.current).toEqual(items)
  })

  it('returns all items when search is whitespace only', () => {
    const items = [{ name: 'a' }]
    const { result } = renderHook(() => useTableFilter(items, '   '))
    expect(result.current).toEqual(items)
  })

  it('filters by searchFields when provided', () => {
    const items = [
      { name: 'Alice', id: '1' },
      { name: 'Bob', id: '2' },
      { name: 'Charlie', id: '3' },
    ]
    const { result } = renderHook(() =>
      useTableFilter(items, 'alice', { searchFields: ['name'] })
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].name).toBe('Alice')
  })

  it('filters case-insensitively', () => {
    const items = [{ name: 'Test' }]
    const { result } = renderHook(() =>
      useTableFilter(items, 'test', { searchFields: ['name'] })
    )
    expect(result.current).toHaveLength(1)
  })

  it('includes item when any searchField matches', () => {
    const items = [
      { name: 'Alice', desc: 'x' },
      { name: 'Bob', desc: 'other' },
    ]
    const { result } = renderHook(() =>
      useTableFilter(items, 'alice', { searchFields: ['name', 'desc'] })
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].name).toBe('Alice')
  })

  it('excludes items when no field matches', () => {
    const items = [
      { name: 'Alice', desc: 'x' },
      { name: 'Bob', desc: 'y' },
    ]
    const { result } = renderHook(() =>
      useTableFilter(items, 'z', { searchFields: ['name', 'desc'] })
    )
    expect(result.current).toHaveLength(0)
  })

  it('uses customFilter when provided', () => {
    const items = [{ value: 10 }, { value: 20 }, { value: 30 }]
    const customFilter = (item: { value: number }, q: string) =>
      item.value >= parseInt(q, 10)
    const { result } = renderHook(() =>
      useTableFilter(items, '20', { customFilter })
    )
    expect(result.current).toHaveLength(2)
    expect(result.current.map((i) => i.value)).toEqual([20, 30])
  })

  it('searches all fields when no searchFields', () => {
    const items = [
      { a: 'foo', b: 'bar' },
      { a: 'baz', b: 'qux' },
    ]
    const { result } = renderHook(() => useTableFilter(items, 'bar'))
    expect(result.current).toHaveLength(1)
    expect(result.current[0].b).toBe('bar')
  })
})

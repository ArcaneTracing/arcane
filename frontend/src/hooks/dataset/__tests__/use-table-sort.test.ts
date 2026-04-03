import { renderHook, act } from '@testing-library/react'
import { useTableSort } from '../use-table-sort'
import type { DatasetRowResponse } from '@/types/datasets'

describe('useTableSort', () => {
  const createRow = (values: string[]): DatasetRowResponse => ({
    id: `row-${values.join('-')}`,
    values,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  it('returns unsorted rows when no sort applied', () => {
    const rows = [
      createRow(['c', '2']),
      createRow(['a', '1']),
      createRow(['b', '3']),
    ]
    const { result } = renderHook(() => useTableSort(rows, 2))
    expect(result.current.sortedRows).toEqual(rows)
    expect(result.current.sortConfig.columnIndex).toBeNull()
  })

  it('sorts by string ascending', () => {
    const rows = [
      createRow(['c']),
      createRow(['a']),
      createRow(['b']),
    ]
    const { result } = renderHook(() => useTableSort(rows, 1))
    act(() => {
      result.current.handleSort(0)
    })
    expect(result.current.sortedRows.map((r) => r.values[0])).toEqual(['a', 'b', 'c'])
    expect(result.current.sortConfig.direction).toBe('asc')
  })

  it('sorts by string descending when same column clicked again', () => {
    const rows = [
      createRow(['a']),
      createRow(['b']),
      createRow(['c']),
    ]
    const { result } = renderHook(() => useTableSort(rows, 1))
    act(() => {
      result.current.handleSort(0)
    })
    act(() => {
      result.current.handleSort(0)
    })
    expect(result.current.sortedRows.map((r) => r.values[0])).toEqual(['c', 'b', 'a'])
    expect(result.current.sortConfig.direction).toBe('desc')
  })

  it('sorts by number ascending', () => {
    const rows = [
      createRow(['10']),
      createRow(['2']),
      createRow(['100']),
    ]
    const { result } = renderHook(() => useTableSort(rows, 1))
    act(() => {
      result.current.handleSort(0)
    })
    expect(result.current.sortedRows.map((r) => r.values[0])).toEqual(['2', '10', '100'])
  })

  it('sorts by number descending', () => {
    const rows = [
      createRow(['2']),
      createRow(['10']),
      createRow(['100']),
    ]
    const { result } = renderHook(() => useTableSort(rows, 1))
    act(() => {
      result.current.handleSort(0)
    })
    act(() => {
      result.current.handleSort(0)
    })
    expect(result.current.sortedRows.map((r) => r.values[0])).toEqual(['100', '10', '2'])
  })

  it('sorts by date when values are valid date strings', () => {
    const rows = [
      createRow(['Mar 15, 2024']),
      createRow(['Jan 15, 2024']),
      createRow(['Feb 15, 2024']),
    ]
    const { result } = renderHook(() => useTableSort(rows, 1))
    act(() => {
      result.current.handleSort(0)
    })
    expect(result.current.sortedRows.map((r) => r.values[0])).toEqual(['Jan 15, 2024', 'Feb 15, 2024', 'Mar 15, 2024'])
  })

  it('handles empty values', () => {
    const rows = [
      createRow(['a', '']),
      createRow(['b', 'x']),
      createRow(['c', '']),
    ]
    const { result } = renderHook(() => useTableSort(rows, 2))
    act(() => {
      result.current.handleSort(1)
    })
    expect(result.current.sortedRows.length).toBe(3)
  })

  it('switches to asc when different column clicked', () => {
    const rows = [
      createRow(['a', '1']),
      createRow(['b', '2']),
    ]
    const { result } = renderHook(() => useTableSort(rows, 2))
    act(() => {
      result.current.handleSort(0)
    })
    act(() => {
      result.current.handleSort(1)
    })
    expect(result.current.sortConfig.columnIndex).toBe(1)
    expect(result.current.sortConfig.direction).toBe('asc')
  })
})

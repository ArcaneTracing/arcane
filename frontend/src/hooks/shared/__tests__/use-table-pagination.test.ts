import { renderHook, act } from '@testing-library/react'
import { useTablePagination } from '../use-table-pagination'

describe('useTablePagination', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 1200, writable: true })
  })

  it('returns first page of items with default page size', () => {
    const { result } = renderHook(() => useTablePagination(items))
    expect(result.current.paginatedItems).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'])
    expect(result.current.meta).toEqual({
      page: 1,
      limit: 10,
      total: 11,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    })
  })

  it('handles page change', () => {
    const { result } = renderHook(() => useTablePagination(items))
    act(() => {
      result.current.handlePageChange(2)
    })
    expect(result.current.paginatedItems).toEqual(['k'])
    expect(result.current.meta.page).toBe(2)
    expect(result.current.meta.hasNextPage).toBe(false)
    expect(result.current.meta.hasPreviousPage).toBe(true)
  })

  it('uses itemsPerPage when provided', () => {
    const { result } = renderHook(() =>
      useTablePagination(items, { itemsPerPage: 3 })
    )
    expect(result.current.paginatedItems).toEqual(['a', 'b', 'c'])
    expect(result.current.meta.limit).toBe(3)
    expect(result.current.meta.totalPages).toBe(4)
  })

  it('handles undefined items as empty array', () => {
    const { result } = renderHook(() => useTablePagination(undefined))
    expect(result.current.paginatedItems).toEqual([])
    expect(result.current.meta.total).toBe(0)
    expect(result.current.meta.totalPages).toBe(0)
  })

  it('resets to page 1 when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ deps }) => useTablePagination(items, { dependencies: deps }),
      { initialProps: { deps: ['v1'] } }
    )
    act(() => {
      result.current.handlePageChange(2)
    })
    expect(result.current.meta.page).toBe(2)
    rerender({ deps: ['v2'] })
    expect(result.current.meta.page).toBe(1)
  })
})

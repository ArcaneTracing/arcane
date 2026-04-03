import { renderHook, act } from '@testing-library/react'
import { parseTagValues, searchToState, stateToTracesListSearch, useTracesUrlState } from '../use-traces-url-state'

describe('parseTagValues', () => {
  it('returns empty array for null', () => {
    expect(parseTagValues(null)).toEqual([])
  })

  it('returns empty array for invalid JSON', () => {
    expect(parseTagValues('not-json')).toEqual([])
  })

  it('parses valid JSON array of { tag, value }', () => {
    const encoded = encodeURIComponent(JSON.stringify([{ tag: 'svc', value: 'api' }]))
    expect(parseTagValues(encoded)).toEqual([{ tag: 'svc', value: 'api' }])
  })

  it('handles multiple entries', () => {
    const encoded = encodeURIComponent(
      JSON.stringify([
        { tag: 'a', value: '1' },
        { tag: 'b', value: '2' },
      ])
    )
    expect(parseTagValues(encoded)).toEqual([
      { tag: 'a', value: '1' },
      { tag: 'b', value: '2' },
    ])
  })
})

describe('searchToState', () => {
  it('returns defaults for empty search', () => {
    const state = searchToState({})
    expect(state.startDate).toBeUndefined()
    expect(state.endDate).toBeUndefined()
    expect(state.filters.datasourceId).toBe('')
    expect(state.filters.q).toBe('')
    expect(state.filters.attributes).toBe('')
    expect(state.filters.min_duration).toBe('')
    expect(state.filters.max_duration).toBe('')
    expect(state.filters.lookback).toBe('1h')
    expect(state.filters.limit).toBe(20)
    expect(state.filters.spanName).toBe('')
  })

  it('parses start and end dates from search', () => {
    const state = searchToState({
      start: '2024-01-15T10:00:00.000Z',
      end: '2024-01-15T12:00:00.000Z',
    })
    expect(state.startDate?.toISOString()).toBe('2024-01-15T10:00:00.000Z')
    expect(state.endDate?.toISOString()).toBe('2024-01-15T12:00:00.000Z')
  })

  it('parses filters from search with attributes', () => {
    const state = searchToState({
      datasourceId: 'ds-1',
      q: 'foo',
      attributes: 'service.name=my-service span.kind=server',
      min_duration: '10ms',
      max_duration: '1s',
      lookback: '5m',
      limit: '50',
    })
    expect(state.filters.datasourceId).toBe('ds-1')
    expect(state.filters.q).toBe('foo')
    expect(state.filters.attributes).toBe('service.name=my-service span.kind=server')
    expect(state.filters.min_duration).toBe('10ms')
    expect(state.filters.max_duration).toBe('1s')
    expect(state.filters.lookback).toBe('5m')
    expect(state.filters.limit).toBe(50)
  })

  it('converts old tags format to attributes for backward compatibility', () => {
    const state = searchToState({
      tags: 'a|b',
    })
    expect(state.filters.attributes).toBe('a b')
  })

  it('prefers attributes over tags when both are present', () => {
    const state = searchToState({
      attributes: 'key=value',
      tags: 'old|format',
    })
    expect(state.filters.attributes).toBe('key=value')
  })
})

describe('stateToTracesListSearch', () => {
  it('converts state to traces list search params', () => {
    const search = stateToTracesListSearch({
      filters: {
        datasourceId: 'ds-1',
        q: 'query',
        attributes: 'a=b',
        min_duration: '10ms',
        max_duration: '1s',
        lookback: '10m',
        limit: 200,
        spanName: '',
      },
      startDate: new Date('2024-01-15T10:00:00.000Z'),
      endDate: new Date('2024-01-15T12:00:00.000Z')
    })
    expect(search.datasourceId).toBe('ds-1')
    expect(search.q).toBe('query')
    expect(search.attributes).toBe('a=b')
    expect(search.lookback).toBe('10m')
    expect(search.limit).toBe('200')
    expect(search.start).toBe('2024-01-15T10:00:00.000Z')
    expect(search.end).toBe('2024-01-15T12:00:00.000Z')
  })

  it('omits empty values', () => {
    const search = stateToTracesListSearch({
      filters: {
        datasourceId: 'ds-1',
        q: '',
        attributes: '',
        min_duration: '',
        max_duration: '',
        lookback: '1h',
        limit: 20,
        spanName: '',
      },
      startDate: undefined,
      endDate: undefined
    })
    expect(search.datasourceId).toBe('ds-1')
    expect(search.lookback).toBe('1h')
    expect(search.limit).toBe('20')
    expect(search.q).toBeUndefined()
    expect(search.start).toBeUndefined()
  })
})

describe('useTracesUrlState', () => {
  it('returns updateUrlParams and isUpdatingFromUrlRef', () => {
    const { result } = renderHook(useTracesUrlState)
    expect(typeof result.current.updateUrlParams).toBe('function')
    expect(result.current.isUpdatingFromUrlRef).toBeDefined()
    expect(result.current.isUpdatingFromUrlRef.current).toBe(false)
  })

  it('updateUrlParams calls navigate with replace and search function', () => {
    const mockNavigate = (global as any).mockNavigate as jest.Mock
    mockNavigate.mockClear()

    const { result } = renderHook(useTracesUrlState)
    act(() => {
      result.current.updateUrlParams({ q: 'test' })
    })

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        replace: true,
        to: expect.any(String),
        search: expect.any(Function),
      })
    )
    const searchFn = mockNavigate.mock.calls[0][0].search
    const applied = searchFn({})
    expect(applied.q).toBe('test')
  })

  it('updateUrlParams passes through limit as string', () => {
    const mockNavigate = (global as any).mockNavigate as jest.Mock
    mockNavigate.mockClear()

    const { result } = renderHook(useTracesUrlState)
    act(() => {
      result.current.updateUrlParams({ limit: 100 })
    })

    const searchFn = mockNavigate.mock.calls[0][0].search
    const applied = searchFn({})
    expect(applied.limit).toBe('100')
  })
})

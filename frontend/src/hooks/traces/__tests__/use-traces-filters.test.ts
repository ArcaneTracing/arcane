import { renderHook, act } from '@testing-library/react'
import { useTracesFilters } from '../use-traces-filters'
import type { TracesFilters } from '../use-traces-url-state'

const mockUpdateUrlParams = jest.fn()

const baseFilters: TracesFilters = {
  datasourceId: 'ds-1',
  q: '',
  attributes: '',
  min_duration: '',
  max_duration: '',
  lookback: '1h',
  limit: 20,
  spanName: '',
}

function createOptions(overrides?: {
  filters?: TracesFilters
  setFilters?: jest.Mock
  setStartDate?: jest.Mock
  setEndDate?: jest.Mock
  updateUrlParams?: jest.Mock
}) {
  return {
    filters: baseFilters,
    setFilters: jest.fn((fn: (prev: TracesFilters) => TracesFilters) => fn(baseFilters)),
    setStartDate: jest.fn(),
    setEndDate: jest.fn(),
    updateUrlParams: overrides?.updateUrlParams ?? mockUpdateUrlParams,
    ...overrides,
  }
}

describe('useTracesFilters', () => {
  beforeEach(() => {
    mockUpdateUrlParams.mockClear()
  })

  it('returns updateFilters, handleStartDateChange, handleEndDateChange', () => {
    const opts = createOptions()
    const { result } = renderHook(() => useTracesFilters(opts))
    expect(typeof result.current.updateFilters).toBe('function')
    expect(typeof result.current.handleStartDateChange).toBe('function')
    expect(typeof result.current.handleEndDateChange).toBe('function')
  })

  describe('updateFilters', () => {
    it('calls setFilters with merged state', () => {
      const setFilters = jest.fn((fn) => fn(baseFilters))
      const opts = createOptions({ setFilters })
      const { result } = renderHook(() => useTracesFilters(opts))

      act(() => {
        result.current.updateFilters({ q: 'foo' })
      })

      expect(setFilters).toHaveBeenCalledWith(expect.any(Function))
      const fn = setFilters.mock.calls[0][0]
      expect(fn(baseFilters)).toEqual({ ...baseFilters, q: 'foo' })
    })

    it('calls updateUrlParams with url-relevant keys', () => {
      const opts = createOptions()
      const { result } = renderHook(() => useTracesFilters(opts))

      act(() => {
        result.current.updateFilters({ q: 'x', attributes: 'key=value', limit: 50 })
      })

      expect(mockUpdateUrlParams).toHaveBeenCalledWith({ q: 'x', attributes: 'key=value', limit: 50 })
    })

    it('does not call updateUrlParams when no url-relevant updates', () => {
      const opts = createOptions()
      const { result } = renderHook(() => useTracesFilters(opts))

      act(() => {
        result.current.updateFilters({})
      })

      expect(mockUpdateUrlParams).not.toHaveBeenCalled()
    })

    it('clears q, attributes, spanName when datasourceId changes', () => {
      const setFilters = jest.fn((fn) => fn({ ...baseFilters, q: 'foo', attributes: 'a=b', spanName: 'my-span' }))
      const opts = createOptions({ setFilters })

      const { result } = renderHook(() => useTracesFilters(opts))

      act(() => {
        result.current.updateFilters({ datasourceId: 'ds-2' })
      })

      expect(setFilters).toHaveBeenCalledWith(expect.any(Function))
      const fn = setFilters.mock.calls[0][0]
      expect(fn({ ...baseFilters, q: 'foo', attributes: 'a=b', spanName: 'my-span' })).toEqual({
        ...baseFilters,
        datasourceId: 'ds-2',
        q: '',
        attributes: '',
        spanName: '',
      })
      expect(mockUpdateUrlParams).toHaveBeenCalledWith({
        datasourceId: 'ds-2',
        q: '',
        attributes: '',
        spanName: '',
      })
    })
  })

  describe('handleStartDateChange', () => {
    it('calls setStartDate and updateUrlParams with start', () => {
      const setStartDate = jest.fn()
      const opts = createOptions({ setStartDate })
      const { result } = renderHook(() => useTracesFilters(opts))
      const d = new Date('2024-01-15T10:00:00.000Z')

      act(() => {
        result.current.handleStartDateChange(d)
      })

      expect(setStartDate).toHaveBeenCalledWith(d)
      expect(mockUpdateUrlParams).toHaveBeenCalledWith({ start: d })
    })

    it('sets lookback to custom and updates URL when date is set and lookback is not custom', () => {
      const setFilters = jest.fn((fn) => fn(baseFilters))
      const opts = createOptions({ setFilters })
      const { result } = renderHook(() => useTracesFilters(opts))
      const d = new Date()

      act(() => {
        result.current.handleStartDateChange(d)
      })

      expect(setFilters).toHaveBeenCalledWith(expect.any(Function))
      expect(mockUpdateUrlParams).toHaveBeenCalledWith({ start: d })
      expect(mockUpdateUrlParams).toHaveBeenCalledWith({ lookback: 'custom' })
    })

    it('does not set lookback when already custom', () => {
      const setFilters = jest.fn((fn) => fn({ ...baseFilters, lookback: 'custom' }))
      const opts = createOptions({ filters: { ...baseFilters, lookback: 'custom' }, setFilters })
      const { result } = renderHook(() => useTracesFilters(opts))

      act(() => {
        result.current.handleStartDateChange(new Date())
      })

      expect(setFilters).not.toHaveBeenCalled()
      expect(mockUpdateUrlParams).toHaveBeenCalledWith({ start: expect.any(Date) })
      expect(mockUpdateUrlParams).not.toHaveBeenCalledWith({ lookback: 'custom' })
    })
  })

  describe('handleEndDateChange', () => {
    it('calls setEndDate and updateUrlParams with end', () => {
      const setEndDate = jest.fn()
      const opts = createOptions({ setEndDate })
      const { result } = renderHook(() => useTracesFilters(opts))
      const d = new Date('2024-01-15T12:00:00.000Z')

      act(() => {
        result.current.handleEndDateChange(d)
      })

      expect(setEndDate).toHaveBeenCalledWith(d)
      expect(mockUpdateUrlParams).toHaveBeenCalledWith({ end: d })
    })
  })
})

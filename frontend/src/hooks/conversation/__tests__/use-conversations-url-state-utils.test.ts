import {
  syncDatesFromUrl,
  syncStringParamFromUrl,
  syncLookbackFromUrl,
} from '../use-conversations-url-state-utils'

describe('syncDatesFromUrl', () => {
  it('does not update when searchStart is undefined', () => {
    const setStartDate = jest.fn()
    const setEndDate = jest.fn()
    syncDatesFromUrl({
      searchStart: undefined,
      searchEnd: undefined,
      currentStartDate: new Date('2024-01-15T10:00:00.000Z'),
      currentEndDate: new Date('2024-01-15T12:00:00.000Z'),
      setStartDate,
      setEndDate,
    })
    expect(setStartDate).not.toHaveBeenCalled()
    expect(setEndDate).not.toHaveBeenCalled()
  })

  it('does not update when dates match current values', () => {
    const setStartDate = jest.fn()
    const setEndDate = jest.fn()
    const currentStart = new Date('2024-01-15T10:00:00.000Z')
    const currentEnd = new Date('2024-01-15T12:00:00.000Z')
    syncDatesFromUrl({
      searchStart: currentStart.toISOString(),
      searchEnd: currentEnd.toISOString(),
      currentStartDate: currentStart,
      currentEndDate: currentEnd,
      setStartDate,
      setEndDate,
    })
    expect(setStartDate).not.toHaveBeenCalled()
    expect(setEndDate).not.toHaveBeenCalled()
  })

  it('updates startDate when searchStart differs', () => {
    const setStartDate = jest.fn()
    const setEndDate = jest.fn()
    const currentStart = new Date('2024-01-15T10:00:00.000Z')
    const newStart = '2024-01-15T11:00:00.000Z'
    syncDatesFromUrl({
      searchStart: newStart,
      searchEnd: undefined,
      currentStartDate: currentStart,
      currentEndDate: undefined,
      setStartDate,
      setEndDate,
    })
    expect(setStartDate).toHaveBeenCalledWith(new Date(newStart))
    expect(setEndDate).not.toHaveBeenCalled()
  })

  it('updates endDate when searchEnd differs', () => {
    const setStartDate = jest.fn()
    const setEndDate = jest.fn()
    const currentEnd = new Date('2024-01-15T12:00:00.000Z')
    const newEnd = '2024-01-15T13:00:00.000Z'
    syncDatesFromUrl({
      searchStart: undefined,
      searchEnd: newEnd,
      currentStartDate: undefined,
      currentEndDate: currentEnd,
      setStartDate,
      setEndDate,
    })
    expect(setStartDate).not.toHaveBeenCalled()
    expect(setEndDate).toHaveBeenCalledWith(new Date(newEnd))
  })

  it('updates both dates when both differ', () => {
    const setStartDate = jest.fn()
    const setEndDate = jest.fn()
    const currentStart = new Date('2024-01-15T10:00:00.000Z')
    const currentEnd = new Date('2024-01-15T12:00:00.000Z')
    const newStart = '2024-01-15T11:00:00.000Z'
    const newEnd = '2024-01-15T13:00:00.000Z'
    syncDatesFromUrl({
      searchStart: newStart,
      searchEnd: newEnd,
      currentStartDate: currentStart,
      currentEndDate: currentEnd,
      setStartDate,
      setEndDate,
    })
    expect(setStartDate).toHaveBeenCalledWith(new Date(newStart))
    expect(setEndDate).toHaveBeenCalledWith(new Date(newEnd))
  })

  it('handles undefined current dates', () => {
    const setStartDate = jest.fn()
    const setEndDate = jest.fn()
    const newStart = '2024-01-15T11:00:00.000Z'
    const newEnd = '2024-01-15T13:00:00.000Z'
    syncDatesFromUrl({
      searchStart: newStart,
      searchEnd: newEnd,
      currentStartDate: undefined,
      currentEndDate: undefined,
      setStartDate,
      setEndDate,
    })
    expect(setStartDate).toHaveBeenCalledWith(new Date(newStart))
    expect(setEndDate).toHaveBeenCalledWith(new Date(newEnd))
  })
})

describe('syncStringParamFromUrl', () => {
  it('returns false when searchValue is undefined', () => {
    const setValue = jest.fn()
    const result = syncStringParamFromUrl({
      searchValue: undefined,
      currentValue: 'current',
      setValue,
    })
    expect(result).toBe(false)
    expect(setValue).not.toHaveBeenCalled()
  })

  it('returns false when searchValue matches currentValue', () => {
    const setValue = jest.fn()
    const result = syncStringParamFromUrl({
      searchValue: 'same',
      currentValue: 'same',
      setValue,
    })
    expect(result).toBe(false)
    expect(setValue).not.toHaveBeenCalled()
  })

  it('returns true and updates when searchValue differs', () => {
    const setValue = jest.fn()
    const result = syncStringParamFromUrl({
      searchValue: 'new-value',
      currentValue: 'old-value',
      setValue,
    })
    expect(result).toBe(true)
    expect(setValue).toHaveBeenCalledWith('new-value')
  })

  it('handles empty string searchValue', () => {
    const setValue = jest.fn()
    const result = syncStringParamFromUrl({
      searchValue: '',
      currentValue: 'current',
      setValue,
    })
    expect(result).toBe(false)
    expect(setValue).not.toHaveBeenCalled()
  })

  it('handles empty string currentValue', () => {
    const setValue = jest.fn()
    const result = syncStringParamFromUrl({
      searchValue: 'new-value',
      currentValue: '',
      setValue,
    })
    expect(result).toBe(true)
    expect(setValue).toHaveBeenCalledWith('new-value')
  })
})

describe('syncLookbackFromUrl', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    global.requestAnimationFrame = jest.fn((cb) => {
      setTimeout(cb, 0)
      return 1
    }) as unknown as typeof requestAnimationFrame
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('does not update when searchLookback is undefined', () => {
    const setLookback = jest.fn()
    const setIsUpdatingFromUrl = jest.fn()
    syncLookbackFromUrl({
      searchLookback: undefined,
      currentLookback: '1h',
      setLookback,
      setIsUpdatingFromUrl,
    })
    expect(setLookback).not.toHaveBeenCalled()
    expect(setIsUpdatingFromUrl).not.toHaveBeenCalled()
  })

  it('does not update when searchLookback matches currentLookback', () => {
    const setLookback = jest.fn()
    const setIsUpdatingFromUrl = jest.fn()
    syncLookbackFromUrl({
      searchLookback: '1h',
      currentLookback: '1h',
      setLookback,
      setIsUpdatingFromUrl,
    })
    expect(setLookback).not.toHaveBeenCalled()
    expect(setIsUpdatingFromUrl).not.toHaveBeenCalled()
  })

  it('updates lookback and sets isUpdatingFromUrl flag when values differ', () => {
    const setLookback = jest.fn()
    const setIsUpdatingFromUrl = jest.fn()
    syncLookbackFromUrl({
      searchLookback: '5m',
      currentLookback: '1h',
      setLookback,
      setIsUpdatingFromUrl,
    })
    expect(setIsUpdatingFromUrl).toHaveBeenCalledWith(true)
    expect(setLookback).toHaveBeenCalledWith('5m')
    expect(global.requestAnimationFrame).toHaveBeenCalled()
  })

  it('resets isUpdatingFromUrl flag in requestAnimationFrame callback', () => {
    const setLookback = jest.fn()
    const setIsUpdatingFromUrl = jest.fn()
    syncLookbackFromUrl({
      searchLookback: '5m',
      currentLookback: '1h',
      setLookback,
      setIsUpdatingFromUrl,
    })
    jest.runAllTimers()
    expect(setIsUpdatingFromUrl).toHaveBeenCalledTimes(2)
    expect(setIsUpdatingFromUrl).toHaveBeenNthCalledWith(1, true)
    expect(setIsUpdatingFromUrl).toHaveBeenNthCalledWith(2, false)
  })
})

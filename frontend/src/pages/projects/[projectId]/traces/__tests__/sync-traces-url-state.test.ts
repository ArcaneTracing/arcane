import { syncTracesStateFromUrl } from '../sync-traces-url-state'

describe('syncTracesStateFromUrl', () => {
  const defaultFilters = {
    datasourceId: '',
    q: '',
    attributes: '',
    min_duration: '',
    max_duration: '',
    lookback: '1h',
    limit: 20,
    spanName: '',
  }

  it('updates prevSearchRef when search params change', () => {
    const prevSearchRef = { current: '{}' }
    const setStartDate = jest.fn()
    const setEndDate = jest.fn()
    const setFilters = jest.fn()
    const isUpdatingFromUrlRef = { current: false }

    syncTracesStateFromUrl(
      { start: '2024-01-01', end: '2024-01-02' },
      { startDate: undefined, endDate: undefined, filters: defaultFilters },
      { setStartDate, setEndDate, setFilters, isUpdatingFromUrlRef },
      prevSearchRef
    )

    expect(prevSearchRef.current).not.toBe('{}')
    expect(setStartDate).toHaveBeenCalledWith(new Date('2024-01-01'))
    expect(setEndDate).toHaveBeenCalledWith(new Date('2024-01-02'))
  })

  it('does not update when isUpdatingFromUrlRef is true', () => {
    const prevSearchRef = { current: '{}' }
    const setStartDate = jest.fn()
    const setEndDate = jest.fn()
    const setFilters = jest.fn()
    const isUpdatingFromUrlRef = { current: true }

    syncTracesStateFromUrl(
      { start: '2024-01-01', end: '2024-01-02' },
      { startDate: undefined, endDate: undefined, filters: defaultFilters },
      { setStartDate, setEndDate, setFilters, isUpdatingFromUrlRef },
      prevSearchRef
    )

    expect(setStartDate).not.toHaveBeenCalled()
    expect(setEndDate).not.toHaveBeenCalled()
  })

  it('does not update when search string unchanged', () => {
    const searchString = JSON.stringify({ start: '2024-01-01', end: '2024-01-02' })
    const prevSearchRef = { current: searchString }
    const setStartDate = jest.fn()

    syncTracesStateFromUrl(
      { start: '2024-01-01', end: '2024-01-02' },
      { startDate: new Date('2024-01-01'), endDate: new Date('2024-01-02'), filters: defaultFilters },
      {
        setStartDate,
        setEndDate: jest.fn(),
        setFilters: jest.fn(),
        isUpdatingFromUrlRef: { current: false },
      },
      prevSearchRef
    )

    expect(setStartDate).not.toHaveBeenCalled()
  })

  it('updates filters when datasourceId changes', () => {
    const prevSearchRef = { current: '{}' }
    const setFilters = jest.fn()

    syncTracesStateFromUrl(
      { start: '2024-01-01', end: '2024-01-02', datasourceId: 'ds1' },
      {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-02'),
        filters: { ...defaultFilters, datasourceId: '' },
      },
      {
        setStartDate: jest.fn(),
        setEndDate: jest.fn(),
        setFilters,
        isUpdatingFromUrlRef: { current: false },
      },
      prevSearchRef
    )

    expect(setFilters).toHaveBeenCalledWith(expect.any(Function))
    const updater = setFilters.mock.calls[0][0]
    expect(updater(defaultFilters)).toEqual({
      ...defaultFilters,
      datasourceId: 'ds1',
      q: '',
      attributes: '',
      spanName: '',
    })
  })
})

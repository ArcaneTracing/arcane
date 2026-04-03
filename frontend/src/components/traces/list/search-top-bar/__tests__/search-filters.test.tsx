import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/react'
import { SearchFiltersBar } from '../search-filters'

describe('SearchFiltersBar', () => {
  const onFiltersChange = jest.fn()
  const onStartDateChange = jest.fn()
  const onEndDateChange = jest.fn()
  const onSearch = jest.fn()

  const defaultFilters = {
    datasourceId: 'ds-1',
    q: '',
    attributes: '',
    min_duration: '',
    max_duration: '',
    lookback: '1h',
    limit: 20,
    spanName: '',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders lookback select and search button', () => {
    render(
      <SearchFiltersBar
        filters={defaultFilters}
        isSearchLoading={false}
        onFiltersChange={onFiltersChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearch={onSearch}
      />
    )
    expect(screen.getByText('Lookback')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })

  it('renders duration and limit inputs', () => {
    render(
      <SearchFiltersBar
        filters={defaultFilters}
        isSearchLoading={false}
        onFiltersChange={onFiltersChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearch={onSearch}
      />
    )
    expect(screen.getByPlaceholderText('Min duration')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Max duration')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('20')).toBeInTheDocument()
  })

  it('disables search when no datasource', () => {
    render(
      <SearchFiltersBar
        filters={{ ...defaultFilters, datasourceId: '' }}
        isSearchLoading={false}
        onFiltersChange={onFiltersChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearch={onSearch}
      />
    )
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled()
  })

  it('disables search when custom lookback but no dates', () => {
    render(
      <SearchFiltersBar
        filters={{ ...defaultFilters, lookback: 'custom' }}
        isSearchLoading={false}
        onFiltersChange={onFiltersChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearch={onSearch}
      />
    )
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled()
  })

  it('enables search when custom lookback with dates', () => {
    render(
      <SearchFiltersBar
        filters={{ ...defaultFilters, lookback: 'custom' }}
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-02')}
        isSearchLoading={false}
        onFiltersChange={onFiltersChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearch={onSearch}
      />
    )
    expect(screen.getByRole('button', { name: 'Search' })).not.toBeDisabled()
  })

  it('shows Searching when isSearchLoading', () => {
    render(
      <SearchFiltersBar
        filters={defaultFilters}
        isSearchLoading={true}
        onFiltersChange={onFiltersChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearch={onSearch}
      />
    )
    expect(screen.getByRole('button', { name: /Searching/i })).toBeInTheDocument()
  })

  it('calls onSearch when Search clicked', async () => {
    const user = userEvent.setup()
    render(
      <SearchFiltersBar
        filters={defaultFilters}
        isSearchLoading={false}
        onFiltersChange={onFiltersChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearch={onSearch}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSearch).toHaveBeenCalled()
  })

  it('calls onFiltersChange when min duration changed', () => {
    render(
      <SearchFiltersBar
        filters={defaultFilters}
        isSearchLoading={false}
        onFiltersChange={onFiltersChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearch={onSearch}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('Min duration'), { target: { value: '100' } })
    expect(onFiltersChange).toHaveBeenCalledWith({ min_duration: '100' })
  })
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TracesPageView } from '../view'

jest.mock('@/components/traces/list/search-top-bar', () => ({
  SearchTopBar: () => React.createElement('div', { 'data-testid': 'search-top-bar' }),
}))

jest.mock('@/components/traces/list/traces-list', () => ({
  TracesList: () => React.createElement('div', { 'data-testid': 'traces-list' }),
}))

const defaultProps = {
  filters: {
    datasourceId: '',
    q: '',
    tags: [],
    tagValues: [],
    min_duration: '',
    max_duration: '',
    lookback: '1h',
    limit: 20,
  },
  startDate: undefined,
  endDate: undefined,
  isSearchLoading: false,
  onFiltersChange: () => {},
  onStartDateChange: () => {},
  onEndDateChange: () => {},
  onSearch: () => {},
  traces: [],
  datasourceId: '',
  isFetchLoading: false,
  searchError: null,
}

describe('TracesPageView', () => {
  it('renders SearchTopBar and TracesList', () => {
    render(React.createElement(TracesPageView, defaultProps))
    expect(screen.getByTestId('search-top-bar')).toBeInTheDocument()
    expect(screen.getByTestId('traces-list')).toBeInTheDocument()
  })

  it('renders a flex column layout', () => {
    const { container } = render(React.createElement(TracesPageView, defaultProps))
    const outer = container.firstElementChild
    expect(outer).toHaveClass('flex', 'flex-col', 'h-full')
  })
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import { SearchTopBar } from '../../search-top-bar'
import type { SearchFilters } from '../types'

jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(() => ({ projectId: 'p1', organisationId: 'o1' })),
}))

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(() => ({
    hasPermission: jest.fn(() => true),
    isLoading: false,
  })),
}))

jest.mock('@/hooks/datasources/use-datasources-query', () => ({
  useDatasourcesListQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}))

jest.mock('../datasource-selector', () => ({
  DatasourceSelector: ({ value }: { value: string }) => (
    <div data-testid="datasource-selector">{value}</div>
  ),
}))

jest.mock('../query-input', () => ({
  QueryInput: ({ value }: { value: string }) => (
    <input data-testid="query-input" value={value} readOnly />
  ),
}))

jest.mock('../span-name-input', () => ({
  SpanNameInput: ({ value }: { value: string }) => (
    <input data-testid="span-name-input" value={value} readOnly />
  ),
}))

jest.mock('../attributes-input', () => ({
  AttributesInput: ({ attributes }: { attributes: string[] }) => (
    <div data-testid="attributes-input">
      {attributes.map((attr, i) => (
        <span key={i}>{attr}</span>
      ))}
    </div>
  ),
}))

jest.mock('../search-mode-selector', () => ({
  SearchModeSelector: ({ value }: { value: string }) => (
    <div data-testid="search-mode-selector">{value}</div>
  ),
}))

jest.mock('../search-filters', () => ({
  SearchFiltersBar: () => <div data-testid="search-filters-bar">Filters</div>,
}))

const baseFilters: SearchFilters = {
  datasourceId: 'ds-1',
  q: '',
  attributes: '',
  min_duration: '',
  max_duration: '',
  lookback: '1h',
  limit: 20,
  spanName: '',
}

describe('SearchTopBar', () => {
  const defaultProps = {
    filters: baseFilters,
    startDate: undefined,
    endDate: undefined,
    isSearchLoading: false,
    onFiltersChange: jest.fn(),
    onStartDateChange: jest.fn(),
    onEndDateChange: jest.fn(),
    onSearch: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders datasource selector', () => {
    render(<SearchTopBar {...defaultProps} />)
    expect(screen.getByTestId('datasource-selector')).toBeInTheDocument()
  })

  it('renders query input when showQueryEditor is true', () => {
    render(
      <SearchTopBar
        {...defaultProps}
        config={{
          showQueryEditor: true,
          showAttributesFilter: false,
          loadAttributeNames: false,
          loadAttributeValues: false,
        }}
      />
    )
    expect(screen.getByTestId('query-input')).toBeInTheDocument()
  })

  it('does not render query input when showQueryEditor is false', () => {
    render(
      <SearchTopBar
        {...defaultProps}
        config={{
          showQueryEditor: false,
          showAttributesFilter: true,
          loadAttributeNames: false,
          loadAttributeValues: false,
        }}
      />
    )
    expect(screen.queryByTestId('query-input')).not.toBeInTheDocument()
  })

  it('renders attributes input when showAttributesFilter is true', () => {
    render(
      <SearchTopBar
        {...defaultProps}
        filters={{ ...baseFilters, attributes: 'service.name=my-service' }}
        config={{
          showQueryEditor: false,
          showAttributesFilter: true,
          loadAttributeNames: false,
          loadAttributeValues: false,
        }}
      />
    )
    expect(screen.getAllByTestId('attributes-input').length).toBeGreaterThan(0)
  })

  it('renders mode selector when both query and attributes are supported', () => {
    render(
      <SearchTopBar
        {...defaultProps}
        config={{
          showQueryEditor: true,
          showAttributesFilter: true,
          loadAttributeNames: false,
          loadAttributeValues: false,
        }}
      />
    )
    expect(screen.getByTestId('search-mode-selector')).toBeInTheDocument()
  })

  it('does not render mode selector when only one feature is supported', () => {
    render(
      <SearchTopBar
        {...defaultProps}
        config={{
          showQueryEditor: true,
          showAttributesFilter: false,
          loadAttributeNames: false,
          loadAttributeValues: false,
        }}
      />
    )
    expect(screen.queryByTestId('search-mode-selector')).not.toBeInTheDocument()
  })

  it('renders search filters bar', () => {
    render(<SearchTopBar {...defaultProps} />)
    expect(screen.getByTestId('search-filters-bar')).toBeInTheDocument()
  })
})

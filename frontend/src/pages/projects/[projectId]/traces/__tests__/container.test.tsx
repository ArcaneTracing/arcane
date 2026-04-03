import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { TracesPageContainer } from '../container'
import { usePermissions } from '@/hooks/usePermissions'
import { useDatasourcesListQuery } from '@/hooks/datasources/use-datasources-query'

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(),
}))

jest.mock('@/hooks/datasources/use-datasources-query', () => ({
  useDatasourcesListQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}))

jest.mock('@/hooks/traces/use-traces-search', () => ({
  useTracesSearch: jest.fn(() => ({
    traces: [],
    isSearchLoading: false,
    searchError: null,
    handleSearch: jest.fn(),
  })),
}))

jest.mock('@/components/traces/list/search-top-bar', () => ({
  SearchTopBar: () => React.createElement('div', { 'data-testid': 'search-top-bar' }, 'SearchTopBar'),
}))

jest.mock('@/components/traces/list/traces-list', () => ({
  TracesList: () => React.createElement('div', null, 'No traces found'),
}))

const mockUseParams = global.mockUseParams as jest.Mock
const mockUseSearch = global.mockUseSearch as jest.Mock

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('TracesPageContainer', () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ projectId: 'p1', organisationId: 'o1' })
    mockUseSearch.mockReturnValue({})
    ;(usePermissions as jest.Mock).mockReturnValue({
      permissions: { instance: [], organisation: [], project: [], all: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      hasPermission: jest.fn(() => true),
      hasAnyPermission: jest.fn(() => true),
      hasAllPermissions: jest.fn(() => true),
      isSuperAdmin: jest.fn(() => false),
    })
  })

  it('renders TracesList when user has permission and no fetch error', () => {
    render(React.createElement(TracesPageContainer), { wrapper: createWrapper() })
    expect(screen.getByText(/no traces found/i)).toBeInTheDocument()
  })

  it('renders PermissionError when datasources fetch returns 403', () => {
    const err = new AxiosError('Forbidden')
    ;(err as any).response = { status: 403, data: {} }
    ;(useDatasourcesListQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: err,
    })

    render(React.createElement(TracesPageContainer), { wrapper: createWrapper() })
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
  })

  it('renders TracesPageView with datasource capabilities when selected datasource exists', () => {
    mockUseSearch.mockReturnValue({
      datasourceId: 'ds1',
      q: '',
      attributes: '',
      min_duration: '',
      max_duration: '',
      lookback: '1h',
      limit: '20',
    })
    ;(useDatasourcesListQuery as jest.Mock).mockReturnValue({
      data: [
        {
          id: 'ds1',
          name: 'Test DS',
          isSearchByQueryEnabled: true,
          isSearchByAttributesEnabled: true,
          isGetAttributeNamesEnabled: true,
          isGetAttributeValuesEnabled: true,
        },
      ],
      isLoading: false,
      error: null,
    })

    render(React.createElement(TracesPageContainer), { wrapper: createWrapper() })
    expect(screen.getByTestId('search-top-bar')).toBeInTheDocument()
    expect(screen.getByText(/no traces found/i)).toBeInTheDocument()
  })

  it('renders view when permissions are loading', () => {
    ;(usePermissions as jest.Mock).mockReturnValue({
      permissions: { instance: [], organisation: [], project: [], all: [] },
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
      hasPermission: jest.fn(() => false),
      hasAnyPermission: jest.fn(() => false),
      hasAllPermissions: jest.fn(() => false),
      isSuperAdmin: jest.fn(() => false),
    })

    render(React.createElement(TracesPageContainer), { wrapper: createWrapper() })
    expect(screen.getByTestId('search-top-bar')).toBeInTheDocument()
  })
})

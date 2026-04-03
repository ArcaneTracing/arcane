import React from 'react'
import { render, screen } from '@/__tests__/test-utils'
import { DatasourcesTab } from '../datasources-tab'

jest.mock('@/hooks/shared', () => ({
  useUrlTableState: () => ({
    search: '',
    sortKey: 'name',
    sortDirection: 'asc' as const,
    updateSearch: jest.fn(),
    updateSort: jest.fn(),
  }),
}))

jest.mock('@/components/ui/sort-menu', () => ({
  SortMenu: () => <div data-testid="sort-menu" />,
  SortOption: {},
}))

jest.mock('@/components/datasources/dialogs/datasource-dialog', () => ({
  DatasourceDialog: ({ trigger }: { trigger: React.ReactNode }) => <div>{trigger}</div>,
}))

jest.mock('@/components/datasources/table/datasources-table', () => ({
  DatasourcesTable: ({ search }: { search: string }) => (
    <div data-testid="datasources-table">Table: {search || 'empty'}</div>
  ),
}))

describe('DatasourcesTab', () => {
  it('renders search input and New data source button', () => {
    render(<DatasourcesTab />)
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
    expect(screen.getByText('New data source')).toBeInTheDocument()
  })

  it('renders DatasourcesTable', () => {
    render(<DatasourcesTab />)
    expect(screen.getByTestId('datasources-table')).toBeInTheDocument()
  })
})

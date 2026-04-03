import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EntitiesTab } from '../entities-tab'
import { render as customRender } from '@/__tests__/test-utils'

jest.mock('@/components/entities/quick-start-dialog', () => ({
  QuickStartDialog: () => null,
}))

jest.mock('@/components/entities/entities-table', () => ({
  EntitiesTable: ({ searchQuery }: { searchQuery: string }) => (
    <div data-testid="entities-table">EntitiesTable with query: {searchQuery}</div>
  ),
}))

jest.mock('@/components/entities/new-entity-dialog', () => ({
  EntityDialog: ({ open, onOpenChange, trigger }: any) => (
    <div data-testid="entity-dialog">
      <div>Dialog open: {String(open)}</div>
      {trigger}
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
}))

describe('EntitiesTab', () => {
  it('should render search input and new entity button', () => {
    customRender(<EntitiesTab />)

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new entity/i })).toBeInTheDocument()
  })

  it('should render EntitiesTable with empty search query initially', () => {
    customRender(<EntitiesTab />)

    const table = screen.getByTestId('entities-table')
    expect(table).toBeInTheDocument()
    expect(table).toHaveTextContent('EntitiesTable with query:')
  })

  it('should update search query when input changes', () => {
    customRender(<EntitiesTab />)

    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'test query' } })

    expect(searchInput.value).toBe('test query')
  })

  it('should pass search query to EntitiesTable', () => {
    customRender(<EntitiesTab />)

    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'model' } })

    const table = screen.getByTestId('entities-table')
    expect(table).toHaveTextContent('EntitiesTable with query: model')
  })

  it('should render EntityDialog with trigger button', () => {
    customRender(<EntitiesTab />)

    const dialog = screen.getByTestId('entity-dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new entity/i })).toBeInTheDocument()
  })

  it('should handle empty search query', () => {
    customRender(<EntitiesTab />)

    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
    expect(searchInput.value).toBe('')
  })

  it('should handle special characters in search query', () => {
    customRender(<EntitiesTab />)

    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'test@#$%' } })

    expect(searchInput.value).toBe('test@#$%')
  })

  it('should handle long search query', () => {
    customRender(<EntitiesTab />)

    const longQuery = 'a'.repeat(100)
    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: longQuery } })

    expect(searchInput.value).toBe(longQuery)
  })
})


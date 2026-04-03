import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EntitiesTableHeader } from '../entities-table-header'

describe('EntitiesTableHeader', () => {
  const mockOnSort = jest.fn()
  const defaultSortConfig = { key: 'name' as const, direction: 'asc' as const }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all column headers', () => {
    render(
      <EntitiesTableHeader sortConfig={defaultSortConfig} onSort={mockOnSort} />
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Pattern Match')).toBeInTheDocument()
    expect(screen.getByText('Created Date')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('should call onSort when sortable header is clicked', () => {
    render(
      <EntitiesTableHeader sortConfig={defaultSortConfig} onSort={mockOnSort} />
    )
    const nameHeader = screen.getByText('Name').closest('th')
    fireEvent.click(nameHeader!)
    expect(mockOnSort).toHaveBeenCalledWith('name')
  })

  it('should call onSort with description when description header is clicked', () => {
    render(
      <EntitiesTableHeader sortConfig={defaultSortConfig} onSort={mockOnSort} />
    )
    const descHeader = screen.getByText('Description').closest('th')
    fireEvent.click(descHeader!)
    expect(mockOnSort).toHaveBeenCalledWith('description')
  })

  it('should call onSort with createdAt when created date header is clicked', () => {
    render(
      <EntitiesTableHeader sortConfig={defaultSortConfig} onSort={mockOnSort} />
    )
    const dateHeader = screen.getByText('Created Date').closest('th')
    fireEvent.click(dateHeader!)
    expect(mockOnSort).toHaveBeenCalledWith('createdAt')
  })
})


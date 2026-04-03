import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SortableHeader } from '../sortable-header'

describe('SortableHeader', () => {
  const mockOnSort = jest.fn()
  const defaultSortConfig = { key: 'name', direction: 'asc' as const }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render label', () => {
    render(
      <SortableHeader
        label="Name"
        sortKey="name"
        sortConfig={defaultSortConfig}
        onSort={mockOnSort}
      />
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('should call onSort when clicked', () => {
    render(
      <SortableHeader
        label="Name"
        sortKey="name"
        sortConfig={defaultSortConfig}
        onSort={mockOnSort}
      />
    )
    const header = screen.getByText('Name').closest('th')
    fireEvent.click(header!)
    expect(mockOnSort).toHaveBeenCalledWith('name')
  })

  it('should show active state when sortKey matches', () => {
    render(
      <SortableHeader
        label="Name"
        sortKey="name"
        sortConfig={defaultSortConfig}
        onSort={mockOnSort}
      />
    )
    const header = screen.getByText('Name').closest('th')
    expect(header).toHaveClass('cursor-pointer')
  })

  it('should not show active state when sortKey does not match', () => {
    render(
      <SortableHeader
        label="Name"
        sortKey="name"
        sortConfig={{ key: 'email', direction: 'asc' }}
        onSort={mockOnSort}
      />
    )
    const header = screen.getByText('Name').closest('th')
    expect(header).toBeInTheDocument()
  })

  it('shows desc rotation when direction is desc', () => {
    render(
      <SortableHeader
        label="Name"
        sortKey="name"
        sortConfig={{ key: 'name', direction: 'desc' }}
        onSort={mockOnSort}
      />
    )
    const icon = screen.getByText('Name').closest('th')?.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <SortableHeader
        label="Name"
        sortKey="name"
        sortConfig={defaultSortConfig}
        onSort={mockOnSort}
        className="custom-class"
      />
    )
    const header = screen.getByText('Name').closest('th')
    expect(header).toHaveClass('custom-class')
  })
})


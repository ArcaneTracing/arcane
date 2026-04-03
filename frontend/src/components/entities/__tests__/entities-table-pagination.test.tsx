import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EntitiesTablePagination } from '../entities-table-pagination'
import { Meta } from '@/types/shared'

describe('EntitiesTablePagination', () => {
  const mockOnPageChange = jest.fn()

  const defaultMeta: Meta = {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasPreviousPage: false,
    hasNextPage: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render pagination controls', () => {
    render(
      <EntitiesTablePagination meta={defaultMeta} onPageChange={mockOnPageChange} />
    )
    expect(screen.getByText(/Showing 1-10 of 100/i)).toBeInTheDocument()
  })

  it('should call onPageChange when next button is clicked', () => {
    render(
      <EntitiesTablePagination meta={defaultMeta} onPageChange={mockOnPageChange} />
    )
    const buttons = screen.getAllByRole('button')
    const nextButton = buttons[2]
    fireEvent.click(nextButton)
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('should disable previous buttons on first page', () => {
    render(
      <EntitiesTablePagination meta={defaultMeta} onPageChange={mockOnPageChange} />
    )
    const buttons = screen.getAllByRole('button')
    const firstButton = buttons[0]
    expect(firstButton).toBeDisabled()
  })
})


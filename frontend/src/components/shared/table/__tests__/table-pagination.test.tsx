import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TablePagination } from '../table-pagination'

describe('TablePagination', () => {
  const mockOnPageChange = jest.fn()

  const defaultMeta = {
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
    render(<TablePagination meta={defaultMeta} onPageChange={mockOnPageChange} />)
    expect(screen.getByText(/Showing 1-10 of 100/i)).toBeInTheDocument()
  })

  it('should disable previous buttons on first page', () => {
    render(<TablePagination meta={defaultMeta} onPageChange={mockOnPageChange} />)
    const prevButton = screen.getAllByRole('button')[0]
    expect(prevButton).toBeDisabled()
  })

  it('should enable next button when hasNextPage is true', () => {
    render(<TablePagination meta={defaultMeta} onPageChange={mockOnPageChange} />)
    const nextButton = screen.getAllByRole('button')[2]
    expect(nextButton).not.toBeDisabled()
  })

  it('should disable next button on last page', () => {
    const lastPageMeta = {
      ...defaultMeta,
      page: 10,
      hasNextPage: false,
      hasPreviousPage: true,
    }
    render(<TablePagination meta={lastPageMeta} onPageChange={mockOnPageChange} />)
    const nextButton = screen.getAllByRole('button')[2]
    expect(nextButton).toBeDisabled()
  })

  it('should call onPageChange when next button is clicked', () => {
    render(<TablePagination meta={defaultMeta} onPageChange={mockOnPageChange} />)
    const nextButton = screen.getAllByRole('button')[2]
    fireEvent.click(nextButton)
    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('should call onPageChange when previous button is clicked', () => {
    const middlePageMeta = {
      ...defaultMeta,
      page: 5,
      hasPreviousPage: true,
    }
    render(<TablePagination meta={middlePageMeta} onPageChange={mockOnPageChange} />)
    const prevButton = screen.getAllByRole('button')[1]
    fireEvent.click(prevButton)
    expect(mockOnPageChange).toHaveBeenCalledWith(4)
  })

  it('should call onPageChange with 1 when first page button is clicked', () => {
    const middlePageMeta = {
      ...defaultMeta,
      page: 5,
      hasPreviousPage: true,
    }
    render(<TablePagination meta={middlePageMeta} onPageChange={mockOnPageChange} />)
    const firstPageButton = screen.getAllByRole('button')[0]
    fireEvent.click(firstPageButton)
    expect(mockOnPageChange).toHaveBeenCalledWith(1)
  })

  it('should call onPageChange with totalPages when last page button is clicked', () => {
    const middlePageMeta = {
      ...defaultMeta,
      page: 5,
      hasPreviousPage: true,
    }
    render(<TablePagination meta={middlePageMeta} onPageChange={mockOnPageChange} />)
    const lastPageButton = screen.getAllByRole('button')[3]
    fireEvent.click(lastPageButton)
    expect(mockOnPageChange).toHaveBeenCalledWith(10)
  })

  it('should calculate correct start and end indices', () => {
    const meta = {
      ...defaultMeta,
      page: 3,
      limit: 10,
      total: 25,
    }
    render(<TablePagination meta={meta} onPageChange={mockOnPageChange} />)
    expect(screen.getByText(/Showing 21-25 of 25/i)).toBeInTheDocument()
  })
})


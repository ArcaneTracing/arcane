import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TableSearchBar } from '../table-search-bar'

describe('TableSearchBar', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render search input', () => {
    render(<TableSearchBar value="" onChange={mockOnChange} />)
    const input = screen.getByPlaceholderText('Search')
    expect(input).toBeInTheDocument()
  })

  it('should display value', () => {
    render(<TableSearchBar value="test query" onChange={mockOnChange} />)
    const input = screen.getByDisplayValue('test query')
    expect(input).toBeInTheDocument()
  })

  it('should call onChange when input changes', () => {
    render(<TableSearchBar value="" onChange={mockOnChange} />)
    const input = screen.getByPlaceholderText('Search')
    fireEvent.change(input, { target: { value: 'new query' } })
    expect(mockOnChange).toHaveBeenCalledWith('new query')
  })

  it('should use custom placeholder', () => {
    render(
      <TableSearchBar
        value=""
        onChange={mockOnChange}
        placeholder="Search items..."
      />
    )
    const input = screen.getByPlaceholderText('Search items...')
    expect(input).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <TableSearchBar
        value=""
        onChange={mockOnChange}
        className="custom-class"
      />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })
})


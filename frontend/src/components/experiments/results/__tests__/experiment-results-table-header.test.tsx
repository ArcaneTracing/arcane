import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExperimentResultsTableHeader } from '../experiment-results-table-header'
import { Table } from '@/components/ui/table'

describe('ExperimentResultsTableHeader', () => {
  const mockOnSort = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderWithTable = (props: React.ComponentProps<typeof ExperimentResultsTableHeader>) =>
    render(
      <Table>
        <ExperimentResultsTableHeader {...props} />
      </Table>
    )

  it('should render headers', () => {
    renderWithTable({
      headers: ['col1', 'col2', 'col3'],
      sortConfig: { columnIndex: null, direction: 'asc' },
      onSort: mockOnSort,
    })

    expect(screen.getByText('col1')).toBeInTheDocument()
    expect(screen.getByText('col2')).toBeInTheDocument()
    expect(screen.getByText('col3')).toBeInTheDocument()
    expect(screen.getByText('Experiment Result')).toBeInTheDocument()
  })

  it('should call onSort when header is clicked', () => {
    renderWithTable({
      headers: ['col1', 'col2'],
      sortConfig: { columnIndex: null, direction: 'asc' },
      onSort: mockOnSort,
    })

    fireEvent.click(screen.getByText('col1'))

    expect(mockOnSort).toHaveBeenCalledWith(0)
  })

  it('should call onSort with correct index for each column', () => {
    renderWithTable({
      headers: ['col1', 'col2'],
      sortConfig: { columnIndex: null, direction: 'asc' },
      onSort: mockOnSort,
    })

    fireEvent.click(screen.getByText('col2'))

    expect(mockOnSort).toHaveBeenCalledWith(1)
  })

  it('should handle empty headers', () => {
    renderWithTable({
      headers: [],
      sortConfig: { columnIndex: null, direction: 'asc' },
      onSort: mockOnSort,
    })

    expect(screen.getByText('Experiment Result')).toBeInTheDocument()
  })
})

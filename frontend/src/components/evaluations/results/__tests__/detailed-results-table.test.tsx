import { render, screen } from '@/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { DetailedResultsTable } from '../detailed-results-table'
import type { DetailedResultRow } from '../evaluation-results-detailed-utils'

const createRow = (): DetailedResultRow => ({
  id: 'row-1',
  values: ['val1', 'val2'],
  scoreResults: new Map([
    ['score-1', { value: 0.95, status: 'DONE', reasoning: undefined }],
  ]),
  experimentResult: undefined,
})

describe('DetailedResultsTable', () => {
  const defaultProps = {
    headers: ['Col1', 'Col2'],
    displayScoreIds: ['score-1'],
    paginatedItems: [createRow()],
    filteredRows: [createRow()],
    searchQuery: '',
    onSearchChange: jest.fn(),
    onSort: jest.fn(),
    getScoreName: (id: string) => (id === 'score-1' ? 'Accuracy' : id),
    meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    onPageChange: jest.fn(),
    showExperimentColumn: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input and table', () => {
    render(<DetailedResultsTable {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search results')).toBeInTheDocument()
    expect(screen.getByText('Col1')).toBeInTheDocument()
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
    expect(screen.getByText('val1')).toBeInTheDocument()
  })

  it('shows No results found when filteredRows is empty', () => {
    render(
      <DetailedResultsTable
        {...defaultProps}
        paginatedItems={[]}
        filteredRows={[]}
      />
    )
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('calls onSearchChange when typing in search', async () => {
    const onSearchChange = jest.fn()
    render(
      <DetailedResultsTable
        {...defaultProps}
        onSearchChange={onSearchChange}
      />
    )
    await userEvent.type(screen.getByPlaceholderText('Search results'), 'a')
    expect(onSearchChange).toHaveBeenCalled()
  })

  it('calls onSort when header clicked', async () => {
    const onSort = jest.fn()
    render(<DetailedResultsTable {...defaultProps} onSort={onSort} />)
    await userEvent.click(screen.getByText('Col1'))
    expect(onSort).toHaveBeenCalledWith(0)
  })
})

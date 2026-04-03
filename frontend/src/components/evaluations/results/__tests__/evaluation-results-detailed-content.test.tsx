import { render, screen } from '@/__tests__/test-utils'
import {
  DatasetEvaluationContent,
  ExperimentEvaluationContent,
} from '../evaluation-results-detailed-content'
import type { DetailedResultRow } from '../evaluation-results-detailed-utils'

const createRow = (): DetailedResultRow => ({
  id: 'row-1',
  values: ['val1'],
  scoreResults: new Map([
    ['score-1', { value: 0.95, status: 'DONE', reasoning: undefined }],
  ]),
  experimentResult: undefined,
})

const baseDatasetProps = {
  datasetForEvaluationHeader: ['Col1'],
  combinedRows: [createRow()],
  searchQuery: '',
  onSearchChange: jest.fn(),
  filteredRows: [createRow()],
  paginatedItems: [createRow()],
  displayScoreIds: ['score-1'],
  getScoreName: (id: string) => (id === 'score-1' ? 'Accuracy' : id),
  handleSort: jest.fn(),
  meta: { total: 1, page: 1, limit: 100, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
  handlePageChange: jest.fn(),
}

describe('DatasetEvaluationContent', () => {
  it('shows loading state when isLoading', () => {
    render(
      <DatasetEvaluationContent
        {...baseDatasetProps}
        isLoading={true}
        datasetForEvaluationHeader={null}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows No results found when combinedRows is empty', () => {
    render(
      <DatasetEvaluationContent
        {...baseDatasetProps}
        isLoading={false}
        combinedRows={[]}
        filteredRows={[]}
        paginatedItems={[]}
      />
    )
    expect(screen.getByText(/No results found for this dataset evaluation/)).toBeInTheDocument()
  })

  it('renders table when data is available', () => {
    render(
      <DatasetEvaluationContent
        {...baseDatasetProps}
        isLoading={false}
      />
    )
    expect(screen.getByPlaceholderText('Search results')).toBeInTheDocument()
    expect(screen.getByText('val1')).toBeInTheDocument()
  })
})

describe('ExperimentEvaluationContent', () => {
  const baseExperimentProps = {
    ...baseDatasetProps,
    hasSingleExperiment: false,
    selectedExperimentId: '',
    onExperimentChange: jest.fn(),
    loadingExperiments: false,
    experiments: [{ id: 'exp-1', name: 'Exp 1', datasetId: 'ds-1' }],
    evaluation: { experiments: [{ id: 'exp-1', promptVersionId: 'pv-1', datasetId: 'ds-1' }] } as never,
    datasetHeader: ['Col1'],
  }

  it('shows message when no experiment selected', () => {
    render(
      <ExperimentEvaluationContent
        {...baseExperimentProps}
        isLoading={false}
        combinedRows={[]}
        filteredRows={[]}
        paginatedItems={[]}
      />
    )
    expect(screen.getByText(/Please select an experiment to view detailed results/)).toBeInTheDocument()
  })

  it('renders table when experiment selected and has data', () => {
    render(
      <ExperimentEvaluationContent
        {...baseExperimentProps}
        selectedExperimentId="exp-1"
        isLoading={false}
      />
    )
    expect(screen.getByText('Select Experiment')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search results')).toBeInTheDocument()
    expect(screen.getByText('val1')).toBeInTheDocument()
  })
})

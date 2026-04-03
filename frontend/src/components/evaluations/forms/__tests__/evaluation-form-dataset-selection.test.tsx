import React from 'react'
import { render, screen } from '@testing-library/react'
import { AxiosError } from 'axios'
import { EvaluationFormDatasetSelection } from '../evaluation-form-dataset-selection'
import type { DatasetListItemResponse } from '@/types/datasets'

const mockDatasets: DatasetListItemResponse[] = [
  { id: 'ds-1', name: 'Dataset One' } as DatasetListItemResponse,
  { id: 'ds-2', name: 'Dataset Two' } as DatasetListItemResponse,
]

describe('EvaluationFormDatasetSelection', () => {
  const mockOnDatasetChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Dataset label with required indicator', () => {
    render(
      <EvaluationFormDatasetSelection
        datasetId=""
        datasets={mockDatasets}
        loadingDatasets={false}
        onDatasetChange={mockOnDatasetChange}
      />
    )
    expect(screen.getByLabelText(/dataset/i)).toBeInTheDocument()
  })

  it('shows loading spinner when loadingDatasets is true', () => {
    render(
      <EvaluationFormDatasetSelection
        datasetId=""
        datasets={[]}
        loadingDatasets={true}
        onDatasetChange={mockOnDatasetChange}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows "No datasets available" when datasets is empty', () => {
    render(
      <EvaluationFormDatasetSelection
        datasetId=""
        datasets={[]}
        loadingDatasets={false}
        onDatasetChange={mockOnDatasetChange}
      />
    )
    expect(screen.getByText('No datasets available')).toBeInTheDocument()
  })

  it('shows dataset options when datasets are provided', () => {
    render(
      <EvaluationFormDatasetSelection
        datasetId=""
        datasets={mockDatasets}
        loadingDatasets={false}
        onDatasetChange={mockOnDatasetChange}
      />
    )
    expect(screen.getByText('Dataset One')).toBeInTheDocument()
    expect(screen.getByText('Dataset Two')).toBeInTheDocument()
  })

  it('shows "No permission" when error is 403 Forbidden', () => {
    const forbiddenError = new AxiosError('Forbidden')
    ;(forbiddenError as any).response = { status: 403 }
    render(
      <EvaluationFormDatasetSelection
        datasetId=""
        datasets={mockDatasets}
        loadingDatasets={false}
        onDatasetChange={mockOnDatasetChange}
        error={forbiddenError}
      />
    )
    expect(screen.getByText("You don't have permission to view datasets")).toBeInTheDocument()
  })
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import { AxiosError } from 'axios'
import { ExperimentFormDatasetSelection } from '../experiment-form-dataset-selection'

describe('ExperimentFormDatasetSelection', () => {
  const mockSetDatasetId = jest.fn()
  const mockDatasets = [
    { id: 'dataset-1', name: 'Dataset 1' },
    { id: 'dataset-2', name: 'Dataset 2' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dataset select with label and placeholder', () => {
    render(
      <ExperimentFormDatasetSelection
        datasets={mockDatasets}
        loadingDatasets={false}
        datasetId=""
        setDatasetId={mockSetDatasetId}
        isLoading={false}
      />
    )

    expect(screen.getByLabelText(/dataset/i)).toBeInTheDocument()
  })

  it('renders loading state when loading datasets and no datasetId', () => {
    render(
      <ExperimentFormDatasetSelection
        datasets={mockDatasets}
        loadingDatasets={true}
        datasetId=""
        setDatasetId={mockSetDatasetId}
        isLoading={false}
      />
    )

    expect(screen.getByText('Loading datasets...')).toBeInTheDocument()
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows empty state when no datasets available', () => {
    render(
      <ExperimentFormDatasetSelection
        datasets={[]}
        loadingDatasets={false}
        datasetId=""
        setDatasetId={mockSetDatasetId}
        isLoading={false}
      />
    )

    expect(screen.getByText('No datasets available')).toBeInTheDocument()
  })

  it("shows permission error message when error is forbidden", () => {
    const forbiddenError = new AxiosError('Forbidden')
    ;(forbiddenError as any).response = { status: 403 }

    render(
      <ExperimentFormDatasetSelection
        datasets={mockDatasets}
        loadingDatasets={false}
        datasetId=""
        setDatasetId={mockSetDatasetId}
        isLoading={false}
        error={forbiddenError}
      />
    )

    expect(
      screen.getByText("You don't have permission to view datasets")
    ).toBeInTheDocument()
  })
})


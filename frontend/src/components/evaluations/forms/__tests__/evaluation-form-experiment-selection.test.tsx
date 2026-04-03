import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AxiosError } from 'axios'
import { EvaluationFormExperimentSelection } from '../evaluation-form-experiment-selection'
import type { ExperimentResponse } from '@/types/experiments'

const mockExperiments: ExperimentResponse[] = [
  { id: 'exp-1', name: 'Experiment A', projectId: 'proj-1' } as ExperimentResponse,
  { id: 'exp-2', name: 'Experiment B', projectId: 'proj-1' } as ExperimentResponse,
]

describe('EvaluationFormExperimentSelection', () => {
  const mockOnExperimentAdd = jest.fn()
  const mockOnExperimentRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Experiments label with required indicator', () => {
    render(
      <EvaluationFormExperimentSelection
        selectedExperimentIds={[]}
        experiments={mockExperiments}
        loadingExperiments={false}
        experimentDatasetError=""
        onExperimentAdd={mockOnExperimentAdd}
        onExperimentRemove={mockOnExperimentRemove}
      />
    )
    expect(screen.getByText(/experiments/i)).toBeInTheDocument()
  })

  it('shows loading spinner when loadingExperiments is true', () => {
    render(
      <EvaluationFormExperimentSelection
        selectedExperimentIds={[]}
        experiments={[]}
        loadingExperiments={true}
        experimentDatasetError=""
        onExperimentAdd={mockOnExperimentAdd}
        onExperimentRemove={mockOnExperimentRemove}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows "No experiments available" when experiments is empty', () => {
    render(
      <EvaluationFormExperimentSelection
        selectedExperimentIds={[]}
        experiments={[]}
        loadingExperiments={false}
        experimentDatasetError=""
        onExperimentAdd={mockOnExperimentAdd}
        onExperimentRemove={mockOnExperimentRemove}
      />
    )
    expect(screen.getByText(/no experiments available/i)).toBeInTheDocument()
  })

  it('shows experiment dataset error when provided', () => {
    render(
      <EvaluationFormExperimentSelection
        selectedExperimentIds={[]}
        experiments={mockExperiments}
        loadingExperiments={false}
        experimentDatasetError="Datasets must match"
        onExperimentAdd={mockOnExperimentAdd}
        onExperimentRemove={mockOnExperimentRemove}
      />
    )
    expect(screen.getByText('Datasets must match')).toBeInTheDocument()
  })

  it('shows selected experiments as removable chips', () => {
    render(
      <EvaluationFormExperimentSelection
        selectedExperimentIds={['exp-1']}
        experiments={mockExperiments}
        loadingExperiments={false}
        experimentDatasetError=""
        onExperimentAdd={mockOnExperimentAdd}
        onExperimentRemove={mockOnExperimentRemove}
      />
    )
    expect(screen.getByText('Experiment A')).toBeInTheDocument()
    const removeButtons = screen.getAllByRole('button')
    const removeButton = removeButtons.find((b) => b.querySelector('[data-testid="icon-x"]'))
    if (removeButton) {
      fireEvent.click(removeButton)
      expect(mockOnExperimentRemove).toHaveBeenCalledWith('exp-1')
    }
  })

  it('shows permission error when error is 403 Forbidden', () => {
    const forbiddenError = new AxiosError('Forbidden')
    ;(forbiddenError as any).response = { status: 403 }
    render(
      <EvaluationFormExperimentSelection
        selectedExperimentIds={[]}
        experiments={mockExperiments}
        loadingExperiments={false}
        experimentDatasetError=""
        onExperimentAdd={mockOnExperimentAdd}
        onExperimentRemove={mockOnExperimentRemove}
        error={forbiddenError}
      />
    )
    expect(screen.getByText(/you don't have permission to view experiments/i)).toBeInTheDocument()
  })
})

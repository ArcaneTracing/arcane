import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EvaluationCard } from '../evaluation-card'
import { EvaluationResponse } from '@/types/evaluations'

describe('EvaluationCard', () => {
  const mockEvaluation: EvaluationResponse = {
    id: '1',
    name: 'Test Evaluation',
    description: 'Test Description',
    evaluationType: 'AUTOMATIC',
    evaluationScope: 'EXPERIMENT',
    projectId: 'project-1',
    experiments: [],
    scores: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }

  const mockOnView = jest.fn()
  const mockOnRerun = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render evaluation information', () => {
    render(
      <EvaluationCard
        evaluation={mockEvaluation}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Test Evaluation')).toBeInTheDocument()
  })

  it('should call onView when details button is clicked', () => {
    render(
      <EvaluationCard
        evaluation={mockEvaluation}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    const detailsButton = screen.getByText('Details')
    fireEvent.click(detailsButton)
    expect(mockOnView).toHaveBeenCalledWith('1')
  })

  it('should call onRerun when rerun button is clicked', () => {
    render(
      <EvaluationCard
        evaluation={mockEvaluation}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    const rerunButton = screen.getByRole('button', { name: /re-run/i })
    fireEvent.click(rerunButton)
    expect(mockOnRerun).toHaveBeenCalledWith(mockEvaluation)
  })

  it('should call onDelete when delete button is clicked', () => {
    render(
      <EvaluationCard
        evaluation={mockEvaluation}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
    expect(mockOnDelete).toHaveBeenCalledWith(mockEvaluation)
  })

  it('should display score count', () => {
    const evaluationWithScores = {
      ...mockEvaluation,
      scores: [{ id: '1' }, { id: '2' }] as any,
    }
    render(
      <EvaluationCard
        evaluation={evaluationWithScores}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('2 scores')).toBeInTheDocument()
  })

  it('should display "1 score" when single score', () => {
    const evaluationWithOneScore = {
      ...mockEvaluation,
      scores: [{ id: '1' }] as any,
    }
    render(
      <EvaluationCard
        evaluation={evaluationWithOneScore}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('1 score')).toBeInTheDocument()
  })

  it('shows description when evaluation has description', () => {
    render(
      <EvaluationCard
        evaluation={mockEvaluation}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('shows experiment count when scope is EXPERIMENT and no description', () => {
    const evaluationWithExperiments = {
      ...mockEvaluation,
      description: undefined,
      experiments: [{ id: 'exp-1' }, { id: 'exp-2' }] as any,
    }
    render(
      <EvaluationCard
        evaluation={evaluationWithExperiments}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('2 experiments')).toBeInTheDocument()
  })

  it('shows "1 experiment" when scope is EXPERIMENT with single experiment', () => {
    const evaluationWithOneExperiment = {
      ...mockEvaluation,
      description: undefined,
      experiments: [{ id: 'exp-1' }] as any,
    }
    render(
      <EvaluationCard
        evaluation={evaluationWithOneExperiment}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('1 experiment')).toBeInTheDocument()
  })

  it('shows dataset scope when scope is DATASET', () => {
    const datasetEvaluation = {
      ...mockEvaluation,
      evaluationScope: 'DATASET' as const,
      datasetId: 'ds-1',
      description: undefined,
      experiments: [],
    }
    render(
      <EvaluationCard
        evaluation={datasetEvaluation}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText(/Dataset: Selected/)).toBeInTheDocument()
  })

  it('shows Dataset: None when scope is DATASET and no datasetId', () => {
    const datasetEvaluation = {
      ...mockEvaluation,
      evaluationScope: 'DATASET' as const,
      datasetId: undefined,
      description: undefined,
      experiments: [],
    }
    render(
      <EvaluationCard
        evaluation={datasetEvaluation}
        onView={mockOnView}
        onRerun={mockOnRerun}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText(/Dataset: None/)).toBeInTheDocument()
  })
})


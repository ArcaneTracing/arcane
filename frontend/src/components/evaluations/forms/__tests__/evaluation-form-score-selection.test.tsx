import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { AxiosError } from 'axios'
import { EvaluationFormScoreSelection } from '../evaluation-form-score-selection'
import type { ScoreResponse } from '@/types/scores'

const mockScores: ScoreResponse[] = [
  { id: 'score-1', name: 'Accuracy', projectId: 'proj-1' } as ScoreResponse,
  { id: 'score-2', name: 'F1', projectId: 'proj-1' } as ScoreResponse,
]

describe('EvaluationFormScoreSelection', () => {
  const mockOnScoreAdd = jest.fn()
  const mockOnScoreRemove = jest.fn()
  const mockIsRagasScore = jest.fn(() => false)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Scores label with required indicator', () => {
    render(
      <EvaluationFormScoreSelection
        selectedScoreIds={[]}
        scores={mockScores}
        loadingScores={false}
        isRagasScore={mockIsRagasScore}
        onScoreAdd={mockOnScoreAdd}
        onScoreRemove={mockOnScoreRemove}
      />
    )
    expect(screen.getByText(/scores/i)).toBeInTheDocument()
  })

  it('shows loading spinner when loadingScores is true', () => {
    render(
      <EvaluationFormScoreSelection
        selectedScoreIds={[]}
        scores={[]}
        loadingScores={true}
        isRagasScore={mockIsRagasScore}
        onScoreAdd={mockOnScoreAdd}
        onScoreRemove={mockOnScoreRemove}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows "No scores available" when scores is empty', () => {
    render(
      <EvaluationFormScoreSelection
        selectedScoreIds={[]}
        scores={[]}
        loadingScores={false}
        isRagasScore={mockIsRagasScore}
        onScoreAdd={mockOnScoreAdd}
        onScoreRemove={mockOnScoreRemove}
      />
    )
    expect(screen.getByText(/no scores available/i)).toBeInTheDocument()
  })

  it('shows Select a score to add button when scores are provided', () => {
    render(
      <EvaluationFormScoreSelection
        selectedScoreIds={[]}
        scores={mockScores}
        loadingScores={false}
        isRagasScore={mockIsRagasScore}
        onScoreAdd={mockOnScoreAdd}
        onScoreRemove={mockOnScoreRemove}
      />
    )
    expect(screen.getByText('Select a score to add...')).toBeInTheDocument()
  })

  it('shows selected scores as removable chips', () => {
    render(
      <EvaluationFormScoreSelection
        selectedScoreIds={['score-1']}
        scores={mockScores}
        loadingScores={false}
        isRagasScore={mockIsRagasScore}
        onScoreAdd={mockOnScoreAdd}
        onScoreRemove={mockOnScoreRemove}
      />
    )
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
    const removeButtons = screen.getAllByRole('button')
    const removeButton = removeButtons.find((b) => b.querySelector('[data-testid="icon-x"]'))
    if (removeButton) {
      fireEvent.click(removeButton)
      expect(mockOnScoreRemove).toHaveBeenCalledWith('score-1')
    }
  })

  it('shows RAGAS prefix for RAGAS scores', () => {
    mockIsRagasScore.mockImplementation((s: ScoreResponse) => s.id === 'score-1')
    render(
      <EvaluationFormScoreSelection
        selectedScoreIds={['score-1']}
        scores={mockScores}
        loadingScores={false}
        isRagasScore={mockIsRagasScore}
        onScoreAdd={mockOnScoreAdd}
        onScoreRemove={mockOnScoreRemove}
      />
    )
    expect(screen.getByText('RAGAS: Accuracy')).toBeInTheDocument()
  })

  it('shows permission error when error is 403 Forbidden', () => {
    const forbiddenError = new AxiosError('Forbidden')
    ;(forbiddenError as any).response = { status: 403 }
    render(
      <EvaluationFormScoreSelection
        selectedScoreIds={[]}
        scores={mockScores}
        loadingScores={false}
        isRagasScore={mockIsRagasScore}
        onScoreAdd={mockOnScoreAdd}
        onScoreRemove={mockOnScoreRemove}
        error={forbiddenError}
      />
    )
    expect(screen.getByText(/you don't have permission to view scores/i)).toBeInTheDocument()
  })
})

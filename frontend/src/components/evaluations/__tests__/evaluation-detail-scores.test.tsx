import React from 'react'
import { render, screen } from '@testing-library/react'
import { EvaluationDetailScores } from '../evaluation-detail-scores'
import type { EvaluationResponse } from '@/types/evaluations'
import type { ScoreResponse } from '@/types/scores'
import { EvaluationScope, ScoringType } from '@/types/enums'

const baseEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'DATASET' as const,
  evaluationScope: EvaluationScope.DATASET,
  name: 'Test Eval',
  scores: [{ id: 'score-1', description: 'Ref score', scoringType: 'NUMERIC' }],
  experiments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('EvaluationDetailScores', () => {
  it('shows loading state when loading and no scores', () => {
    render(
      <EvaluationDetailScores
        scores={[]}
        evaluation={baseEvaluation}
        loadingRelated={true}
      />
    )
    expect(screen.getByText('Loading score details...')).toBeInTheDocument()
  })

  it('renders score refs when scores array is empty', () => {
    render(
      <EvaluationDetailScores
        scores={[]}
        evaluation={baseEvaluation}
        loadingRelated={false}
      />
    )
    expect(screen.getByText(/Ref score/)).toBeInTheDocument()
    expect(screen.getByText('NUMERIC')).toBeInTheDocument()
  })

  it('renders full score details when scores are loaded', () => {
    const scores: ScoreResponse[] = [
      {
        id: 'score-1',
        projectId: 'proj-1',
        name: 'Accuracy',
        description: 'Measures accuracy',
        scoringType: ScoringType.NUMERIC,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]
    render(
      <EvaluationDetailScores
        scores={scores}
        evaluation={baseEvaluation}
        loadingRelated={false}
      />
    )
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Measures accuracy')).toBeInTheDocument()
    expect(screen.getByText('NUMERIC')).toBeInTheDocument()
  })

  it('renders scale configuration for ORDINAL score', () => {
    const scores: ScoreResponse[] = [
      {
        id: 'score-1',
        projectId: 'proj-1',
        name: 'Quality',
        description: null,
        scoringType: ScoringType.ORDINAL,
        scale: [
          { label: 'Poor', value: 0 },
          { label: 'Good', value: 1 },
        ],
        ordinalConfig: { acceptable_set: ['Good'], threshold_rank: 1 },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]
    render(
      <EvaluationDetailScores
        scores={scores}
        evaluation={baseEvaluation}
        loadingRelated={false}
      />
    )
    expect(screen.getByText('Poor')).toBeInTheDocument()
    expect(screen.getAllByText('Good').length).toBeGreaterThan(0)
    expect(screen.getByText('Acceptable Set:')).toBeInTheDocument()
  })
})

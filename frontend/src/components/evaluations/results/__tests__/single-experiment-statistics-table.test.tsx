import React from 'react'
import { render, screen } from '@testing-library/react'
import { SingleExperimentStatisticsTable } from '../single-experiment-statistics-table'
import type { EvaluationStatisticsResponse, EvaluationResponse } from '@/types/evaluations'
import type { ScoreResponse } from '@/types/scores'

const mockEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'AB',
  evaluationScope: 'EXPERIMENT',
  name: 'Test Evaluation',
  scores: [{ id: 'score-1', description: 'Accuracy', scoringType: 'NUMERIC' }],
  experiments: [{ id: 'exp-1', promptVersionId: 'pv-1', datasetId: 'ds-1' }],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockScores: ScoreResponse[] = [
  { id: 'score-1', name: 'Accuracy', projectId: 'proj-1', scoringType: 'NUMERIC' } as ScoreResponse,
]

describe('SingleExperimentStatisticsTable', () => {
  it('shows "No scores found" when statistics are empty', () => {
    render(
      <SingleExperimentStatisticsTable
        statistics={[]}
        scores={mockScores}
        evaluation={mockEvaluation}
        experimentId="exp-1"
      />
    )
    expect(screen.getByText('No scores found')).toBeInTheDocument()
  })

  it('renders Score column and numeric statistics for matching experiment', () => {
    const statistics: EvaluationStatisticsResponse[] = [
      {
        experimentId: 'exp-1',
        scoreId: 'score-1',
        numeric: {
          mean: 0.92,
          variance: 0.001,
          std: 0.03,
          p50: 0.92,
          p10: 0.88,
          p90: 0.96,
          ci95_mean: { lower: 0.9, upper: 0.94 },
          n_total: 50,
          n_scored: 50,
        },
        nominal: null,
        ordinal: null,
      },
    ]
    render(
      <SingleExperimentStatisticsTable
        statistics={statistics}
        scores={mockScores}
        evaluation={mockEvaluation}
        experimentId="exp-1"
      />
    )
    expect(screen.getByText('Score')).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('0.920')
    expect(table).toHaveTextContent('[0.900, 0.940]')
  })
})

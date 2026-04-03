import React from 'react'
import { render, screen } from '@testing-library/react'
import { DatasetStatisticsTable } from '../dataset-statistics-table'
import type { DatasetStatisticsResponse, EvaluationResponse } from '@/types/evaluations'
import type { ScoreResponse } from '@/types/scores'

const mockEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'AB',
  evaluationScope: 'DATASET',
  name: 'Test Evaluation',
  scores: [{ id: 'score-1', description: 'Accuracy', scoringType: 'NUMERIC' }],
  experiments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockScores: ScoreResponse[] = [
  { id: 'score-1', name: 'Accuracy', projectId: 'proj-1', scoringType: 'NUMERIC' } as ScoreResponse,
]

describe('DatasetStatisticsTable', () => {
  it('shows "No scores found" when statistics are empty', () => {
    render(
      <DatasetStatisticsTable
        statistics={[]}
        scores={mockScores}
        evaluation={mockEvaluation}
      />
    )
    expect(screen.getByText('No scores found')).toBeInTheDocument()
  })

  it('renders Score column and numeric statistics with mean and CI', () => {
    const statistics: DatasetStatisticsResponse[] = [
      {
        datasetId: 'ds-1',
        scoreId: 'score-1',
        numeric: {
          mean: 0.85,
          variance: 0.0025,
          std: 0.05,
          p50: 0.85,
          p10: 0.7,
          p90: 0.95,
          ci95_mean: { lower: 0.8, upper: 0.9 },
          n_total: 100,
          n_scored: 100,
        },
        nominal: null,
        ordinal: null,
      },
    ]
    render(
      <DatasetStatisticsTable
        statistics={statistics}
        scores={mockScores}
        evaluation={mockEvaluation}
      />
    )
    expect(screen.getByText('Score')).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('0.850')
    expect(table).toHaveTextContent('[0.800, 0.900]')
  })
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import { EvaluationStatisticsTable } from '../evaluation-statistics-table'
import type {
  EvaluationStatisticsResponse,
  EvaluationResponse,
} from '@/types/evaluations'
import type { ExperimentResponse } from '@/types/experiments'
import type { ScoreResponse } from '@/types/scores'

const mockEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'AB',
  evaluationScope: 'EXPERIMENT',
  name: 'Test Evaluation',
  scores: [{ id: 'score-1', name: 'Accuracy' }],
  experiments: [{ id: 'exp-1' }],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockExperiments: ExperimentResponse[] = [
  { id: 'exp-1', name: 'Experiment A', projectId: 'proj-1' } as ExperimentResponse,
]

const mockScores: ScoreResponse[] = [
  { id: 'score-1', name: 'Accuracy', projectId: 'proj-1' } as ScoreResponse,
]

describe('EvaluationStatisticsTable', () => {
  it('renders Score column header', () => {
    render(
      <EvaluationStatisticsTable
        statistics={[]}
        experiments={[]}
        scores={[]}
        evaluation={mockEvaluation}
      />
    )
    expect(screen.getByText('Score')).toBeInTheDocument()
  })

  it('shows "No scores found" when statistics and scoreIds are empty', () => {
    render(
      <EvaluationStatisticsTable
        statistics={[]}
        experiments={[]}
        scores={[]}
        evaluation={mockEvaluation}
      />
    )
    expect(screen.getByText('No scores found')).toBeInTheDocument()
  })

  it('renders experiment names as column headers', () => {
    const statistics: EvaluationStatisticsResponse[] = [
      {
        experimentId: 'exp-1',
        scoreId: 'score-1',
        numeric: {
          mean: 0.85,
          ci95_mean: { lower: 0.8, upper: 0.9 },
          p50: 0.85,
          p10: 0.7,
          p90: 0.95,
          std: 0.05,
          variance: 0.0025,
          n_scored: 100,
          n_total: 100,
        },
        nominal: null,
        ordinal: null,
      },
    ]
    render(
      <EvaluationStatisticsTable
        statistics={statistics}
        experiments={mockExperiments}
        scores={mockScores}
        evaluation={mockEvaluation}
      />
    )
    expect(screen.getByText('Experiment A')).toBeInTheDocument()
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
  })

  it('renders numeric statistics cell with mean and CI', () => {
    const statistics: EvaluationStatisticsResponse[] = [
      {
        experimentId: 'exp-1',
        scoreId: 'score-1',
        numeric: {
          mean: 0.85,
          ci95_mean: { lower: 0.8, upper: 0.9 },
          p50: 0.85,
          p10: 0.7,
          p90: 0.95,
          std: 0.05,
          variance: 0.0025,
          n_scored: 100,
          n_total: 100,
        },
        nominal: null,
        ordinal: null,
      },
    ]
    render(
      <EvaluationStatisticsTable
        statistics={statistics}
        experiments={mockExperiments}
        scores={mockScores}
        evaluation={mockEvaluation}
      />
    )
    const table = screen.getByRole('table')
    expect(table).toHaveTextContent('0.850')
    expect(table).toHaveTextContent('[0.800, 0.900]')
  })

  it('renders N/A for missing statistics cell', () => {
    const statistics: EvaluationStatisticsResponse[] = [
      {
        experimentId: 'exp-1',
        scoreId: 'score-1',
        numeric: null,
        nominal: null,
        ordinal: null,
      },
    ]
    render(
      <EvaluationStatisticsTable
        statistics={statistics}
        experiments={mockExperiments}
        scores={mockScores}
        evaluation={mockEvaluation}
      />
    )
    const naElements = screen.getAllByText('N/A')
    expect(naElements.length).toBeGreaterThan(0)
  })

  it('renders ordinal statistics with median and mode', () => {
    const statistics: EvaluationStatisticsResponse[] = [
      {
        experimentId: 'exp-1',
        scoreId: 'score-1',
        numeric: null,
        nominal: null,
        ordinal: {
          median_category: 'B',
          mode_code: 'B',
          entropy: 1.5,
          num_distinct_categories: 3,
          n_scored: 50,
          n_total: 50,
          percentile_categories: { p10: 'A', p50: 'B', p90: 'C' },
          counts_by_code: {},
          proportions_by_code: {},
          ci_proportion_by_code: {},
          cdf: {},
          tail_mass_below: { threshold_rank: 0, proportion: 0, ci: { lower: 0, upper: 0 } },
        },
      },
    ]
    render(
      <EvaluationStatisticsTable
        statistics={statistics}
        experiments={mockExperiments}
        scores={mockScores}
        evaluation={mockEvaluation}
      />
    )
    expect(screen.getByText(/Median: B/)).toBeInTheDocument()
    expect(screen.getByText(/Mode: B/)).toBeInTheDocument()
  })

  it('renders nominal statistics with mode', () => {
    const statistics: EvaluationStatisticsResponse[] = [
      {
        experimentId: 'exp-1',
        scoreId: 'score-1',
        numeric: null,
        nominal: {
          mode_code: 'cat1',
          entropy: 1.2,
          num_distinct_categories: 2,
          n_scored: 40,
          n_total: 40,
          counts_by_code: {},
          proportions_by_code: {},
          ci_proportion_by_code: {},
        },
        ordinal: null,
      },
    ]
    render(
      <EvaluationStatisticsTable
        statistics={statistics}
        experiments={mockExperiments}
        scores={mockScores}
        evaluation={mockEvaluation}
      />
    )
    expect(screen.getByText(/Mode: cat1/)).toBeInTheDocument()
    expect(screen.getByText(/40 \/ 40 scored/)).toBeInTheDocument()
  })
})

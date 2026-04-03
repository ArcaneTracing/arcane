import React from 'react'
import { render, screen } from '@testing-library/react'
import { ComparisonScatterChart } from '../comparison-scatter-chart'
import type { ExperimentComparisonResponse } from '@/types/evaluations'

const mockUseExperimentScoresQuery = jest.fn()
jest.mock('@/hooks/evaluations/use-evaluations-query', () => ({
  useExperimentScoresQuery: (
    projectId: string,
    evaluationId: string,
    experimentId: string
  ) => mockUseExperimentScoresQuery(projectId, evaluationId, experimentId),
}))

const baseComparison: ExperimentComparisonResponse = {
  numeric: { n_paired: 2, mean_a: 0.875, mean_b: 0.85, delta_mean: -0.025, ci95_delta: { lower: null, upper: null }, p_value_permutation: null, cohens_dz: null, win_rate: null, loss_rate: null, tie_rate: null },
  nominal: null,
  ordinal: null,
}

describe('ComparisonScatterChart', () => {
  const defaultProps = {
    comparison: baseComparison,
    experimentAName: 'Exp A',
    experimentBName: 'Exp B',
    projectId: 'proj-1',
    evaluationId: 'eval-1',
    scoreId: 'score-1',
    experimentIdA: 'exp-a',
    experimentIdB: 'exp-b',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseExperimentScoresQuery.mockImplementation((_, __, expId: string) => {
      if (expId === 'exp-a') {
        return {
          data: {
            scoreResults: [
              { scoreId: 'score-1', datasetRowId: 'row-1', value: 0.9 },
              { scoreId: 'score-1', datasetRowId: 'row-2', value: 0.85 },
            ],
          },
          isLoading: false,
        }
      }
      return {
        data: {
          scoreResults: [
            { scoreId: 'score-1', datasetRowId: 'row-1', value: 0.88 },
            { scoreId: 'score-1', datasetRowId: 'row-2', value: 0.82 },
          ],
        },
        isLoading: false,
      }
    })
  })

  it('shows loading state when scores loading', () => {
    mockUseExperimentScoresQuery.mockReturnValue({ data: null, isLoading: true })

    render(<ComparisonScatterChart {...defaultProps} />)
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows "No paired data available" when no paired data', () => {
    mockUseExperimentScoresQuery.mockReturnValue({
      data: { scoreResults: [] },
      isLoading: false,
    })

    render(<ComparisonScatterChart {...defaultProps} />)
    expect(screen.getByText(/No paired data available for scatter plot/)).toBeInTheDocument()
  })

  it('renders scatter chart when paired data available', () => {
    const { container } = render(<ComparisonScatterChart {...defaultProps} />)
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })
})

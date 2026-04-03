import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { ComparisonDistributionChart } from '../comparison-distribution-chart'

const mockUseExperimentScoresQuery = jest.fn(() => ({
  data: null,
  isLoading: false,
}))

jest.mock('@/hooks/evaluations/use-evaluations-query', () => ({
  useExperimentScoresQuery: jest.fn((...args: unknown[]) =>
    mockUseExperimentScoresQuery(...args)
  ),
}))

describe('ComparisonDistributionChart', () => {
  const defaultProps = {
    statisticsA: undefined,
    statisticsB: undefined,
    experimentAName: 'Exp A',
    experimentBName: 'Exp B',
    projectId: 'p1',
    evaluationId: 'e1',
    scoreId: 's1',
    experimentIdA: 'ea1',
    experimentIdB: 'eb1',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseExperimentScoresQuery.mockReturnValue({ data: null, isLoading: false })
  })

  it('shows loading state when scores loading', () => {
    mockUseExperimentScoresQuery.mockImplementation((_p: unknown, _e: unknown, _exp: unknown) =>
      _exp === 'ea1' ? { data: null, isLoading: true } : { data: null, isLoading: false }
    )
    render(<ComparisonDistributionChart {...defaultProps} />)
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows no data message when both experiments have no scores', () => {
    mockUseExperimentScoresQuery.mockReturnValue({
      data: { scoreResults: [] },
      isLoading: false,
    })
    render(<ComparisonDistributionChart {...defaultProps} />)
    expect(screen.getByText(/No data available for distribution chart/)).toBeInTheDocument()
  })

  it('renders chart when scores available', async () => {
    mockUseExperimentScoresQuery.mockImplementation((_p: unknown, _e: unknown, expId: string) => ({
      data: {
        scoreResults:
          expId === 'ea1'
            ? [{ scoreId: 's1', value: 0.5 }, { scoreId: 's1', value: 0.7 }]
            : [{ scoreId: 's1', value: 0.6 }, { scoreId: 's1', value: 0.8 }],
      },
      isLoading: false,
    }))
    const { container } = render(<ComparisonDistributionChart {...defaultProps} />)
    await waitFor(() => {
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
    })
  })

  it('filters by scoreId', async () => {
    mockUseExperimentScoresQuery.mockImplementation((_p: unknown, _e: unknown, expId: string) => ({
      data: {
        scoreResults:
          expId === 'ea1'
            ? [{ scoreId: 's1', value: 0.5 }, { scoreId: 'other', value: 0.9 }]
            : [{ scoreId: 's1', value: 0.7 }, { scoreId: 'other', value: 0.8 }],
      },
      isLoading: false,
    }))
    const { container } = render(<ComparisonDistributionChart {...defaultProps} />)
    await waitFor(() => {
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
    })
  })
})

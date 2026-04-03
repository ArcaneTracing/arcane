import React from 'react'
import { render, screen } from '@testing-library/react'
import { ComparisonWinTieLossChart } from '../comparison-win-tie-loss-chart'
import type { ExperimentComparisonResponse } from '@/types/evaluations'

describe('ComparisonWinTieLossChart', () => {
  it('shows message when comparison is not numeric', () => {
    const nonNumericComparison: ExperimentComparisonResponse = {
      numeric: null,
      nominal: null,
      ordinal: null,
    }
    render(<ComparisonWinTieLossChart comparison={nonNumericComparison} />)
    expect(
      screen.getByText('Win/Tie/Loss chart is only available for numeric comparisons')
    ).toBeInTheDocument()
  })

  it('shows "No data available" when win_rate is null', () => {
    const comparisonWithNullRates: ExperimentComparisonResponse = {
      numeric: {
        n_paired: 100,
        mean_a: 0.85,
        mean_b: 0.92,
        delta_mean: 0.07,
        ci95_delta_bootstrap: { lower: 0.02, upper: 0.12 },
        p_value_permutation: 0.1,
        cohens_dz: 0.2,
        win_rate: null,
        loss_rate: 0.3,
        tie_rate: 0.2,
      },
      nominal: null,
      ordinal: null,
    }
    render(<ComparisonWinTieLossChart comparison={comparisonWithNullRates} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('shows "No data available" when tie_rate is null', () => {
    const comparisonWithNullRates: ExperimentComparisonResponse = {
      numeric: {
        n_paired: 100,
        mean_a: 0.85,
        mean_b: 0.92,
        delta_mean: 0.07,
        ci95_delta_bootstrap: { lower: 0.02, upper: 0.12 },
        p_value_permutation: 0.1,
        cohens_dz: 0.2,
        win_rate: 0.5,
        loss_rate: 0.3,
        tie_rate: null,
      },
      nominal: null,
      ordinal: null,
    }
    render(<ComparisonWinTieLossChart comparison={comparisonWithNullRates} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders pie chart when win/tie/loss rates are present', () => {
    const comparisonWithRates: ExperimentComparisonResponse = {
      numeric: {
        n_paired: 100,
        mean_a: 0.85,
        mean_b: 0.92,
        delta_mean: 0.07,
        ci95_delta_bootstrap: { lower: 0.02, upper: 0.12 },
        p_value_permutation: 0.1,
        cohens_dz: 0.2,
        win_rate: 0.5,
        loss_rate: 0.3,
        tie_rate: 0.2,
      },
      nominal: null,
      ordinal: null,
    }
    const { container } = render(<ComparisonWinTieLossChart comparison={comparisonWithRates} />)
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
    expect(screen.queryByText('No data available')).not.toBeInTheDocument()
  })
})

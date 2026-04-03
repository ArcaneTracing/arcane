import React from 'react'
import { render, screen } from '@testing-library/react'
import { ComparisonDeltaChart } from '../comparison-delta-chart'
import type { ExperimentComparisonResponse } from '@/types/evaluations'

describe('ComparisonDeltaChart', () => {
  it('shows message when comparison is not numeric', () => {
    const nonNumericComparison: ExperimentComparisonResponse = {
      numeric: null,
      nominal: null,
      ordinal: null,
    }
    render(<ComparisonDeltaChart comparison={nonNumericComparison} />)
    expect(screen.getByText('Delta chart is only available for numeric comparisons')).toBeInTheDocument()
  })

  it('shows "No data available" when delta_mean is null', () => {
    const comparisonWithNullDelta: ExperimentComparisonResponse = {
      numeric: {
        n_paired: 100,
        mean_a: 0.85,
        mean_b: 0.92,
        delta_mean: null,
        ci95_delta_bootstrap: { lower: null, upper: null },
        p_value_permutation: 0.1,
        cohens_dz: 0.2,
        win_rate: 0.5,
        loss_rate: 0.3,
        tie_rate: 0.2,
      },
      nominal: null,
      ordinal: null,
    }
    render(<ComparisonDeltaChart comparison={comparisonWithNullDelta} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })
})

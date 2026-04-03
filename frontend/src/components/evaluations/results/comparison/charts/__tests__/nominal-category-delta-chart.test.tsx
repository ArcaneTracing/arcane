import React from 'react'
import { render, screen } from '@testing-library/react'
import { NominalCategoryDeltaChart } from '../nominal-category-delta-chart'
import type { ExperimentComparisonResponse } from '@/types/evaluations'

describe('NominalCategoryDeltaChart', () => {
  it('shows message when comparison is not nominal', () => {
    const nonNominalComparison: ExperimentComparisonResponse = {
      numeric: null,
      nominal: null,
      ordinal: null,
    }
    render(<NominalCategoryDeltaChart comparison={nonNominalComparison} />)
    expect(
      screen.getByText('Category delta chart is only available for nominal comparisons')
    ).toBeInTheDocument()
  })

  it('shows "No data available" when distribution_comparison is empty', () => {
    const comparisonWithEmptyDistribution: ExperimentComparisonResponse = {
      numeric: null,
      nominal: {
        n_paired: 100,
        distribution_comparison: {},
        bowker_test: { chi_squared: null, p_value: null, degrees_of_freedom: null },
        cramers_v: null,
        entropy_difference: null,
        category_changes: null,
      },
      ordinal: null,
    }
    render(<NominalCategoryDeltaChart comparison={comparisonWithEmptyDistribution} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders chart when distribution_comparison has data', () => {
    const comparisonWithData: ExperimentComparisonResponse = {
      numeric: null,
      nominal: {
        n_paired: 100,
        distribution_comparison: {
          A: {
            proportion_a: 0.3,
            proportion_b: 0.4,
            delta_proportion: 0.1,
            ci_delta: { lower: 0.05, upper: 0.15 },
          },
          B: {
            proportion_a: 0.5,
            proportion_b: 0.4,
            delta_proportion: -0.1,
            ci_delta: { lower: -0.15, upper: -0.05 },
          },
        },
        bowker_test: { chi_squared: null, p_value: null, degrees_of_freedom: null },
        cramers_v: null,
        entropy_difference: null,
        category_changes: null,
      },
      ordinal: null,
    }
    const { container } = render(<NominalCategoryDeltaChart comparison={comparisonWithData} />)
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })
})

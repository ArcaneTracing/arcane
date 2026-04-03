import React from 'react'
import { render, screen } from '@testing-library/react'
import { NominalDistributionComparisonChart } from '../nominal-distribution-comparison-chart'
import type { ExperimentComparisonResponse } from '@/types/evaluations'

describe('NominalDistributionComparisonChart', () => {
  it('shows message when comparison is not nominal', () => {
    const nonNominalComparison: ExperimentComparisonResponse = {
      numeric: null,
      nominal: null,
      ordinal: null,
    }
    render(
      <NominalDistributionComparisonChart
        comparison={nonNominalComparison}
        statisticsA={undefined}
        statisticsB={undefined}
        experimentAName="Exp A"
        experimentBName="Exp B"
      />
    )
    expect(
      screen.getByText('Distribution comparison chart is only available for nominal comparisons')
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
    render(
      <NominalDistributionComparisonChart
        comparison={comparisonWithEmptyDistribution}
        statisticsA={undefined}
        statisticsB={undefined}
        experimentAName="Exp A"
        experimentBName="Exp B"
      />
    )
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
        },
        bowker_test: { chi_squared: null, p_value: null, degrees_of_freedom: null },
        cramers_v: null,
        entropy_difference: null,
        category_changes: null,
      },
      ordinal: null,
    }
    const { container } = render(
      <NominalDistributionComparisonChart
        comparison={comparisonWithData}
        statisticsA={undefined}
        statisticsB={undefined}
        experimentAName="Exp A"
        experimentBName="Exp B"
      />
    )
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import { OrdinalDistributionComparisonChart } from '../ordinal-distribution-comparison-chart'
import type { ExperimentComparisonResponse } from '@/types/evaluations'

jest.mock('@/hooks/scores/use-scores-query', () => ({
  useScoreQuery: () => ({
    data: { scale: [{ label: 'A', value: 0 }] },
    isLoading: false,
  }),
}))

const baseProps = {
  statisticsA: undefined,
  statisticsB: undefined,
  experimentAName: 'Exp A',
  experimentBName: 'Exp B',
  projectId: 'proj-1',
  scoreId: 'score-1',
}

describe('OrdinalDistributionComparisonChart', () => {
  it('shows message when comparison is not ordinal', () => {
    const nonOrdinalComparison: ExperimentComparisonResponse = {
      numeric: null,
      nominal: null,
      ordinal: null,
    }
    render(
      <OrdinalDistributionComparisonChart
        comparison={nonOrdinalComparison}
        {...baseProps}
      />
    )
    expect(
      screen.getByText('Ordered distribution comparison chart is only available for ordinal comparisons')
    ).toBeInTheDocument()
  })

  it('shows "No data available" when distribution_comparison is empty', () => {
    const comparison: ExperimentComparisonResponse = {
      numeric: null,
      nominal: null,
      ordinal: {
        n_paired: 100,
        distribution_comparison: {},
        bowker_test: { chi_squared: null, p_value: null, degrees_of_freedom: null },
        cramers_v: null,
        entropy_difference: null,
        category_changes: null,
        cdf_comparison: {},
        delta_pass_rate: null,
        delta_tail_mass: null,
        median_comparison: { median_a: null, median_b: null },
        percentile_shift: { p50: { category_a: null, category_b: null }, p90: { category_a: null, category_b: null } },
        wilcoxon_signed_rank: { w_statistic: null, p_value: null },
        cliffs_delta: null,
        probability_of_superiority: null,
      },
    }
    render(<OrdinalDistributionComparisonChart comparison={comparison} {...baseProps} />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders chart when distribution_comparison has data', () => {
    const comparison: ExperimentComparisonResponse = {
      numeric: null,
      nominal: null,
      ordinal: {
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
        cdf_comparison: { A: { cdf_a: 0.3, cdf_b: 0.4, delta_cdf: 0.1 } },
        delta_pass_rate: null,
        delta_tail_mass: null,
        median_comparison: { median_a: 'A', median_b: 'A' },
        percentile_shift: { p50: { category_a: 'A', category_b: 'A' }, p90: { category_a: 'A', category_b: 'A' } },
        wilcoxon_signed_rank: { w_statistic: null, p_value: null },
        cliffs_delta: null,
        probability_of_superiority: null,
      },
    }
    const { container } = render(
      <OrdinalDistributionComparisonChart comparison={comparison} {...baseProps} />
    )
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })
})
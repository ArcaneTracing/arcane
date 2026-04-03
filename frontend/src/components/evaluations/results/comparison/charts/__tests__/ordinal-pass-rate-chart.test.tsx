import React from 'react'
import { render, screen } from '@testing-library/react'
import { OrdinalPassRateChart } from '../ordinal-pass-rate-chart'
import type { ExperimentComparisonResponse } from '@/types/evaluations'

jest.mock('@/hooks/scores/use-scores-query', () => ({
  useScoreQuery: () => ({
    data: { ordinalConfig: { acceptable_set: ['A', 'B'], threshold_rank: 1 } },
    isLoading: false,
  }),
}))

const createOrdinalComparison = (overrides?: Partial<ExperimentComparisonResponse['ordinal']>) =>
  ({
    numeric: null,
    nominal: null,
    ordinal: {
      n_paired: 100,
      distribution_comparison: { A: { proportion_a: 0.3, proportion_b: 0.4, delta_proportion: 0.1, ci_delta: { lower: 0.05, upper: 0.15 } } },
      bowker_test: { chi_squared: null, p_value: null, degrees_of_freedom: null },
      cramers_v: null,
      entropy_difference: null,
      category_changes: null,
      cdf_comparison: {},
      delta_pass_rate: { pass_rate_a: 0.8, pass_rate_b: 0.85, delta: 0.05, ci: { lower: 0.02, upper: 0.08 } },
      delta_tail_mass: null,
      median_comparison: { median_a: null, median_b: null },
      percentile_shift: { p50: { category_a: null, category_b: null }, p90: { category_a: null, category_b: null } },
      wilcoxon_signed_rank: { w_statistic: null, p_value: null },
      cliffs_delta: null,
      probability_of_superiority: null,
      ...overrides,
    },
  }) as ExperimentComparisonResponse

describe('OrdinalPassRateChart', () => {
  it('shows message when comparison is not ordinal', () => {
    const nonOrdinalComparison: ExperimentComparisonResponse = {
      numeric: null,
      nominal: null,
      ordinal: null,
    }
    render(
      <OrdinalPassRateChart comparison={nonOrdinalComparison} projectId="proj-1" scoreId="score-1" />
    )
    expect(
      screen.getByText('Pass-rate chart is only available for ordinal comparisons')
    ).toBeInTheDocument()
  })

  it('shows "No pass-rate data available" when delta_pass_rate is null', () => {
    const comparison = createOrdinalComparison({ delta_pass_rate: null })
    render(<OrdinalPassRateChart comparison={comparison} projectId="proj-1" scoreId="score-1" />)
    expect(screen.getByText('No pass-rate data available for comparison')).toBeInTheDocument()
  })

  it('renders chart when pass rate data is present', () => {
    const comparison = createOrdinalComparison()
    const { container } = render(
      <OrdinalPassRateChart comparison={comparison} projectId="proj-1" scoreId="score-1" />
    )
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })
})

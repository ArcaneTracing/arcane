import React from 'react'
import { render, screen } from '@/__tests__/test-utils'
import { ExperimentComparisonCharts } from '../experiment-comparison-charts'
import type { ExperimentComparisonResponse } from '@/types/evaluations'

jest.mock('@/hooks/evaluations/use-evaluations-query', () => ({
  useExperimentScoresQuery: () => ({ data: null, isLoading: false }),
}))

jest.mock('@/hooks/scores/use-scores-query', () => ({
  useScoreQuery: () => ({
    data: { ordinalConfig: { acceptable_set: ['A', 'B'], threshold_rank: 1 } },
    isLoading: false,
  }),
}))

describe('ExperimentComparisonCharts', () => {
  const baseProps = {
    projectId: 'proj-1',
    evaluationId: 'eval-1',
    scoreId: 'score-1',
    experimentIdA: 'exp-a',
    experimentIdB: 'exp-b',
    experimentAName: 'Experiment A',
    experimentBName: 'Experiment B',
  }

  it('renders numeric charts when comparison is numeric', () => {
    const numericComparison: ExperimentComparisonResponse = {
      numeric: {
        n_paired: 100,
        mean_a: 0.85,
        mean_b: 0.92,
        delta_mean: 0.07,
        ci95_delta: { lower: 0.02, upper: 0.12 },
        p_value_permutation: 0.1,
        cohens_dz: 0.2,
        win_rate: 0.5,
        loss_rate: 0.3,
        tie_rate: 0.2,
      },
      nominal: null,
      ordinal: null,
    }
    render(
      <ExperimentComparisonCharts
        comparison={numericComparison}
        statisticsA={undefined}
        statisticsB={undefined}
        {...baseProps}
      />
    )
    expect(screen.getByText('Delta + Confidence Interval')).toBeInTheDocument()
    expect(screen.getByText('Win / Tie / Loss')).toBeInTheDocument()
    expect(screen.getByText('Paired Scatter')).toBeInTheDocument()
  })

  it('renders nominal charts when comparison is nominal', () => {
    const nominalComparison: ExperimentComparisonResponse = {
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
    render(
      <ExperimentComparisonCharts
        comparison={nominalComparison}
        statisticsA={undefined}
        statisticsB={undefined}
        {...baseProps}
      />
    )
    expect(screen.getByText('Distribution Comparison')).toBeInTheDocument()
    expect(screen.getByText('Category Delta')).toBeInTheDocument()
  })

  it('renders ordinal charts when comparison is ordinal', () => {
    const ordinalComparison: ExperimentComparisonResponse = {
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
        cdf_comparison: {},
        delta_pass_rate: {
          pass_rate_a: 0.8,
          pass_rate_b: 0.85,
          delta: 0.05,
          ci: { lower: 0.02, upper: 0.08 },
        },
        delta_tail_mass: {
          tail_mass_a: 0.1,
          tail_mass_b: 0.08,
          delta: -0.02,
          ci: { lower: -0.04, upper: 0 },
        },
        median_comparison: { median_a: 'A', median_b: 'A' },
        percentile_shift: {
          p50: { category_a: 'A', category_b: 'A' },
          p90: { category_a: 'B', category_b: 'B' },
        },
        wilcoxon_signed_rank: { w_statistic: 100, p_value: 0.1 },
        cliffs_delta: 0.1,
        probability_of_superiority: 0.55,
      },
    }
    render(
      <ExperimentComparisonCharts
        comparison={ordinalComparison}
        statisticsA={undefined}
        statisticsB={undefined}
        {...baseProps}
      />
    )
    expect(screen.getByText('Ordered Distribution Comparison')).toBeInTheDocument()
    expect(screen.getByText('Pass-Rate Comparison')).toBeInTheDocument()
    expect(screen.getByText('Tail-Risk Comparison')).toBeInTheDocument()
  })

  it('renders nothing when comparison has no numeric, nominal, or ordinal data', () => {
    const emptyComparison: ExperimentComparisonResponse = {
      numeric: null,
      nominal: null,
      ordinal: null,
    }
    const { container } = render(
      <ExperimentComparisonCharts
        comparison={emptyComparison}
        statisticsA={undefined}
        statisticsB={undefined}
        {...baseProps}
      />
    )
    expect(screen.queryByText('Delta + Confidence Interval')).not.toBeInTheDocument()
    expect(screen.queryByText('Distribution Comparison')).not.toBeInTheDocument()
    expect(screen.queryByText('Ordered Distribution Comparison')).not.toBeInTheDocument()
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })
})

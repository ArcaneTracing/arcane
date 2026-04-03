import React from 'react'
import { render, screen } from '@testing-library/react'
import { ExperimentMetricStats } from '../experiment-metric-stats'
import type { EvaluationStatisticsResponse } from '@/types/evaluations'

describe('ExperimentMetricStats', () => {
  it('shows "No statistics available" when statistics is undefined', () => {
    render(
      <ExperimentMetricStats
        experimentName="Exp A"
        statistics={undefined}
        scoreName="Accuracy"
      />
    )
    expect(screen.getByText('Exp A')).toBeInTheDocument()
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
    expect(screen.getByText('No statistics available')).toBeInTheDocument()
  })

  it('renders numeric statistics', () => {
    const statistics: EvaluationStatisticsResponse = {
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
    }
    render(
      <ExperimentMetricStats
        experimentName="Experiment A"
        statistics={statistics}
        scoreName="Accuracy"
      />
    )
    expect(screen.getByText('Experiment A')).toBeInTheDocument()
    expect(screen.getByText('0.850')).toBeInTheDocument()
    expect(screen.getByText('[0.800, 0.900]')).toBeInTheDocument()
    expect(screen.getByText('100 / 100')).toBeInTheDocument()
  })

  it('renders nominal statistics', () => {
    const statistics: EvaluationStatisticsResponse = {
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
    }
    render(
      <ExperimentMetricStats
        experimentName="Exp B"
        statistics={statistics}
        scoreName="Category"
      />
    )
    expect(screen.getByText('cat1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('40 / 40')).toBeInTheDocument()
  })

  it('renders ordinal statistics', () => {
    const statistics: EvaluationStatisticsResponse = {
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
    }
    render(
      <ExperimentMetricStats
        experimentName="Exp C"
        statistics={statistics}
        scoreName="Grade"
      />
    )
    expect(screen.getByText('Exp C')).toBeInTheDocument()
    expect(screen.getByText('Grade')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText(/50 \/ 50/)).toBeInTheDocument()
  })
})

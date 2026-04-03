import React from 'react'
import { render, screen } from '@testing-library/react'
import { ExperimentComparisonStats } from '../experiment-comparison-stats'
import type { ExperimentComparisonResponse } from '@/types/evaluations'

const mockNumericComparison: ExperimentComparisonResponse = {
  numeric: {
    n_paired: 100,
    mean_a: 0.85,
    mean_b: 0.92,
    delta_mean: 0.07,
    ci95_delta: { lower: 0.03, upper: 0.11 },
    p_value_permutation: 0.002,
    cohens_dz: 0.5,
    win_rate: 0.65,
    loss_rate: 0.25,
    tie_rate: 0.1,
  },
  nominal: null,
  ordinal: null,
}

describe('ExperimentComparisonStats', () => {
  it('renders "No comparison data available" when comparison has no numeric, nominal, or ordinal data', () => {
    const emptyComparison: ExperimentComparisonResponse = {
      numeric: null,
      nominal: null,
      ordinal: null,
    }
    render(
      <ExperimentComparisonStats
        comparison={emptyComparison}
        experimentAName="Exp A"
        experimentBName="Exp B"
      />
    )
    expect(screen.getByText('No comparison data available')).toBeInTheDocument()
    expect(screen.getByText(/Unable to determine comparison type/)).toBeInTheDocument()
  })

  it('renders numeric comparison stats when numeric data is present', () => {
    render(
      <ExperimentComparisonStats
        comparison={mockNumericComparison}
        experimentAName="Experiment A"
        experimentBName="Experiment B"
      />
    )
    expect(screen.getByText('Comparison Stats (Experiment B vs Experiment A)')).toBeInTheDocument()
    expect(screen.getByText(/Statistical comparison results for paired dataset rows \(Numeric\)/)).toBeInTheDocument()
    expect(screen.getByText('0.850')).toBeInTheDocument()
    expect(screen.getByText('0.920')).toBeInTheDocument()
    expect(screen.getByText('+0.070')).toBeInTheDocument()
    expect(screen.getByText('65.0%')).toBeInTheDocument()
    expect(screen.getByText('25.0%')).toBeInTheDocument()
    expect(screen.getByText('10.0%')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders significance badge for p-value', () => {
    render(
      <ExperimentComparisonStats
        comparison={mockNumericComparison}
        experimentAName="Exp A"
        experimentBName="Exp B"
      />
    )
    expect(screen.getByText('**')).toBeInTheDocument()
  })
})

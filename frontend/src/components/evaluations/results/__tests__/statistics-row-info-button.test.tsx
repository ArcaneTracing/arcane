import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  NumericStatsInfoButton,
  OrdinalStatsInfoButton,
  NominalStatsInfoButton,
} from '../statistics-row-info-button'

describe('NumericStatsInfoButton', () => {
  it('returns null when stat has no data (mean or ci95 null)', () => {
    const { container } = render(
      <NumericStatsInfoButton
        stat={{
          mean: null,
          ci95_mean: { lower: null, upper: null },
          p50: null,
          p10: null,
          p90: null,
          std: null,
          variance: null,
          n_scored: 0,
          n_total: 0,
        }}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when ci95_mean has null bounds', () => {
    const { container } = render(
      <NumericStatsInfoButton
        stat={{
          mean: 0.5,
          ci95_mean: { lower: null, upper: null },
          p50: 0.5,
          p10: 0.1,
          p90: 0.9,
          std: 0.1,
          variance: 0.01,
          n_scored: 10,
          n_total: 10,
        }}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders InfoButton with stat content when has valid data', () => {
    render(
      <NumericStatsInfoButton
        stat={{
          mean: 0.75,
          ci95_mean: { lower: 0.7, upper: 0.8 },
          p50: 0.75,
          p10: 0.5,
          p90: 0.95,
          std: 0.1,
          variance: 0.01,
          n_scored: 100,
          n_total: 100,
        }}
      />
    )
    expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument()
  })
})

describe('OrdinalStatsInfoButton', () => {
  it('renders InfoButton with ordinal stat content', () => {
    render(
      <OrdinalStatsInfoButton
        stat={{
          median_category: 'B',
          mode_code: 'B',
          entropy: 1.5,
          num_distinct_categories: 3,
          n_scored: 50,
          n_total: 50,
          percentile_categories: { p10: 'A', p50: 'B', p90: 'C' },
          counts_by_code: {},
        }}
      />
    )
    expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument()
  })

  it('renders counts by category when counts_by_code has entries', () => {
    render(
      <OrdinalStatsInfoButton
        stat={{
          median_category: 'B',
          mode_code: 'B',
          entropy: 1.5,
          num_distinct_categories: 3,
          n_scored: 50,
          n_total: 50,
          percentile_categories: { p10: 'A', p50: 'B', p90: 'C' },
          counts_by_code: { A: 10, B: 30, C: 10 },
        }}
      />
    )
    expect(screen.getByText('Counts by category')).toBeInTheDocument()
    expect(screen.getByText(/A: 10, B: 30, C: 10/)).toBeInTheDocument()
  })
})

describe('NominalStatsInfoButton', () => {
  it('renders InfoButton with nominal stat content', () => {
    render(
      <NominalStatsInfoButton
        stat={{
          mode_code: 'cat1',
          entropy: 1.2,
          num_distinct_categories: 2,
          n_scored: 40,
          n_total: 40,
          counts_by_code: {},
        }}
      />
    )
    expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument()
  })

  it('renders counts by category when counts_by_code has entries', () => {
    render(
      <NominalStatsInfoButton
        stat={{
          mode_code: 'cat1',
          entropy: 1.2,
          num_distinct_categories: 2,
          n_scored: 40,
          n_total: 40,
          counts_by_code: { cat1: 25, cat2: 15 },
        }}
      />
    )
    expect(screen.getByText('Counts by category')).toBeInTheDocument()
    expect(screen.getByText(/cat1: 25, cat2: 15/)).toBeInTheDocument()
  })
})

import {
  truncateText,
  getStatisticsDescription,
} from '../evaluation-results-general-sections'

describe('truncateText', () => {
  it('returns text as-is when length <= maxLength', () => {
    expect(truncateText('short', 30)).toBe('short')
    expect(truncateText('a'.repeat(30), 30)).toBe('a'.repeat(30))
  })

  it('truncates and appends ellipsis when length > maxLength', () => {
    expect(truncateText('this is a long text', 10)).toBe('this is a ...')
  })

  it('uses default maxLength of 30', () => {
    const long = 'a'.repeat(35)
    expect(truncateText(long)).toBe('a'.repeat(30) + '...')
  })
})

describe('getStatisticsDescription', () => {
  it('returns dataset description when isDatasetEvaluation', () => {
    expect(getStatisticsDescription(true, false)).toBe('Statistical analysis of score results')
  })

  it('returns dataset description when hasSingleExperiment', () => {
    expect(getStatisticsDescription(false, true)).toBe('Statistical analysis of score results')
  })

  it('returns experiment description for multi-experiment', () => {
    expect(getStatisticsDescription(false, false)).toBe(
      'Statistical analysis of score results across experiments'
    )
  })
})

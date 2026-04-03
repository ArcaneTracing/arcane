import { lookbackLabels, lookbackOptions } from '../lookback-utils'
import { Lookback } from '@/types/enums'

describe('lookback-utils', () => {
  it('has labels for all Lookback values', () => {
    expect(lookbackLabels[Lookback.HOUR]).toBe('Last Hour')
    expect(lookbackLabels[Lookback.DAY]).toBe('Last 24 Hours')
  })

  it('lookbackOptions has label and value for each option', () => {
    expect(lookbackOptions.length).toBeGreaterThan(0)
    expect(lookbackOptions[0]).toHaveProperty('label')
    expect(lookbackOptions[0]).toHaveProperty('value')
  })
})

import { calculateDatesFromLookback } from '../lookback'

describe('calculateDatesFromLookback', () => {
  it('returns now for both start and end when lookback is invalid', () => {
    const { startDate, endDate } = calculateDatesFromLookback('x')
    expect(startDate.getTime()).toBe(endDate.getTime())
  })

  it('computes 5m lookback', () => {
    const { startDate, endDate } = calculateDatesFromLookback('5m')
    const diffMs = endDate.getTime() - startDate.getTime()
    expect(diffMs).toBeGreaterThanOrEqual(4 * 60 * 1000)
    expect(diffMs).toBeLessThanOrEqual(6 * 60 * 1000)
  })

  it('computes 1h lookback', () => {
    const { startDate, endDate } = calculateDatesFromLookback('1h')
    const diffMs = endDate.getTime() - startDate.getTime()
    expect(diffMs).toBeGreaterThanOrEqual(59 * 60 * 1000)
    expect(diffMs).toBeLessThanOrEqual(61 * 60 * 1000)
  })

  it('computes 7d lookback', () => {
    const { startDate, endDate } = calculateDatesFromLookback('7d')
    const diffMs = endDate.getTime() - startDate.getTime()
    expect(diffMs).toBeGreaterThanOrEqual(6.9 * 24 * 60 * 60 * 1000)
    expect(diffMs).toBeLessThanOrEqual(7.1 * 24 * 60 * 60 * 1000)
  })

  it('computes 1w lookback', () => {
    const { startDate, endDate } = calculateDatesFromLookback('1w')
    const diffMs = endDate.getTime() - startDate.getTime()
    expect(diffMs).toBeGreaterThanOrEqual(6.9 * 24 * 60 * 60 * 1000)
    expect(diffMs).toBeLessThanOrEqual(7.1 * 24 * 60 * 60 * 1000)
  })

  it('computes 2w lookback', () => {
    const { startDate, endDate } = calculateDatesFromLookback('2w')
    const diffMs = endDate.getTime() - startDate.getTime()
    expect(diffMs).toBeGreaterThanOrEqual(13.9 * 24 * 60 * 60 * 1000)
    expect(diffMs).toBeLessThanOrEqual(14.1 * 24 * 60 * 60 * 1000)
  })
})

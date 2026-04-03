import {
  isNumericStatistics,
  isNominalStatistics,
  isOrdinalStatistics,
  isNumericComparison,
  isNominalComparison,
  isOrdinalComparison,
  getNumericStats,
  getNominalStats,
  getOrdinalStats,
  getComparisonNPaired,
} from '../statistics-helpers'

const baseStats = { datasetId: 'd1', scoreId: 's1' }
const baseEvalStats = { experimentId: 'e1', scoreId: 's1' }

describe('statistics-helpers', () => {
  describe('isNumericStatistics', () => {
    it('returns true when numeric is not null', () => {
      expect(isNumericStatistics({ ...baseStats, numeric: { mean: 1, variance: null, std: null }, nominal: null, ordinal: null })).toBe(true)
    })
    it('returns false when numeric is null', () => {
      expect(isNumericStatistics({ ...baseStats, numeric: null, nominal: null, ordinal: null })).toBe(false)
    })
  })

  describe('isNominalStatistics', () => {
    it('returns true when nominal is not null', () => {
      expect(isNominalStatistics({ ...baseStats, numeric: null, nominal: {} as any, ordinal: null })).toBe(true)
    })
    it('returns false when nominal is null', () => {
      expect(isNominalStatistics({ ...baseStats, numeric: null, nominal: null, ordinal: null })).toBe(false)
    })
  })

  describe('isOrdinalStatistics', () => {
    it('returns true when ordinal is not null', () => {
      expect(isOrdinalStatistics({ ...baseStats, numeric: null, nominal: null, ordinal: {} as any })).toBe(true)
    })
    it('returns false when ordinal is null', () => {
      expect(isOrdinalStatistics({ ...baseStats, numeric: null, nominal: null, ordinal: null })).toBe(false)
    })
  })

  describe('isNumericComparison', () => {
    it('returns true when numeric is not null', () => {
      expect(isNumericComparison({ numeric: { n_paired: 10 } as any, nominal: null, ordinal: null })).toBe(true)
    })
    it('returns false when numeric is null', () => {
      expect(isNumericComparison({ numeric: null, nominal: null, ordinal: null })).toBe(false)
    })
  })

  describe('isNominalComparison', () => {
    it('returns true when nominal is not null', () => {
      expect(isNominalComparison({ numeric: null, nominal: { n_paired: 5 } as any, ordinal: null })).toBe(true)
    })
  })

  describe('isOrdinalComparison', () => {
    it('returns true when ordinal is not null', () => {
      expect(isOrdinalComparison({ numeric: null, nominal: null, ordinal: { n_paired: 3 } as any })).toBe(true)
    })
  })

  describe('getNumericStats', () => {
    it('returns numeric when present', () => {
      const stats = { mean: 1, variance: null, std: null }
      expect(getNumericStats({ ...baseStats, numeric: stats, nominal: null, ordinal: null })).toEqual(stats)
    })
    it('returns null when numeric is null', () => {
      expect(getNumericStats({ ...baseStats, numeric: null, nominal: null, ordinal: null })).toBeNull()
    })
  })

  describe('getNominalStats', () => {
    it('returns nominal when present', () => {
      const stats = {}
      expect(getNominalStats({ ...baseStats, numeric: null, nominal: stats as any, ordinal: null })).toEqual(stats)
    })
  })

  describe('getOrdinalStats', () => {
    it('returns ordinal when present', () => {
      const stats = {}
      expect(getOrdinalStats({ ...baseStats, numeric: null, nominal: null, ordinal: stats as any })).toEqual(stats)
    })
  })

  describe('getComparisonNPaired', () => {
    it('returns n_paired from numeric', () => {
      expect(getComparisonNPaired({ numeric: { n_paired: 10 } as any, nominal: null, ordinal: null })).toBe(10)
    })
    it('returns n_paired from nominal', () => {
      expect(getComparisonNPaired({ numeric: null, nominal: { n_paired: 5 } as any, ordinal: null })).toBe(5)
    })
    it('returns n_paired from ordinal', () => {
      expect(getComparisonNPaired({ numeric: null, nominal: null, ordinal: { n_paired: 3 } as any })).toBe(3)
    })
    it('returns 0 when all null', () => {
      expect(getComparisonNPaired({ numeric: null, nominal: null, ordinal: null })).toBe(0)
    })
  })
})

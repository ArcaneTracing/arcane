import { updateRowValueAtColumn } from '../dataset-detail-utils'

describe('updateRowValueAtColumn', () => {
  it('returns the same row when row.id does not match rowId', () => {
    const row = { id: 'row-1', values: ['a', 'b', 'c'] }
    const result = updateRowValueAtColumn(row, 'row-2', 1, 'x')
    expect(result).toBe(row)
    expect(result.values).toEqual(['a', 'b', 'c'])
  })

  it('returns new row with value updated at columnIndex when row.id matches', () => {
    const row = { id: 'row-1', values: ['a', 'b', 'c'] }
    const result = updateRowValueAtColumn(row, 'row-1', 1, 'x')
    expect(result).not.toBe(row)
    expect(result.id).toBe('row-1')
    expect(result.values).toEqual(['a', 'x', 'c'])
  })

  it('updates first column when columnIndex is 0', () => {
    const row = { id: 'r1', values: ['first', 'second'] }
    const result = updateRowValueAtColumn(row, 'r1', 0, 'updated')
    expect(result.values).toEqual(['updated', 'second'])
  })

  it('updates last column', () => {
    const row = { id: 'r1', values: ['a', 'b', 'c'] }
    const result = updateRowValueAtColumn(row, 'r1', 2, 'z')
    expect(result.values).toEqual(['a', 'b', 'z'])
  })

  it('handles empty string value', () => {
    const row = { id: 'r1', values: ['a', 'b'] }
    const result = updateRowValueAtColumn(row, 'r1', 1, '')
    expect(result.values).toEqual(['a', ''])
  })

  it('handles single-value row', () => {
    const row = { id: 'r1', values: ['only'] }
    const result = updateRowValueAtColumn(row, 'r1', 0, 'updated')
    expect(result.values).toEqual(['updated'])
  })
})

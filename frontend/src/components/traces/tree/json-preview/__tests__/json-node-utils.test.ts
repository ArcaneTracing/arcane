import {
  getJsonDataType,
  isJsonExpandable,
  getItemCount,
  getBracketChar,
  formatItemCount,
  type JsonDataType,
} from '../json-node-utils'

describe('getJsonDataType', () => {
  it('returns "null" for null', () => {
    expect(getJsonDataType(null)).toBe('null')
  })

  it('returns "array" for arrays', () => {
    expect(getJsonDataType([])).toBe('array')
    expect(getJsonDataType([1, 2, 3])).toBe('array')
  })

  it('returns "object" for Date instances', () => {
    expect(getJsonDataType(new Date())).toBe('object')
  })

  it('returns "string" for strings', () => {
    expect(getJsonDataType('test')).toBe('string')
    expect(getJsonDataType('')).toBe('string')
  })

  it('returns "number" for numbers', () => {
    expect(getJsonDataType(42)).toBe('number')
    expect(getJsonDataType(0)).toBe('number')
    expect(getJsonDataType(-1)).toBe('number')
  })

  it('returns "boolean" for booleans', () => {
    expect(getJsonDataType(true)).toBe('boolean')
    expect(getJsonDataType(false)).toBe('boolean')
  })

  it('returns "object" for plain objects', () => {
    expect(getJsonDataType({})).toBe('object')
    expect(getJsonDataType({ key: 'value' })).toBe('object')
  })

  it('returns "undefined" for undefined', () => {
    expect(getJsonDataType(undefined)).toBe('undefined')
  })
})

describe('isJsonExpandable', () => {
  it('returns false for null', () => {
    expect(isJsonExpandable(null, 'null')).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isJsonExpandable(undefined, 'undefined')).toBe(false)
  })

  it('returns false for Date instances', () => {
    expect(isJsonExpandable(new Date(), 'object')).toBe(false)
  })

  it('returns false for non-object/array types', () => {
    expect(isJsonExpandable('string', 'string')).toBe(false)
    expect(isJsonExpandable(42, 'number')).toBe(false)
    expect(isJsonExpandable(true, 'boolean')).toBe(false)
  })

  it('returns true for arrays', () => {
    expect(isJsonExpandable([], 'array')).toBe(true)
    expect(isJsonExpandable([1, 2, 3], 'array')).toBe(true)
  })

  it('returns true for plain objects', () => {
    expect(isJsonExpandable({}, 'object')).toBe(true)
    expect(isJsonExpandable({ key: 'value' }, 'object')).toBe(true)
  })
})

describe('getItemCount', () => {
  it('returns 0 for null', () => {
    expect(getItemCount(null)).toBe(0)
  })

  it('returns 0 for undefined', () => {
    expect(getItemCount(undefined)).toBe(0)
  })

  it('returns 0 for empty arrays', () => {
    expect(getItemCount([])).toBe(0)
  })

  it('returns correct count for arrays', () => {
    expect(getItemCount([1])).toBe(1)
    expect(getItemCount([1, 2, 3])).toBe(3)
  })

  it('returns 0 for empty objects', () => {
    expect(getItemCount({})).toBe(0)
  })

  it('returns correct count for objects', () => {
    expect(getItemCount({ a: 1 })).toBe(1)
    expect(getItemCount({ a: 1, b: 2, c: 3 })).toBe(3)
  })
})

describe('getBracketChar', () => {
  it('returns "[" for array open bracket', () => {
    expect(getBracketChar('array', true)).toBe('[')
  })

  it('returns "]" for array close bracket', () => {
    expect(getBracketChar('array', false)).toBe(']')
  })

  it('returns "{" for object open bracket', () => {
    expect(getBracketChar('object', true)).toBe('{')
  })

  it('returns "}" for object close bracket', () => {
    expect(getBracketChar('object', false)).toBe('}')
  })

  it('returns "{" for other types open bracket', () => {
    expect(getBracketChar('string' as JsonDataType, true)).toBe('{')
    expect(getBracketChar('number' as JsonDataType, true)).toBe('{')
  })

  it('returns "}" for other types close bracket', () => {
    expect(getBracketChar('string' as JsonDataType, false)).toBe('}')
    expect(getBracketChar('number' as JsonDataType, false)).toBe('}')
  })
})

describe('formatItemCount', () => {
  it('formats single item for arrays', () => {
    expect(formatItemCount(1, 'array')).toBe(' 1 item ]')
  })

  it('formats multiple items for arrays', () => {
    expect(formatItemCount(3, 'array')).toBe(' 3 items ]')
  })

  it('formats single item for objects', () => {
    expect(formatItemCount(1, 'object')).toBe(' 1 item }')
  })

  it('formats multiple items for objects', () => {
    expect(formatItemCount(5, 'object')).toBe(' 5 items }')
  })

  it('formats zero items', () => {
    expect(formatItemCount(0, 'array')).toBe(' 0 items ]')
    expect(formatItemCount(0, 'object')).toBe(' 0 items }')
  })
})

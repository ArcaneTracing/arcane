import {
  SENSITIVE_PLACEHOLDER,
  isMaskedSensitiveValue,
} from '../sensitive-field-utils'

describe('isMaskedSensitiveValue', () => {
  it('returns false for empty or whitespace', () => {
    expect(isMaskedSensitiveValue('')).toBe(false)
    expect(isMaskedSensitiveValue('   ')).toBe(false)
  })

  it('returns true for common masked placeholders from API', () => {
    expect(isMaskedSensitiveValue('****')).toBe(true)
    expect(isMaskedSensitiveValue(SENSITIVE_PLACEHOLDER)).toBe(true)
    expect(isMaskedSensitiveValue('••••••••')).toBe(true)
  })

  it('returns true for masked display format (prefix...suffix)', () => {
    expect(isMaskedSensitiveValue('sk-abc...xyz1')).toBe(true)
    expect(isMaskedSensitiveValue('sk-ant...key1')).toBe(true)
  })

  it('returns false for real API keys', () => {
    expect(isMaskedSensitiveValue('sk-1234567890abcdef')).toBe(false)
    expect(isMaskedSensitiveValue('sk-ant-api03-abc123')).toBe(false)
  })
})

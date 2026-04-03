import { validateSetupForm } from '../setup-utils'

describe('validateSetupForm', () => {
  it('returns null when all valid', () => {
    expect(
      validateSetupForm('password123', 'password123', 'My Org')
    ).toBeNull()
  })

  it('returns error when passwords do not match', () => {
    expect(
      validateSetupForm('password123', 'password456', 'My Org')
    ).toBe('Passwords do not match')
  })

  it('returns error when password too short', () => {
    expect(
      validateSetupForm('short', 'short', 'My Org')
    ).toBe('Password must be at least 8 characters long')
  })

  it('returns error when organisation name is empty', () => {
    expect(
      validateSetupForm('password123', 'password123', '')
    ).toBe('Organisation name is required')
  })

  it('returns error when organisation name is only whitespace', () => {
    expect(
      validateSetupForm('password123', 'password123', '   ')
    ).toBe('Organisation name is required')
  })
})

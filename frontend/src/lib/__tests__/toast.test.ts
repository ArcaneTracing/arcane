jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}))

jest.mock('../error-handling', () => ({
  getErrorMessage: jest.fn((_e: unknown, fallback: string) => fallback),
}))

import { showErrorToast, showSuccessToast, showErrorToastFromError } from '../toast'

const toast = require('sonner').toast

describe('toast', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('showErrorToast calls toast.error with message', () => {
    showErrorToast('Error message')
    expect(toast.error).toHaveBeenCalledWith('Error message', { duration: 5000 })
  })

  it('showErrorToast uses custom duration', () => {
    showErrorToast('Error', { duration: 3000 })
    expect(toast.error).toHaveBeenCalledWith('Error', { duration: 3000 })
  })

  it('showSuccessToast calls toast.success', () => {
    showSuccessToast('Success')
    expect(toast.success).toHaveBeenCalledWith('Success', { duration: 3000 })
  })

  it('showErrorToastFromError calls toast.error with extracted message', () => {
    showErrorToastFromError(new Error('test'), 'Default')
    expect(toast.error).toHaveBeenCalledWith('Default', { duration: 5000 })
  })
})

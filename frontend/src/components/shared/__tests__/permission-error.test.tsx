import React from 'react'
import { render, screen } from '@testing-library/react'
import { PermissionError } from '../permission-error'
import { AxiosError } from 'axios'

jest.mock('@/lib/error-handling', () => ({
  isForbiddenError: jest.fn(),
  getErrorMessage: jest.fn((_err: unknown, fallback: string) => fallback),
}))

const mockIsForbiddenError = require('@/lib/error-handling').isForbiddenError

describe('PermissionError', () => {
  beforeEach(() => {
    mockIsForbiddenError.mockReturnValue(true)
  })

  it('returns null when error is not forbidden', () => {
    mockIsForbiddenError.mockReturnValue(false)
    const { container } = render(<PermissionError error={new Error('Other')} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders Access Denied when error is forbidden', () => {
    const err = new AxiosError('Forbidden')
    ;(err as any).response = { status: 403 }
    render(<PermissionError error={err} />)
    expect(screen.getByText('Access Denied')).toBeInTheDocument()
  })

  it('uses custom resourceName and action', () => {
    const err = new AxiosError('Forbidden')
    ;(err as any).response = { status: 403 }
    const { getErrorMessage } = require('@/lib/error-handling')
    getErrorMessage.mockReturnValue("You don't have permission to delete projects.")
    render(<PermissionError error={err} resourceName="projects" action="delete" />)
    expect(screen.getByText('Access Denied')).toBeInTheDocument()
  })
})

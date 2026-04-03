import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompactErrorFallback } from '@/components/CompactErrorFallback'

describe('CompactErrorFallback', () => {
  it('renders "Something went wrong here" and error message', () => {
    const reset = jest.fn()
    render(
      <CompactErrorFallback
        error={new Error('Test error')}
        resetErrorBoundary={reset}
      />
    )
    expect(screen.getByText('Something went wrong here')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('has role="alert"', () => {
    const reset = jest.fn()
    render(
      <CompactErrorFallback
        error={new Error('Test')}
        resetErrorBoundary={reset}
      />
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders a Retry button that calls resetErrorBoundary on click', async () => {
    const user = userEvent.setup()
    const reset = jest.fn()
    render(
      <CompactErrorFallback
        error={new Error('Test')}
        resetErrorBoundary={reset}
      />
    )
    const retry = screen.getByRole('button', { name: /retry/i })
    await user.click(retry)
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('does not render "Go home"', () => {
    const reset = jest.fn()
    render(
      <CompactErrorFallback
        error={new Error('Test')}
        resetErrorBoundary={reset}
      />
    )
    expect(screen.queryByRole('link', { name: /go home/i })).not.toBeInTheDocument()
  })

  it('handles non-Error values by stringifying', () => {
    const reset = jest.fn()
    render(
      <CompactErrorFallback
        error="string error"
        resetErrorBoundary={reset}
      />
    )
    expect(screen.getByText('string error')).toBeInTheDocument()
  })
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'

const Thrower = () => {
  throw new Error('Test render error')
}

describe('AppErrorBoundary', () => {
  it('renders children when they do not throw', () => {
    render(
      <AppErrorBoundary>
        <div>Content</div>
      </AppErrorBoundary>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('shows ErrorFallback when a child throws during render', () => {
    render(
      <AppErrorBoundary>
        <Thrower />
      </AppErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test render error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument()
  })

  it('calls onError when a child throws', () => {
    const onError = jest.fn()
    render(
      <AppErrorBoundary onError={onError}>
        <Thrower />
      </AppErrorBoundary>
    )
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    )
  })
})

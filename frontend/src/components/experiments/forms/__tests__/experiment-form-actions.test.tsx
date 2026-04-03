import React from 'react'
import { render, screen } from '@testing-library/react'
import { ExperimentFormActions } from '../experiment-form-actions'

describe('ExperimentFormActions', () => {
  it('renders submit button with correct label', () => {
    render(
      <ExperimentFormActions
        isLoading={false}
        isValid={true}
      />
    )

    expect(
      screen.getByRole('button', { name: /create experiment/i })
    ).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    render(
      <ExperimentFormActions
        isLoading={true}
        isValid={true}
      />
    )

    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('disables button when isLoading is true', () => {
    render(
      <ExperimentFormActions
        isLoading={true}
        isValid={true}
      />
    )

    const button = screen.getByRole('button', { name: /creating/i })
    expect(button).toBeDisabled()
  })

  it('disables button when form is invalid', () => {
    render(
      <ExperimentFormActions
        isLoading={false}
        isValid={false}
      />
    )

    const button = screen.getByRole('button', { name: /create experiment/i })
    expect(button).toBeDisabled()
  })

  it('enables button when not loading and valid', () => {
    render(
      <ExperimentFormActions
        isLoading={false}
        isValid={true}
      />
    )

    const button = screen.getByRole('button', { name: /create experiment/i })
    expect(button).not.toBeDisabled()
  })

  it('uses submit type on button', () => {
    render(
      <ExperimentFormActions
        isLoading={false}
        isValid={true}
      />
    )

    const button = screen.getByRole('button', { name: /create experiment/i })
    expect(button).toHaveAttribute('type', 'submit')
  })
})


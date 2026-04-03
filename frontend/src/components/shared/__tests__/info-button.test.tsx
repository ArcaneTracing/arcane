import React from 'react'
import { render, screen } from '@testing-library/react'
import { InfoButton } from '../info-button'

describe('InfoButton', () => {
  it('renders info icon with string content', () => {
    render(<InfoButton content="Help text" />)
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
  })

  it('renders with React node content', () => {
    render(<InfoButton content={<span data-testid="custom">Custom</span>} />)
    expect(screen.getByTestId('custom')).toBeInTheDocument()
  })

  it('renders with different icon sizes', () => {
    const { rerender } = render(<InfoButton content="x" iconSize="sm" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<InfoButton content="x" iconSize="lg" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})

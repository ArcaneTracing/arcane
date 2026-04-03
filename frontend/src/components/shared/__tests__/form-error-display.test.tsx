import React from 'react'
import { render, screen } from '@testing-library/react'
import { FormErrorDisplay } from '../form-error-display'

describe('FormErrorDisplay', () => {
  it('returns null when error is null', () => {
    const { container } = render(<FormErrorDisplay error={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders default alert when error provided', () => {
    render(<FormErrorDisplay error="Something went wrong" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders inline variant', () => {
    render(<FormErrorDisplay error="Field error" variant="inline" />)
    expect(screen.getByText('Field error')).toBeInTheDocument()
  })

  it('returns null for toast variant', () => {
    const { container } = render(<FormErrorDisplay error="Toast error" variant="toast" />)
    expect(container.firstChild).toBeNull()
  })
})

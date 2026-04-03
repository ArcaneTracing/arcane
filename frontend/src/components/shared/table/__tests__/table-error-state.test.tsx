import React from 'react'
import { render, screen } from '@testing-library/react'
import { TableErrorState } from '../table-error-state'

describe('TableErrorState', () => {
  it('should not render when error is null', () => {
    const { container } = render(<TableErrorState error={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render error message as string', () => {
    render(<TableErrorState error="Something went wrong" />)
    expect(screen.getByText(/Error: Something went wrong/i)).toBeInTheDocument()
  })

  it('should render error message from Error object', () => {
    const error = new Error('Test error message')
    render(<TableErrorState error={error} />)
    expect(screen.getByText(/Error: Test error message/i)).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <TableErrorState error="Error" className="custom-class" />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })
})


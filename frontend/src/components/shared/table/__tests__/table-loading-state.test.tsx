import React from 'react'
import { render, screen } from '@testing-library/react'
import { TableLoadingState } from '../table-loading-state'

describe('TableLoadingState', () => {
  it('should render loading spinner', () => {
    render(<TableLoadingState />)
    const loader = screen.getByTestId('icon-loader2')
    expect(loader).toBeInTheDocument()
  })

  it('should use default height', () => {
    const { container } = render(<TableLoadingState />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('h-64')
  })

  it('should use custom height when provided', () => {
    const { container } = render(<TableLoadingState height="h-96" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('h-96')
  })

  it('should apply custom className', () => {
    const { container } = render(<TableLoadingState className="custom-class" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
  })
})


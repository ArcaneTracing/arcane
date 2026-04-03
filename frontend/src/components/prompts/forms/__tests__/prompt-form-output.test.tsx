import React from 'react'
import { render, screen } from '@testing-library/react'
import { PromptFormOutput } from '../prompt-form-output'

describe('PromptFormOutput', () => {
  it('renders Output section', () => {
    render(<PromptFormOutput output="" />)
    expect(screen.getByText('Output')).toBeInTheDocument()
  })

  it('shows placeholder when output is empty', () => {
    render(<PromptFormOutput output="" />)
    expect(screen.getByText('click run to see output')).toBeInTheDocument()
  })

  it('shows output content when provided', () => {
    render(<PromptFormOutput output="Hello, world!" />)
    expect(screen.getByText('Hello, world!')).toBeInTheDocument()
  })
})

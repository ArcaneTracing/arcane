import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryInput } from '../query-input'

describe('QueryInput', () => {
  const onChange = jest.fn()
  const onKeyDown = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders input with placeholder', () => {
    render(
      <QueryInput value="" onChange={onChange} onKeyDown={onKeyDown} />
    )
    expect(screen.getByPlaceholderText('e.g. { name="project_span" }')).toBeInTheDocument()
  })

  it('displays value', () => {
    render(
      <QueryInput value="span.name=test" onChange={onChange} onKeyDown={onKeyDown} />
    )
    expect(screen.getByDisplayValue('span.name=test')).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    render(
      <QueryInput value="" onChange={onChange} onKeyDown={onKeyDown} />
    )
    await user.type(screen.getByPlaceholderText('e.g. { name="project_span" }'), 'x')
    expect(onChange).toHaveBeenCalledWith('x')
  })

  it('renders InfoButton when tooltipContent provided', () => {
    render(
      <QueryInput
        value=""
        onChange={onChange}
        onKeyDown={onKeyDown}
        tooltipContent="Query syntax help"
      />
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does not render InfoButton when tooltipContent omitted', () => {
    render(
      <QueryInput value="" onChange={onChange} onKeyDown={onKeyDown} />
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

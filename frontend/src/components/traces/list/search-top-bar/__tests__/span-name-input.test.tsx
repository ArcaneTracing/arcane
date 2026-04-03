import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpanNameInput } from '../span-name-input'

describe('SpanNameInput', () => {
  const onChange = jest.fn()
  const onKeyDown = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders input with placeholder', () => {
    render(
      <SpanNameInput value="" onChange={onChange} onKeyDown={onKeyDown} />
    )
    expect(screen.getByPlaceholderText('Filter by span name')).toBeInTheDocument()
  })

  it('shows value when provided', () => {
    render(
      <SpanNameInput value="project_span" onChange={onChange} onKeyDown={onKeyDown} />
    )
    expect(screen.getByDisplayValue('project_span')).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    render(
      <SpanNameInput value="" onChange={onChange} onKeyDown={onKeyDown} />
    )
    await user.type(screen.getByPlaceholderText('Filter by span name'), 'test')
    expect(onChange).toHaveBeenCalledTimes(4)
  })

  it('calls onKeyDown when key pressed', () => {
    render(
      <SpanNameInput value="" onChange={onChange} onKeyDown={onKeyDown} />
    )
    const input = screen.getByPlaceholderText('Filter by span name')
    input.focus()
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    input.dispatchEvent(event)
    expect(onKeyDown).toHaveBeenCalled()
  })
})

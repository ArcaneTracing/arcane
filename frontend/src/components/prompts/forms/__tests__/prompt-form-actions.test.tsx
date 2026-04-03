import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptFormActions } from '../prompt-form-actions'

describe('PromptFormActions', () => {
  it('renders + Response Format when responseFormatOpen is false', () => {
    render(
      <PromptFormActions
        responseFormatOpen={false}
        onToggleResponseFormat={jest.fn()}
        onAddTool={jest.fn()}
        onAddMessage={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: '+ Response Format' })).toBeInTheDocument()
  })

  it('renders − Response Format when responseFormatOpen is true', () => {
    render(
      <PromptFormActions
        responseFormatOpen={true}
        onToggleResponseFormat={jest.fn()}
        onAddTool={jest.fn()}
        onAddMessage={jest.fn()}
      />
    )

    expect(screen.getByRole('button', { name: '− Response Format' })).toBeInTheDocument()
  })

  it('calls onToggleResponseFormat when Response Format button clicked', () => {
    const onToggleResponseFormat = jest.fn()
    render(
      <PromptFormActions
        responseFormatOpen={false}
        onToggleResponseFormat={onToggleResponseFormat}
        onAddTool={jest.fn()}
        onAddMessage={jest.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '+ Response Format' }))
    expect(onToggleResponseFormat).toHaveBeenCalled()
  })

  it('calls onAddTool when + Tool clicked', () => {
    const onAddTool = jest.fn()
    render(
      <PromptFormActions
        responseFormatOpen={false}
        onToggleResponseFormat={jest.fn()}
        onAddTool={onAddTool}
        onAddMessage={jest.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '+ Tool' }))
    expect(onAddTool).toHaveBeenCalled()
  })

  it('calls onAddMessage when + Message clicked', () => {
    const onAddMessage = jest.fn()
    render(
      <PromptFormActions
        responseFormatOpen={false}
        onToggleResponseFormat={jest.fn()}
        onAddTool={jest.fn()}
        onAddMessage={onAddMessage}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '+ Message' }))
    expect(onAddMessage).toHaveBeenCalled()
  })
})

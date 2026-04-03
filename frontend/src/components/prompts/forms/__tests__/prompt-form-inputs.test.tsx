import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptFormInputs } from '../prompt-form-inputs'
import { TemplateFormat } from '@/types/enums'
import type { MessageBox } from '@/hooks/prompts/use-prompt-form'

jest.mock('@/lib/prompt-utils', () => ({
  extractVariablesFromMessages: jest.fn(),
}))

const { extractVariablesFromMessages } = jest.requireMock('@/lib/prompt-utils') as {
  extractVariablesFromMessages: jest.Mock
}

describe('PromptFormInputs', () => {
  const onInputChange = jest.fn()

  const baseMessages: MessageBox[] = [
    { id: '1', role: 'user', content: 'Hello {{name}}' } as MessageBox,
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows message when template format is NONE', () => {
    ;(extractVariablesFromMessages as jest.Mock).mockReturnValue([])

    render(
      <PromptFormInputs
        templateFormat={TemplateFormat.NONE}
        messages={baseMessages}
        inputValues={{}}
        onInputChange={onInputChange}
      />
    )

    expect(
      screen.getByText(/No template format selected/i)
    ).toBeInTheDocument()
  })

  it('shows guidance text for MUSTACHE format when no variables detected', () => {
    ;(extractVariablesFromMessages as jest.Mock).mockReturnValue([])

    render(
      <PromptFormInputs
        templateFormat={TemplateFormat.MUSTACHE}
        messages={baseMessages}
        inputValues={{}}
        onInputChange={onInputChange}
      />
    )

    expect(
      screen.getByText(/using \{\{input name\}\} within your prompt template/i)
    ).toBeInTheDocument()
  })

  it('shows guidance text for F_STRING format when no variables detected', () => {
    ;(extractVariablesFromMessages as jest.Mock).mockReturnValue([])

    render(
      <PromptFormInputs
        templateFormat={TemplateFormat.F_STRING}
        messages={baseMessages}
        inputValues={{}}
        onInputChange={onInputChange}
      />
    )

    expect(
      screen.getByText(/using \{input name\} within your prompt template/i)
    ).toBeInTheDocument()
  })

  it('renders detected variables and calls onInputChange on edit', () => {
    ;(extractVariablesFromMessages as jest.Mock).mockReturnValue(['name'])

    render(
      <PromptFormInputs
        templateFormat={TemplateFormat.MUSTACHE}
        messages={baseMessages}
        inputValues={{ name: '' }}
        onInputChange={onInputChange}
      />
    )

    expect(
      screen.getByText(/Detected Variables \(1\)/i)
    ).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText('Enter value for name...')
    fireEvent.change(textarea, { target: { value: 'Alice' } })

    expect(onInputChange).toHaveBeenCalledWith('name', 'Alice')
  })
})


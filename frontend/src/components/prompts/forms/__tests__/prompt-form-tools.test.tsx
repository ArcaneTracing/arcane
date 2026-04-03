import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptFormTools } from '../prompt-form-tools'

describe('PromptFormTools', () => {
  const onAddTool = jest.fn()
  const onRemoveTool = jest.fn()
  const onUpdateTool = jest.fn()
  const onCopyTool = jest.fn()
  const onToggleToolOpen = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when tools is empty', () => {
    const { container } = render(
      <PromptFormTools
        tools={[]}
        toolOpenStates={{}}
        onAddTool={onAddTool}
        onRemoveTool={onRemoveTool}
        onUpdateTool={onUpdateTool}
        onCopyTool={onCopyTool}
        onToggleToolOpen={onToggleToolOpen}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders tool with default name when content is not valid JSON', () => {
    render(
      <PromptFormTools
        tools={[{ id: 't1', content: 'invalid json' }]}
        toolOpenStates={{}}
        onAddTool={onAddTool}
        onRemoveTool={onRemoveTool}
        onUpdateTool={onUpdateTool}
        onCopyTool={onCopyTool}
        onToggleToolOpen={onToggleToolOpen}
      />
    )
    expect(screen.getByText('Tool 1')).toBeInTheDocument()
  })

  it('renders tool with parsed function name when content is valid JSON', () => {
    const toolContent = JSON.stringify({
      function: { name: 'my_custom_function' },
    })
    render(
      <PromptFormTools
        tools={[{ id: 't1', content: toolContent }]}
        toolOpenStates={{}}
        onAddTool={onAddTool}
        onRemoveTool={onRemoveTool}
        onUpdateTool={onUpdateTool}
        onCopyTool={onCopyTool}
        onToggleToolOpen={onToggleToolOpen}
      />
    )
    expect(screen.getByText('my_custom_function')).toBeInTheDocument()
  })

  it('calls onUpdateTool when tool content changes', () => {
    render(
      <PromptFormTools
        tools={[{ id: 't1', content: '{}' }]}
        toolOpenStates={{ t1: true }}
        onAddTool={onAddTool}
        onRemoveTool={onRemoveTool}
        onUpdateTool={onUpdateTool}
        onCopyTool={onCopyTool}
        onToggleToolOpen={onToggleToolOpen}
      />
    )
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: '{"new": "content"}' } })
    expect(onUpdateTool).toHaveBeenCalledWith('t1', '{"new": "content"}')
  })

  it('calls onCopyTool when copy button clicked', () => {
    render(
      <PromptFormTools
        tools={[{ id: 't1', content: '{}' }]}
        toolOpenStates={{ t1: true }}
        onAddTool={onAddTool}
        onRemoveTool={onRemoveTool}
        onUpdateTool={onUpdateTool}
        onCopyTool={onCopyTool}
        onToggleToolOpen={onToggleToolOpen}
      />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1])
    expect(onCopyTool).toHaveBeenCalledWith('t1')
  })

  it('calls onRemoveTool when remove button clicked', () => {
    render(
      <PromptFormTools
        tools={[{ id: 't1', content: '{}' }]}
        toolOpenStates={{ t1: true }}
        onAddTool={onAddTool}
        onRemoveTool={onRemoveTool}
        onUpdateTool={onUpdateTool}
        onCopyTool={onCopyTool}
        onToggleToolOpen={onToggleToolOpen}
      />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[2])
    expect(onRemoveTool).toHaveBeenCalledWith('t1')
  })

  it('calls onToggleToolOpen when collapsible trigger clicked', () => {
    render(
      <PromptFormTools
        tools={[{ id: 't1', content: '{}' }]}
        toolOpenStates={{ t1: true }}
        onAddTool={onAddTool}
        onRemoveTool={onRemoveTool}
        onUpdateTool={onUpdateTool}
        onCopyTool={onCopyTool}
        onToggleToolOpen={onToggleToolOpen}
      />
    )
    fireEvent.click(screen.getByText('Tool 1'))
    expect(onToggleToolOpen).toHaveBeenCalledWith('t1')
  })
})

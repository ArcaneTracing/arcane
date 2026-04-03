import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptCard } from '../prompt-card'
import { PromptResponse } from '@/types/prompts'

describe('PromptCard', () => {
  const mockPrompt: PromptResponse = {
    id: '1',
    name: 'Test Prompt',
    description: 'Test Description',
  }

  const mockOnView = jest.fn()
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render prompt information', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Test Prompt')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should call onView when details button is clicked', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    const detailsButton = screen.getByText('Details')
    fireEvent.click(detailsButton)
    expect(mockOnView).toHaveBeenCalledWith('1')
  })

  it('should call onEdit when edit button is clicked', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)
    expect(mockOnEdit).toHaveBeenCalledWith(mockPrompt)
  })

  it('should call onDelete when delete button is clicked', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('should display default description when none provided', () => {
    const promptWithoutDescription = {
      ...mockPrompt,
      description: undefined,
    }
    render(
      <PromptCard
        prompt={promptWithoutDescription}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('No description provided')).toBeInTheDocument()
  })
})


import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EvaluationDeleteDialog } from '../evaluation-delete-dialog'

const mockOnOpenChange = jest.fn()
const mockOnConfirm = jest.fn()

const mockMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
}

describe('EvaluationDeleteDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render when open', () => {
    render(
      <EvaluationDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        evaluationName="Test Evaluation"
        mutation={mockMutation as any}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText(/permanently delete the evaluation "Test Evaluation"/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
  })

  it('should call onConfirm when Delete is clicked', () => {
    render(
      <EvaluationDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        evaluationName="Test Evaluation"
        mutation={mockMutation as any}
        onConfirm={mockOnConfirm}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(mockOnConfirm).toHaveBeenCalled()
  })

  it('should show Deleting... when mutation is pending', () => {
    render(
      <EvaluationDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        evaluationName="Test Evaluation"
        mutation={{ ...mockMutation, isPending: true } as any}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText('Deleting...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('should handle undefined evaluation name', () => {
    render(
      <EvaluationDeleteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        mutation={mockMutation as any}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText(/permanently delete the evaluation/i)).toBeInTheDocument()
  })
})

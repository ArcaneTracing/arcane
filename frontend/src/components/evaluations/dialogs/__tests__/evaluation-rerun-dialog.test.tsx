import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EvaluationRerunDialog } from '../evaluation-rerun-dialog'

const mockOnOpenChange = jest.fn()
const mockOnConfirm = jest.fn()

const mockMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
}

describe('EvaluationRerunDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render when open', () => {
    render(
      <EvaluationRerunDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        evaluationName="Test Evaluation"
        mutation={mockMutation as any}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText('Re-run Evaluation?')).toBeInTheDocument()
    expect(screen.getByText(/create a new evaluation with the same configuration as "Test Evaluation"/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /re-run/i })).toBeInTheDocument()
  })

  it('should call onConfirm when Re-run is clicked', () => {
    render(
      <EvaluationRerunDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        evaluationName="Test Evaluation"
        mutation={mockMutation as any}
        onConfirm={mockOnConfirm}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /re-run/i }))

    expect(mockOnConfirm).toHaveBeenCalled()
  })

  it('should show Re-running... when mutation is pending', () => {
    render(
      <EvaluationRerunDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        evaluationName="Test Evaluation"
        mutation={{ ...mockMutation, isPending: true } as any}
        onConfirm={mockOnConfirm}
      />
    )

    expect(screen.getByText('Re-running...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /re-run/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })
})

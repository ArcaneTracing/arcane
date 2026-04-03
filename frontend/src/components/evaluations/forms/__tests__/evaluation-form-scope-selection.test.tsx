import React from 'react'
import { render, screen } from '@testing-library/react'
import { EvaluationFormScopeSelection } from '../evaluation-form-scope-selection'
import { EvaluationScope } from '@/types/enums'

describe('EvaluationFormScopeSelection', () => {
  const mockOnScopeChange = jest.fn()
  const mockOnScopeReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render evaluation scope label', () => {
    render(
      <EvaluationFormScopeSelection
        evaluationScope={EvaluationScope.DATASET}
        onScopeChange={mockOnScopeChange}
      />
    )

    expect(screen.getByText('Evaluation Scope')).toBeInTheDocument()
  })

  it('should display Dataset and Experiment options when scope is DATASET', () => {
    render(
      <EvaluationFormScopeSelection
        evaluationScope={EvaluationScope.DATASET}
        onScopeChange={mockOnScopeChange}
      />
    )

    expect(screen.getByText('Dataset')).toBeInTheDocument()
    expect(screen.getByText('Experiment')).toBeInTheDocument()
  })

  it('should render with onScopeReset provided', () => {
    render(
      <EvaluationFormScopeSelection
        evaluationScope={EvaluationScope.DATASET}
        onScopeChange={mockOnScopeChange}
        onScopeReset={mockOnScopeReset}
      />
    )

    expect(screen.getByText('Evaluation Scope')).toBeInTheDocument()
    expect(screen.getByText('Dataset')).toBeInTheDocument()
    expect(screen.getByText('Experiment')).toBeInTheDocument()
  })

  it('should display scope when EXPERIMENT', () => {
    render(
      <EvaluationFormScopeSelection
        evaluationScope={EvaluationScope.EXPERIMENT}
        onScopeChange={mockOnScopeChange}
      />
    )

    expect(screen.getByText('Evaluation Scope')).toBeInTheDocument()
    expect(screen.getByText('Experiment')).toBeInTheDocument()
  })

  it('should disable select when isLoading', () => {
    render(
      <EvaluationFormScopeSelection
        evaluationScope={EvaluationScope.DATASET}
        onScopeChange={mockOnScopeChange}
        isLoading={true}
      />
    )

    const trigger = screen.getByLabelText(/evaluation scope/i)
    expect(trigger).toBeDisabled()
  })

  it('should disable select when isEditMode', () => {
    render(
      <EvaluationFormScopeSelection
        evaluationScope={EvaluationScope.DATASET}
        onScopeChange={mockOnScopeChange}
        isEditMode={true}
      />
    )

    const trigger = screen.getByLabelText(/evaluation scope/i)
    expect(trigger).toBeDisabled()
  })
})

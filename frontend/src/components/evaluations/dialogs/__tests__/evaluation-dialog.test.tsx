import React from 'react'
import { render, screen } from '@testing-library/react'
import { EvaluationDialog } from '../evaluation-dialog'
import { EvaluationResponse } from '@/types/evaluations'
import { render as customRender } from '@/__tests__/test-utils'

jest.mock('../../forms/evaluation-form', () => ({
  EvaluationForm: ({ evaluation, projectId, onSuccess }: any) => (
    <div data-testid="evaluation-form">
      <div>Project ID: {projectId}</div>
      {evaluation && <div>Evaluation ID: {evaluation.id}</div>}
      <button onClick={onSuccess}>Submit</button>
    </div>
  ),
}))

describe('EvaluationDialog', () => {
  const mockOnOpenChange = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render dialog when open', () => {
    customRender(
      <EvaluationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1"
      />
    )

    expect(screen.getByText('Create New Evaluation')).toBeInTheDocument()
    expect(screen.getByTestId('evaluation-form')).toBeInTheDocument()
  })

  it('should display edit title when evaluation provided', () => {
    const evaluation: EvaluationResponse = {
      id: 'eval-1',
      name: 'Test Evaluation',
      description: 'Desc',
      evaluationType: 'AUTOMATIC',
      evaluationScope: 'DATASET',
      projectId: 'project-1',
      datasetId: 'dataset-1',
      experiments: [],
      scores: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    customRender(
      <EvaluationDialog
        evaluation={evaluation}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1"
      />
    )

    expect(screen.getByText('Edit Evaluation')).toBeInTheDocument()
    expect(screen.getByText('Evaluation ID: eval-1')).toBeInTheDocument()
  })

  it('should display create mode description', () => {
    customRender(
      <EvaluationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1"
      />
    )

    expect(screen.getByText(/Create a new evaluation to assess datasets or experiments using scores/i)).toBeInTheDocument()
  })

  it('should display edit mode description when evaluation provided', () => {
    const evaluation: EvaluationResponse = {
      id: 'eval-1',
      name: 'Test',
      description: '',
      evaluationType: 'AUTOMATIC',
      evaluationScope: 'DATASET',
      projectId: 'project-1',
      datasetId: 'dataset-1',
      experiments: [],
      scores: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    customRender(
      <EvaluationDialog
        evaluation={evaluation}
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1"
      />
    )

    expect(screen.getByText('Update the evaluation configuration.')).toBeInTheDocument()
  })

  it('should pass projectId to form', () => {
    customRender(
      <EvaluationDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-123"
      />
    )

    expect(screen.getByText('Project ID: project-123')).toBeInTheDocument()
  })
})

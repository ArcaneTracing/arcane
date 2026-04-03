import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { EvaluationsTable } from '../evaluations-table'
import { EvaluationResponse } from '@/types/evaluations'
import { render as customRender } from '@/__tests__/test-utils'
import { useNavigate, useParams } from '@tanstack/react-router'

jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(() => jest.fn()),
  useParams: jest.fn(),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>,
}))

const mockDeleteEvaluation = jest.fn().mockResolvedValue(undefined)
const mockRerunEvaluation = jest.fn().mockResolvedValue(undefined)

jest.mock('@/hooks/evaluations/use-evaluations-query', () => ({
  useEvaluationsQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useDeleteEvaluation: jest.fn(() => ({
    mutateAsync: mockDeleteEvaluation,
    isPending: false,
  })),
  useRerunEvaluation: jest.fn(() => ({
    mutateAsync: mockRerunEvaluation,
    isPending: false,
  })),
}))

jest.mock('../../cards/evaluation-card', () => ({
  EvaluationCard: ({ evaluation, onView, onRerun, onDelete }: any) => (
    <div data-testid={`evaluation-card-${evaluation.id}`}>
      <div>{evaluation.name}</div>
      <button onClick={() => onView(evaluation.id)}>Details</button>
      <button onClick={() => onRerun(evaluation)}>Re-run</button>
      <button onClick={() => onDelete(evaluation)}>Delete</button>
    </div>
  ),
}))

jest.mock('@/components/shared/table', () => ({
  TableContainer: ({ children, isLoading, error, isEmpty, emptyMessage }: any) => {
    if (isLoading) return <div data-testid="loading">Loading...</div>
    if (error) return <div data-testid="error">Error: {String(error)}</div>
    if (isEmpty) return <div data-testid="empty">{emptyMessage}</div>
    return <div>{children}</div>
  },
  TablePagination: ({ meta, onPageChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(meta.page + 1)}>Next</button>
      <button onClick={() => onPageChange(meta.page - 1)}>Previous</button>
    </div>
  ),
}))

const mockUseEvaluationsQuery = require('@/hooks/evaluations/use-evaluations-query').useEvaluationsQuery
const mockUseDeleteEvaluation = require('@/hooks/evaluations/use-evaluations-query').useDeleteEvaluation
const mockUseRerunEvaluation = require('@/hooks/evaluations/use-evaluations-query').useRerunEvaluation
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>

describe('EvaluationsTable', () => {
  const mockNavigate = jest.fn()

  const mockEvaluations: EvaluationResponse[] = [
    {
      id: 'eval-1',
      name: 'Evaluation 1',
      description: 'Description 1',
      evaluationType: 'AUTOMATIC',
      evaluationScope: 'DATASET',
      projectId: 'project-1',
      datasetId: 'dataset-1',
      experiments: [],
      scores: [{ id: 'score-1' } as any],
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date('2024-01-01').toISOString(),
    },
    {
      id: 'eval-2',
      name: 'Evaluation 2',
      description: 'Description 2',
      evaluationType: 'AUTOMATIC',
      evaluationScope: 'EXPERIMENT',
      projectId: 'project-1',
      experiments: [{ id: 'exp-1' } as any],
      scores: [],
      createdAt: new Date('2024-01-02').toISOString(),
      updatedAt: new Date('2024-01-02').toISOString(),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNavigate.mockReturnValue(mockNavigate)
    mockUseParams.mockReturnValue({ organisationId: 'org-1', projectId: 'project-1' } as any)
    mockUseEvaluationsQuery.mockReturnValue({
      data: mockEvaluations,
      isLoading: false,
      error: null,
    })
    mockUseDeleteEvaluation.mockReturnValue({
      mutateAsync: mockDeleteEvaluation,
      isPending: false,
    })
    mockUseRerunEvaluation.mockReturnValue({
      mutateAsync: mockRerunEvaluation,
      isPending: false,
    })
  })

  it('should render evaluations', () => {
    customRender(<EvaluationsTable searchQuery="" />)

    expect(screen.getByText('Evaluation 1')).toBeInTheDocument()
    expect(screen.getByText('Evaluation 2')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    mockUseEvaluationsQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    })

    customRender(<EvaluationsTable searchQuery="" />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('should display error state', () => {
    mockUseEvaluationsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to fetch'),
    })

    customRender(<EvaluationsTable searchQuery="" />)

    expect(screen.getByText(/Error:/i)).toBeInTheDocument()
  })

  it('should display empty state', () => {
    mockUseEvaluationsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    customRender(<EvaluationsTable searchQuery="" />)

    expect(screen.getByText('No evaluations found')).toBeInTheDocument()
  })

  it('should filter evaluations by search query', () => {
    customRender(<EvaluationsTable searchQuery="Evaluation 1" />)

    expect(screen.getByText('Evaluation 1')).toBeInTheDocument()
    expect(screen.queryByText('Evaluation 2')).not.toBeInTheDocument()
  })

  it('should filter evaluations by description', () => {
    customRender(<EvaluationsTable searchQuery="Description 2" />)

    expect(screen.getByText('Evaluation 2')).toBeInTheDocument()
    expect(screen.queryByText('Evaluation 1')).not.toBeInTheDocument()
  })

  it('should call navigate when Details button is clicked', () => {
    customRender(<EvaluationsTable searchQuery="" />)

    const detailsButtons = screen.getAllByText('Details')
    fireEvent.click(detailsButtons[0])

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organisations/$organisationId/projects/$projectId/evaluations/$evaluationId',
      params: { organisationId: 'org-1', projectId: 'project-1', evaluationId: 'eval-2' },
    })
  })

  it('should open delete dialog when Delete button is clicked', async () => {
    customRender(<EvaluationsTable searchQuery="" />)

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument()
    })
  })

  it('should call deleteEvaluation when delete is confirmed', async () => {
    customRender(<EvaluationsTable searchQuery="" />)

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument()
    })

    const alertDialog = screen.getByTestId('alert-dialog')
    const confirmButton = within(alertDialog).getByRole('button', { name: /^delete$/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteEvaluation).toHaveBeenCalledWith('eval-2')
    }, { timeout: 2000 })
  })

  it('should open rerun dialog when Re-run button is clicked', async () => {
    customRender(<EvaluationsTable searchQuery="" />)

    const rerunButtons = screen.getAllByText('Re-run')
    fireEvent.click(rerunButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Re-run Evaluation/i)).toBeInTheDocument()
    })
  })

  it('should call rerunEvaluation when rerun is confirmed', async () => {
    customRender(<EvaluationsTable searchQuery="" />)

    const rerunButtons = screen.getAllByText('Re-run')
    fireEvent.click(rerunButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/Re-run Evaluation/i)).toBeInTheDocument()
    })

    const alertDialog = screen.getByTestId('alert-dialog')
    const confirmButton = within(alertDialog).getByRole('button', { name: /re-run/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockRerunEvaluation).toHaveBeenCalledWith('eval-2')
    }, { timeout: 2000 })
  })

  it('should display pagination', () => {
    customRender(<EvaluationsTable searchQuery="" />)

    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('should not navigate when organisationId is missing', () => {
    mockUseParams.mockReturnValue({ projectId: 'project-1' } as any)

    customRender(<EvaluationsTable searchQuery="" />)

    const detailsButtons = screen.getAllByText('Details')
    fireEvent.click(detailsButtons[0])

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

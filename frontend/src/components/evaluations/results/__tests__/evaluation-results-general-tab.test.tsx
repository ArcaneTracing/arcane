import React from 'react'
import { render, screen } from '@/__tests__/test-utils'
import { EvaluationResultsGeneralTab } from '../evaluation-results-general-tab'
import type { EvaluationResponse } from '@/types/evaluations'
import { EvaluationScope } from '@/types/enums'

jest.mock('@/hooks/evaluations/use-evaluations-query', () => ({
  useEvaluationStatisticsQuery: () => ({ data: [], isLoading: false, error: null }),
  useDatasetStatisticsQuery: () => ({ data: [], isLoading: false, error: null }),
}))

jest.mock('@/hooks/datasets/use-datasets-query', () => ({
  useDatasetQuery: () => ({ data: null, isLoading: false }),
}))

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return {
    ...actual,
    useQueries: () => [
      { data: null, isLoading: false },
      { data: null, isLoading: false },
    ],
  }
})

const baseEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'DATASET',
  evaluationScope: EvaluationScope.DATASET,
  name: 'Test Eval',
  datasetId: 'ds-1',
  scores: [{ id: 'score-1', description: 'Accuracy', scoringType: 'NUMERIC', name: 'Accuracy' }] as unknown as EvaluationResponse['scores'],
  experiments: [],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
}

describe('EvaluationResultsGeneralTab', () => {
  it('renders Evaluation Details card with evaluation type and scope', () => {
    render(
      <EvaluationResultsGeneralTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={baseEvaluation}
      />
    )
    expect(screen.getByText('Evaluation Details')).toBeInTheDocument()
    expect(screen.getAllByText('DATASET').length).toBeGreaterThan(0)
  })

  it('renders Statistics card', () => {
    render(
      <EvaluationResultsGeneralTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={baseEvaluation}
      />
    )
    expect(screen.getByText('Statistics')).toBeInTheDocument()
    expect(screen.getByText('Statistical analysis of score results')).toBeInTheDocument()
  })

  it('shows "No statistics available yet" when no statistics', () => {
    render(
      <EvaluationResultsGeneralTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={baseEvaluation}
      />
    )
    expect(screen.getByText('No statistics available yet')).toBeInTheDocument()
  })

  it('renders Scores section with score refs when scores not loaded', () => {
    render(
      <EvaluationResultsGeneralTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={baseEvaluation}
      />
    )
    expect(screen.getByText('Scores')).toBeInTheDocument()
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
  })
})

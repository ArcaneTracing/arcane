import React from 'react'
import { render, screen } from '@/__tests__/test-utils'
import { EvaluationResultsComparisonTab } from '../evaluation-results-comparison-tab'
import type { EvaluationResponse } from '@/types/evaluations'
import { EvaluationScope } from '@/types/enums'

jest.mock('@/hooks/evaluations/use-evaluations-query', () => ({
  useExperimentComparisonQuery: () => ({ data: null, isLoading: false, error: null }),
  useEvaluationStatisticsQuery: () => ({ data: [] }),
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

const datasetEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'DATASET',
  evaluationScope: EvaluationScope.DATASET,
  name: 'Test Eval',
  datasetId: 'ds-1',
  scores: [],
  experiments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const experimentEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'AB',
  evaluationScope: EvaluationScope.EXPERIMENT,
  name: 'Test Eval',
  scores: [{ id: 'score-1', description: 'Accuracy', scoringType: 'NUMERIC' }],
  experiments: [{ id: 'exp-1', promptVersionId: 'pv-1', datasetId: 'ds-1' }],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('EvaluationResultsComparisonTab', () => {
  it('shows message when evaluation has no experiments', () => {
    render(
      <EvaluationResultsComparisonTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={datasetEvaluation}
      />
    )
    expect(
      screen.getByText(/This evaluation does not include experiments/)
    ).toBeInTheDocument()
  })

  it('renders Experiment Comparison card with selectors when evaluation has experiments', () => {
    render(
      <EvaluationResultsComparisonTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={experimentEvaluation}
      />
    )
    expect(screen.getByText('Experiment Comparison')).toBeInTheDocument()
    expect(screen.getByText('Experiment A')).toBeInTheDocument()
    expect(screen.getByText('Experiment B')).toBeInTheDocument()
    expect(screen.getByText('Score')).toBeInTheDocument()
  })

  it('shows "Please select two different experiments" when nothing selected', () => {
    render(
      <EvaluationResultsComparisonTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={experimentEvaluation}
      />
    )
    expect(
      screen.getByText(/Please select two different experiments and a score to compare/)
    ).toBeInTheDocument()
  })
})

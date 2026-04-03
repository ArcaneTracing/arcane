import React from 'react'
import { render, screen } from '@testing-library/react'
import { EvaluationDetailExperiments } from '../evaluation-detail-experiments'
import type { EvaluationResponse } from '@/types/evaluations'
import type { ExperimentResponse } from '@/types/experiments'
import { EvaluationScope } from '@/types/enums'

const baseEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'EXPERIMENT' as const,
  evaluationScope: EvaluationScope.EXPERIMENT,
  name: 'Test Eval',
  scores: [],
  experiments: [{ id: 'exp-1', promptVersionId: 'pv-1', datasetId: 'ds-1' }],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('EvaluationDetailExperiments', () => {
  it('returns null when evaluation scope is not EXPERIMENT', () => {
    const evaluation = { ...baseEvaluation, evaluationScope: EvaluationScope.DATASET, experiments: [] }
    const { container } = render(
      <EvaluationDetailExperiments
        evaluation={evaluation}
        experiments={[]}
        projectId="proj-1"
        loadingRelated={false}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when experiments array is empty', () => {
    const evaluation = { ...baseEvaluation, experiments: [] }
    const { container } = render(
      <EvaluationDetailExperiments
        evaluation={evaluation}
        experiments={[]}
        projectId="proj-1"
        loadingRelated={false}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows loading state', () => {
    render(
      <EvaluationDetailExperiments
        evaluation={baseEvaluation}
        experiments={[]}
        projectId="proj-1"
        loadingRelated={true}
      />
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders experiment links when experiments are loaded', () => {
    const experiments: ExperimentResponse[] = [
      {
        id: 'exp-1',
        name: 'Experiment A',
        description: 'First experiment',
        promptVersionId: 'pv-1',
        datasetId: 'ds-1',
        projectId: 'proj-1',
        promptInputMappings: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    render(
      <EvaluationDetailExperiments
        evaluation={baseEvaluation}
        experiments={experiments}
        projectId="proj-1"
        loadingRelated={false}
      />
    )
    expect(screen.getByText('Experiment A')).toBeInTheDocument()
    expect(screen.getByText('First experiment')).toBeInTheDocument()
  })

  it('renders evaluation experiment refs when experiments not loaded', () => {
    render(
      <EvaluationDetailExperiments
        evaluation={baseEvaluation}
        experiments={[]}
        projectId="proj-1"
        loadingRelated={false}
      />
    )
    expect(screen.getByText(/Experiment ID: exp-1/)).toBeInTheDocument()
    expect(screen.getByText(/Prompt Version: pv-1/)).toBeInTheDocument()
  })
})

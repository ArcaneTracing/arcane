import React from 'react'
import { render, screen } from '@testing-library/react'
import { EvaluationDetailDataset } from '../evaluation-detail-dataset'
import type { EvaluationResponse } from '@/types/evaluations'
import type { DatasetListItemResponse } from '@/types/datasets'
import { EvaluationScope } from '@/types/enums'

const baseEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'DATASET' as const,
  evaluationScope: EvaluationScope.DATASET,
  name: 'Test Eval',
  datasetId: 'ds-1',
  scores: [],
  experiments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('EvaluationDetailDataset', () => {
  it('returns null when evaluation scope is not DATASET', () => {
    const evaluation = { ...baseEvaluation, evaluationScope: EvaluationScope.EXPERIMENT, datasetId: null }
    const { container } = render(
      <EvaluationDetailDataset
        evaluation={evaluation}
        dataset={null}
        projectId="proj-1"
        loadingRelated={false}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when datasetId is missing', () => {
    const evaluation = { ...baseEvaluation, datasetId: null }
    const { container } = render(
      <EvaluationDetailDataset
        evaluation={evaluation}
        dataset={null}
        projectId="proj-1"
        loadingRelated={false}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows loading state', () => {
    render(
      <EvaluationDetailDataset
        evaluation={baseEvaluation}
        dataset={null}
        projectId="proj-1"
        loadingRelated={true}
      />
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders dataset link when dataset is provided', () => {
    const dataset: DatasetListItemResponse = {
      id: 'ds-1',
      name: 'My Dataset',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    render(
      <EvaluationDetailDataset
        evaluation={baseEvaluation}
        dataset={dataset}
        projectId="proj-1"
        loadingRelated={false}
      />
    )
    expect(screen.getByText('My Dataset')).toBeInTheDocument()
  })

  it('renders datasetId when dataset is not loaded', () => {
    render(
      <EvaluationDetailDataset
        evaluation={baseEvaluation}
        dataset={undefined}
        projectId="proj-1"
        loadingRelated={false}
      />
    )
    expect(screen.getByText('ds-1')).toBeInTheDocument()
  })
})

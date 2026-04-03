import React from 'react'
import { render, screen } from '@testing-library/react'
import { EvaluationDetailMetadata } from '../evaluation-detail-metadata'
import type { EvaluationResponse } from '@/types/evaluations'
import { EvaluationScope } from '@/types/enums'

const baseEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'DATASET' as const,
  evaluationScope: EvaluationScope.DATASET,
  name: 'Test Eval',
  scores: [],
  experiments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('EvaluationDetailMetadata', () => {
  it('returns null when metadata is absent', () => {
    const evaluation = { ...baseEvaluation, metadata: null }
    const { container } = render(<EvaluationDetailMetadata evaluation={evaluation} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when metadata is undefined', () => {
    const evaluation = { ...baseEvaluation, metadata: undefined }
    const { container } = render(<EvaluationDetailMetadata evaluation={evaluation} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders metadata as formatted JSON', () => {
    const evaluation = { ...baseEvaluation, metadata: { key: 'value', count: 42 } }
    render(<EvaluationDetailMetadata evaluation={evaluation} />)
    expect(screen.getByText('Metadata')).toBeInTheDocument()
    expect(screen.getByText(/"key": "value"/)).toBeInTheDocument()
    expect(screen.getByText(/"count": 42/)).toBeInTheDocument()
  })
})

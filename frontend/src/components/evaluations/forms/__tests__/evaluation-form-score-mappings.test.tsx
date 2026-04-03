import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EvaluationFormScoreMappings } from '../evaluation-form-score-mappings'
import type { ScoreResponse } from '@/types/scores'

const mockScores: ScoreResponse[] = [
  { id: 'score-1', name: 'Accuracy', projectId: 'proj-1' } as ScoreResponse,
]

describe('EvaluationFormScoreMappings', () => {
  const mockGetScoreMappingSelectValue = jest.fn(() => '')
  const mockOnScoreMappingFieldChange = jest.fn()
  const mockOnScoreCustomFieldChange = jest.fn()
  const mockIsRagasScore = jest.fn(() => false)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when no mappable scores (no scope)', () => {
    const { container } = render(
      <EvaluationFormScoreMappings
        selectedScoreIds={['score-1']}
        scores={mockScores}
        scoreVariables={{ 'score-1': ['input'] }}
        scoreMappings={{}}
        customFieldValues={{}}
        datasetHeaders={[]}
        loadingHeaders={false}
        evaluationScope="DATASET"
        datasetId=""
        selectedExperimentIds={[]}
        isRagasScore={mockIsRagasScore}
        getScoreMappingSelectValue={mockGetScoreMappingSelectValue}
        onScoreMappingFieldChange={mockOnScoreMappingFieldChange}
        onScoreCustomFieldChange={mockOnScoreCustomFieldChange}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when selected scores have no variables', () => {
    const { container } = render(
      <EvaluationFormScoreMappings
        selectedScoreIds={['score-1']}
        scores={mockScores}
        scoreVariables={{}}
        scoreMappings={{}}
        customFieldValues={{}}
        datasetHeaders={['col1']}
        loadingHeaders={false}
        evaluationScope="DATASET"
        datasetId="ds-1"
        selectedExperimentIds={[]}
        isRagasScore={mockIsRagasScore}
        getScoreMappingSelectValue={mockGetScoreMappingSelectValue}
        onScoreMappingFieldChange={mockOnScoreMappingFieldChange}
        onScoreCustomFieldChange={mockOnScoreCustomFieldChange}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders score mappings when scope and variables are present', () => {
    mockGetScoreMappingSelectValue.mockReturnValue('col1')
    render(
      <EvaluationFormScoreMappings
        selectedScoreIds={['score-1']}
        scores={mockScores}
        scoreVariables={{ 'score-1': ['input'] }}
        scoreMappings={{}}
        customFieldValues={{}}
        datasetHeaders={['col1', 'col2']}
        loadingHeaders={false}
        evaluationScope="DATASET"
        datasetId="ds-1"
        selectedExperimentIds={[]}
        isRagasScore={mockIsRagasScore}
        getScoreMappingSelectValue={mockGetScoreMappingSelectValue}
        onScoreMappingFieldChange={mockOnScoreMappingFieldChange}
        onScoreCustomFieldChange={mockOnScoreCustomFieldChange}
      />
    )
    expect(screen.getByText(/1 score with mappings/)).toBeInTheDocument()
    expect(screen.getByText(/Score Mappings: Accuracy/)).toBeInTheDocument()
    expect(screen.getByText(/Map evaluator prompt variables to dataset fields/)).toBeInTheDocument()
  })

  it('shows loading spinner when loadingHeaders is true', () => {
    mockGetScoreMappingSelectValue.mockReturnValue('')
    render(
      <EvaluationFormScoreMappings
        selectedScoreIds={['score-1']}
        scores={mockScores}
        scoreVariables={{ 'score-1': ['input'] }}
        scoreMappings={{}}
        customFieldValues={{}}
        datasetHeaders={[]}
        loadingHeaders={true}
        evaluationScope="DATASET"
        datasetId="ds-1"
        selectedExperimentIds={[]}
        isRagasScore={mockIsRagasScore}
        getScoreMappingSelectValue={mockGetScoreMappingSelectValue}
        onScoreMappingFieldChange={mockOnScoreMappingFieldChange}
        onScoreCustomFieldChange={mockOnScoreCustomFieldChange}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows RAGAS label when score is RAGAS', () => {
    mockIsRagasScore.mockReturnValue(true)
    mockGetScoreMappingSelectValue.mockReturnValue('col1')
    render(
      <EvaluationFormScoreMappings
        selectedScoreIds={['score-1']}
        scores={mockScores}
        scoreVariables={{ 'score-1': ['context'] }}
        scoreMappings={{}}
        customFieldValues={{}}
        datasetHeaders={['col1']}
        loadingHeaders={false}
        evaluationScope="DATASET"
        datasetId="ds-1"
        selectedExperimentIds={[]}
        isRagasScore={mockIsRagasScore}
        getScoreMappingSelectValue={mockGetScoreMappingSelectValue}
        onScoreMappingFieldChange={mockOnScoreMappingFieldChange}
        onScoreCustomFieldChange={mockOnScoreCustomFieldChange}
      />
    )
    expect(screen.getByText(/Score Mappings: RAGAS: Accuracy/)).toBeInTheDocument()
    expect(screen.getByText(/Map RAGAS score fields to dataset fields/)).toBeInTheDocument()
  })
})

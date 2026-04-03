import React from 'react'
import { render, screen } from '@testing-library/react'
import { EvaluationForm } from '../evaluation-form'

const mockFormState = {
  name: '',
  description: '',
  evaluationType: 'AUTOMATIC' as const,
  evaluationScope: 'EXPERIMENT' as const,
  setName: jest.fn(),
  setDescription: jest.fn(),
  setEvaluationScope: jest.fn(),
  handleScopeReset: jest.fn(),
  datasetId: '',
  setDatasetId: jest.fn(),
  selectedExperimentIds: [] as string[],
  setSelectedExperimentIds: jest.fn(),
  selectedScoreIds: [] as string[],
  setSelectedScoreIds: jest.fn(),
  scores: [],
  datasets: [],
  experiments: [],
  loadingDatasets: false,
  loadingExperiments: false,
  loadingScores: false,
  datasetsError: null,
  experimentsError: null,
  scoresError: null,
  experimentDatasetError: null,
  isRagasScore: () => false,
  ragasModelConfigurationId: '',
  setRagasModelConfigurationId: jest.fn(),
  scoreVariables: {},
  scoreMappings: {},
  customFieldValues: {},
  datasetHeaders: [],
  loadingHeaders: false,
  getScoreMappingSelectValue: jest.fn(),
  handleScoreMappingFieldChange: jest.fn(),
  handleScoreCustomFieldChange: jest.fn(),
  updateScoreMapping: jest.fn(),
}

jest.mock('@/hooks/evaluations/use-evaluation-form', () => ({
  useEvaluationForm: () => mockFormState,
}))

jest.mock('@/hooks/evaluations/use-evaluations-query', () => ({
  useCreateEvaluation: () => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}))

jest.mock('@/hooks/model-configurations/use-model-configurations-query', () => ({
  useModelConfigurationsQuery: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}))

jest.mock('@/hooks/shared/use-mutation-action', () => ({
  useMutationAction: () => ({
    isPending: false,
    errorMessage: null,
  }),
}))

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
}))

describe('EvaluationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form with Create Evaluation button', () => {
    render(<EvaluationForm projectId="proj-1" />)
    expect(screen.getByRole('button', { name: 'Create Evaluation' })).toBeInTheDocument()
  })

  it('disables submit when in edit mode', () => {
    render(
      <EvaluationForm
        projectId="proj-1"
        evaluation={{
          id: 'eval-1',
          name: 'Test',
          evaluationType: 'AUTOMATIC',
          evaluationScope: 'EXPERIMENT',
          projectId: 'proj-1',
          experiments: [],
          scores: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any}
      />
    )
    expect(screen.getByRole('button', { name: 'Create Evaluation' })).toBeDisabled()
  })

  it('renders scope selection', () => {
    render(<EvaluationForm projectId="proj-1" />)
    expect(screen.getByText(/Evaluation Scope/i)).toBeInTheDocument()
  })
})

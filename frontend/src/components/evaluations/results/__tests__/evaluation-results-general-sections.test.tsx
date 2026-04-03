import { render, screen } from '@/__tests__/test-utils'
import {
  EvaluationDetailsScoresSection,
  EvaluationDetailsDatasetSection,
  EvaluationDetailsExperimentsSection,
  EvaluationStatisticsContent,
} from '../evaluation-results-general-sections'
import type { EvaluationResponse } from '@/types/evaluations'
import { EvaluationScope } from '@/types/enums'

jest.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

const baseEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'DATASET',
  evaluationScope: EvaluationScope.DATASET,
  name: 'Test Eval',
  datasetId: 'ds-1',
  scores: [{ id: 's1', description: 'Acc', scoringType: 'NUMERIC', name: 'Accuracy' }] as never,
  experiments: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('EvaluationDetailsScoresSection', () => {
  it('shows loading when loadingRelated and no scores', () => {
    render(
      <EvaluationDetailsScoresSection
        loadingRelated={true}
        scores={[]}
        evaluation={baseEvaluation}
      />
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders scores from evaluation when scores array empty', () => {
    render(
      <EvaluationDetailsScoresSection
        loadingRelated={false}
        scores={[]}
        evaluation={baseEvaluation}
      />
    )
    expect(screen.getByText('Accuracy')).toBeInTheDocument()
  })
})

describe('EvaluationDetailsDatasetSection', () => {
  it('shows loading when loadingRelated', () => {
    render(
      <EvaluationDetailsDatasetSection
        loadingRelated={true}
        dataset={null}
        evaluation={baseEvaluation}
        organisationId="org-1"
        projectId="proj-1"
      />
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders datasetId when dataset is null', () => {
    render(
      <EvaluationDetailsDatasetSection
        loadingRelated={false}
        dataset={null}
        evaluation={baseEvaluation}
        organisationId="org-1"
        projectId="proj-1"
      />
    )
    expect(screen.getByText('ds-1')).toBeInTheDocument()
  })

  it('renders dataset link when dataset provided', () => {
    render(
      <EvaluationDetailsDatasetSection
        loadingRelated={false}
        dataset={{ id: 'ds-1', name: 'My Dataset' }}
        evaluation={baseEvaluation}
        organisationId="org-1"
        projectId="proj-1"
      />
    )
    expect(screen.getByText('My Dataset')).toBeInTheDocument()
  })
})

describe('EvaluationDetailsExperimentsSection', () => {
  it('shows loading when loadingRelated', () => {
    render(
      <EvaluationDetailsExperimentsSection
        loadingRelated={true}
        experiments={[]}
        evaluation={baseEvaluation}
        projectId="proj-1"
      />
    )
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders experiment id snippets when experiments empty', () => {
    const evalWithExps: EvaluationResponse = {
      ...baseEvaluation,
      evaluationScope: EvaluationScope.EXPERIMENT,
      experiments: [{ id: 'exp-12345678', promptVersionId: 'pv-1', datasetId: 'ds-1' }],
    }
    render(
      <EvaluationDetailsExperimentsSection
        loadingRelated={false}
        experiments={[]}
        evaluation={evalWithExps}
        organisationId="org-1"
        projectId="proj-1"
      />
    )
    expect(screen.getByText('exp-1234...')).toBeInTheDocument()
  })
})

describe('EvaluationStatisticsContent', () => {
  it('shows loading when isLoadingStatistics', () => {
    render(
      <EvaluationStatisticsContent
        isLoadingStatistics={true}
        statisticsError={null}
        statistics={[]}
        isDatasetEvaluation={true}
        hasSingleExperiment={false}
        experiments={[]}
        scores={[]}
        evaluation={baseEvaluation}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows error message when statisticsError', () => {
    render(
      <EvaluationStatisticsContent
        isLoadingStatistics={false}
        statisticsError={new Error('Failed to load')}
        statistics={[]}
        isDatasetEvaluation={true}
        hasSingleExperiment={false}
        experiments={[]}
        scores={[]}
        evaluation={baseEvaluation}
      />
    )
    expect(screen.getByText(/Error loading statistics/)).toBeInTheDocument()
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
  })

  it('shows no statistics message when statistics empty', () => {
    render(
      <EvaluationStatisticsContent
        isLoadingStatistics={false}
        statisticsError={null}
        statistics={[]}
        isDatasetEvaluation={true}
        hasSingleExperiment={false}
        experiments={[]}
        scores={[]}
        evaluation={baseEvaluation}
      />
    )
    expect(screen.getByText('No statistics available yet')).toBeInTheDocument()
  })
})

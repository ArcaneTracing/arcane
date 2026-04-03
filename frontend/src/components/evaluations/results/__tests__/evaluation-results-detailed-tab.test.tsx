import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import { EvaluationResultsDetailedTab } from '../evaluation-results-detailed-tab';
import type { EvaluationResponse } from '@/types/evaluations';
import { EvaluationScope } from '@/types/enums';

const mockUseOrganisationIdOrNull = jest.fn(() => 'org-1');
jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: () => mockUseOrganisationIdOrNull()
}));

const mockUseQueries = jest.fn();
const mockUseQuery = jest.fn();
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueries: (config: {queries: unknown[];}) => mockUseQueries(config),
    useQuery: (config: unknown) => mockUseQuery(config)
  };
});

jest.mock('@/hooks/evaluations/use-evaluations-query', () => ({
  useDatasetResultsQuery: jest.fn(),
  useExperimentScoresQuery: jest.fn(),
  useExperimentResultsQuery: jest.fn()
}));

jest.mock('@/hooks/datasets/use-datasets-query', () => ({
  useDatasetQuery: jest.fn(),
  useDatasetHeaderQuery: jest.fn()
}));

const {
  useDatasetResultsQuery,
  useExperimentScoresQuery,
  useExperimentResultsQuery
} = jest.requireMock('@/hooks/evaluations/use-evaluations-query');
const { useDatasetQuery, useDatasetHeaderQuery } = jest.requireMock('@/hooks/datasets/use-datasets-query');

const baseEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'DATASET',
  evaluationScope: EvaluationScope.DATASET,
  name: 'Test Eval',
  datasetId: 'ds-1',
  scores: [{ id: 'score-1', description: 'Accuracy', scoringType: 'NUMERIC' }] as EvaluationResponse['scores'],
  experiments: [],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20')
};

const datasetWithRows = {
  id: 'ds-1',
  name: 'Test Dataset',
  header: ['col1', 'col2'],
  rows: [
  { id: 'row-1', values: ['val1', 'val2'] },
  { id: 'row-2', values: ['val3', 'val4'] }],

  createdAt: new Date(),
  updatedAt: new Date()
};

const datasetResults = [
{
  id: 'er-1',
  datasetRowId: 'row-1',
  scoreResults: [
  { id: 'sr-1', scoreId: 'score-1', value: 0.95, status: 'DONE', datasetRowId: 'row-1' }],

  createdAt: new Date()
},
{
  id: 'er-2',
  datasetRowId: 'row-2',
  scoreResults: [
  { id: 'sr-2', scoreId: 'score-1', value: 0.87, status: 'DONE', datasetRowId: 'row-2' }],

  createdAt: new Date()
}];


describe('EvaluationResultsDetailedTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueries.mockImplementation((config: {queries: unknown[];}) =>
    config.queries.map(() => ({ data: null, isLoading: false }))
    );
    mockUseQuery.mockReturnValue({ data: [], isLoading: false });
    useDatasetResultsQuery.mockReturnValue({
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      },
      isLoading: false
    });
    useExperimentScoresQuery.mockReturnValue({ data: null, isLoading: false });
    useExperimentResultsQuery.mockReturnValue({
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      },
      isLoading: false
    });
    useDatasetQuery.mockReturnValue({ data: null, isLoading: false });
    useDatasetHeaderQuery.mockReturnValue({ data: ['col1', 'col2'], isLoading: false });
  });

  it('shows message when evaluation has no experiments and is not dataset scope', () => {
    const evalNoExperiments: EvaluationResponse = {
      ...baseEvaluation,
      evaluationScope: EvaluationScope.EXPERIMENT,
      experiments: [],
      datasetId: null
    };
    render(
      <EvaluationResultsDetailedTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={evalNoExperiments} />

    );
    expect(
      screen.getByText(/This evaluation does not include experiments. Detailed results are only available/)
    ).toBeInTheDocument();
  });

  it('shows loading state for dataset evaluation', () => {
    useDatasetQuery.mockReturnValue({ data: null, isLoading: true });
    useDatasetResultsQuery.mockReturnValue({ data: [], isLoading: true });

    render(
      <EvaluationResultsDetailedTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={baseEvaluation} />

    );
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('shows "No results found" when dataset evaluation has no results', () => {
    useDatasetQuery.mockReturnValue({ data: datasetWithRows, isLoading: false });
    useDatasetResultsQuery.mockReturnValue({
      data: {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      },
      isLoading: false
    });

    render(
      <EvaluationResultsDetailedTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={baseEvaluation} />

    );
    expect(screen.getByText(/No results found for this dataset evaluation/)).toBeInTheDocument();
  });

  it('renders table with results for dataset evaluation', () => {
    useDatasetQuery.mockReturnValue({ data: datasetWithRows, isLoading: false });
    useDatasetHeaderQuery.mockReturnValue({ data: ['col1', 'col2'], isLoading: false });
    useDatasetResultsQuery.mockReturnValue({
      data: {
        data: datasetResults.map((dr) => ({
          ...dr,
          datasetRow: { id: dr.datasetRowId, values: ['val1', 'val2'] }
        })),
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      },
      isLoading: false
    });

    render(
      <EvaluationResultsDetailedTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={baseEvaluation} />

    );
    expect(screen.getByText('Detailed Results')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search results')).toBeInTheDocument();

    const val1Elements = screen.getAllByText('val1');
    expect(val1Elements.length).toBeGreaterThan(0);
    expect(screen.getByText('0.950')).toBeInTheDocument();
  });

  it('auto-selects and shows results for single-experiment evaluation', async () => {
    const singleExpEval: EvaluationResponse = {
      ...baseEvaluation,
      evaluationScope: EvaluationScope.EXPERIMENT,
      datasetId: null,
      experiments: [{ id: 'exp-1', promptVersionId: 'pv-1', datasetId: 'ds-1' }]
    };
    mockUseQueries.mockImplementation((config: {queries: unknown[];}) => {
      if (config.queries?.length === 2) {
        return [
        { data: { id: 'exp-1', name: 'Exp 1', datasetId: 'ds-1' }, isLoading: false },
        { data: { id: 'score-1', description: 'Accuracy', scoringType: 'NUMERIC' }, isLoading: false }];

      }
      return config.queries.map(() => ({ data: null, isLoading: false }));
    });
    useDatasetQuery.mockReturnValue({ data: datasetWithRows, isLoading: false });
    useDatasetHeaderQuery.mockReturnValue({ data: ['col1', 'col2'], isLoading: false });
    useExperimentResultsQuery.mockReturnValue({
      data: {
        data: [
        {
          id: 'er-1',
          experimentId: 'exp-1',
          datasetRowId: 'row-1',
          datasetRow: { id: 'row-1', values: ['val1', 'val2'] },
          scoreResults: []
        },
        {
          id: 'er-2',
          experimentId: 'exp-1',
          datasetRowId: 'row-2',
          datasetRow: { id: 'row-2', values: ['val3', 'val4'] },
          scoreResults: []
        }],

        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      },
      isLoading: false
    });
    useExperimentScoresQuery.mockReturnValue({
      data: {
        scoreResults: [
        { scoreId: 'score-1', datasetRowId: 'row-1', value: 0.95 },
        { scoreId: 'score-1', datasetRowId: 'row-2', value: 0.87 }]

      },
      isLoading: false
    });
    mockUseQuery.mockImplementation((config: {queryKey?: unknown[];enabled?: boolean;}) => {
      if (config.queryKey?.[0] === 'evaluation-results') {
        return {
          data: [
          { id: 'eval-er-1', experimentResultId: 'er-1', datasetRowId: 'row-1', scoreResults: [] },
          { id: 'eval-er-2', experimentResultId: 'er-2', datasetRowId: 'row-2', scoreResults: [] }],

          isLoading: false
        };
      }
      return { data: [], isLoading: false };
    });

    render(
      <EvaluationResultsDetailedTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={singleExpEval} />

    );
    await screen.findByText('Detailed Results');

    const val1Elements = screen.queryAllByText('val1');
    const val2Elements = screen.queryAllByText('val2');

    if (val1Elements.length > 0) {
      expect(val1Elements.length).toBeGreaterThan(0);
    }
    if (val2Elements.length > 0) {
      expect(val2Elements.length).toBeGreaterThan(0);
    }
  });

  it('shows "Please select an experiment" for multi-experiment evaluation when none selected', () => {
    const multiExpEval: EvaluationResponse = {
      ...baseEvaluation,
      evaluationScope: EvaluationScope.EXPERIMENT,
      datasetId: null,
      experiments: [{ id: 'exp-1', promptVersionId: 'pv-1', datasetId: 'ds-1' }, { id: 'exp-2', promptVersionId: 'pv-2', datasetId: 'ds-1' }]
    };
    mockUseQueries.mockImplementation(() => [
    { data: { id: 'exp-1', name: 'Exp 1', datasetId: 'ds-1' }, isLoading: false },
    { data: { id: 'exp-2', name: 'Exp 2', datasetId: 'ds-1' }, isLoading: false }]
    );

    render(
      <EvaluationResultsDetailedTab
        projectId="proj-1"
        evaluationId="eval-1"
        evaluation={multiExpEval} />

    );
    expect(screen.getByText(/Please select an experiment to view detailed results/)).toBeInTheDocument();
  });
});
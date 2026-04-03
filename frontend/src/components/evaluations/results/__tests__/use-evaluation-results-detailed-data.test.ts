import { renderHook, act } from '@testing-library/react';
import { useEvaluationResultsDetailedData } from '../use-evaluation-results-detailed-data';
import type { EvaluationResponse } from '@/types/evaluations';
import { EvaluationScope } from '@/types/enums';

jest.mock('@/hooks/evaluations/use-evaluations-query', () => ({
  useExperimentScoresQuery: () => ({ data: null, isLoading: false }),
  useDatasetResultsQuery: () => ({
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
  }),
  useExperimentResultsQuery: () => ({
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
  })
}));
jest.mock('@/hooks/datasets/use-datasets-query', () => ({
  useDatasetQuery: () => ({ data: null, isLoading: false }),
  useDatasetHeaderQuery: () => ({ data: null, isLoading: false })
}));
jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueries: () => [
    { data: null, isLoading: false },
    { data: null, isLoading: false }],

    useQuery: () => ({ data: [], isLoading: false })
  };
});

const datasetEvaluation: EvaluationResponse = {
  id: 'eval-1',
  projectId: 'proj-1',
  evaluationType: 'DATASET',
  evaluationScope: EvaluationScope.DATASET,
  name: 'Test',
  datasetId: 'ds-1',
  scores: [{ id: 's1', description: 'Acc', scoringType: 'NUMERIC', name: 'Accuracy' }] as never,
  experiments: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

const experimentEvaluation: EvaluationResponse = {
  ...datasetEvaluation,
  evaluationScope: EvaluationScope.EXPERIMENT,
  datasetId: null,
  experiments: [
  { id: 'exp-1', promptVersionId: 'pv-1', datasetId: 'ds-1' },
  { id: 'exp-2', promptVersionId: 'pv-2', datasetId: 'ds-1' }]

};

describe('useEvaluationResultsDetailedData', () => {
  it('returns isDatasetEvaluation true for dataset scope', () => {
    const { result } = renderHook(() =>
    useEvaluationResultsDetailedData('org-1', 'proj-1', 'eval-1', datasetEvaluation)
    );
    expect(result.current.isDatasetEvaluation).toBe(true);
    expect(result.current.hasSingleExperiment).toBe(false);
  });

  it('returns hasSingleExperiment false for multi-experiment', () => {
    const { result } = renderHook(() =>
    useEvaluationResultsDetailedData('org-1', 'proj-1', 'eval-1', experimentEvaluation)
    );
    expect(result.current.isDatasetEvaluation).toBe(false);
    expect(result.current.hasSingleExperiment).toBe(false);
  });

  it('allows updating searchQuery', () => {
    const { result } = renderHook(() =>
    useEvaluationResultsDetailedData('org-1', 'proj-1', 'eval-1', datasetEvaluation)
    );
    expect(result.current.searchQuery).toBe('');
    act(() => {
      result.current.setSearchQuery('test');
    });
    expect(result.current.searchQuery).toBe('test');
  });

  it('returns combinedRows as empty array when no data', () => {
    const { result } = renderHook(() =>
    useEvaluationResultsDetailedData('org-1', 'proj-1', 'eval-1', datasetEvaluation)
    );
    expect(result.current.combinedRows).toEqual([]);
  });

  it('returns paginationMeta from paginated results', () => {
    const { result } = renderHook(() =>
    useEvaluationResultsDetailedData('org-1', 'proj-1', 'eval-1', datasetEvaluation)
    );


    expect(result.current.paginationMeta).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    });
  });
});
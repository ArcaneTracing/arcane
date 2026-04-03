import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExperimentResultsList } from '../experiment-results-list';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/hooks/experiments/use-experiments-query', () => ({
  useExperimentQuery: jest.fn(),
  useExperimentResultsQuery: jest.fn()
}));

jest.mock('@/hooks/datasets/use-datasets-query', () => ({
  useDatasetQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null
  }))
}));

const mockUseExperimentQuery = require('@/hooks/experiments/use-experiments-query').useExperimentQuery;
const mockUseExperimentResultsQuery = require('@/hooks/experiments/use-experiments-query').useExperimentResultsQuery;
const mockUseDatasetQuery = require('@/hooks/datasets/use-datasets-query').useDatasetQuery;

describe('ExperimentResultsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseExperimentQuery.mockReturnValue({
      data: { id: 'exp-1', datasetId: 'dataset-1' },
      isLoading: false,
      error: null
    });
    mockUseExperimentResultsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });
    mockUseDatasetQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null
    });
  });

  it('should display loading state', () => {
    mockUseExperimentQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    });

    const { container } = customRender(<ExperimentResultsList projectId="project-1" experimentId="exp-1" />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockUseExperimentQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load')
    });

    customRender(<ExperimentResultsList projectId="project-1" experimentId="exp-1" />);

    expect(screen.getByText(/Error: Failed to load/i)).toBeInTheDocument();
  });

  it('should display no dataset message when dataset has no header', () => {
    mockUseDatasetQuery.mockReturnValue({
      data: { id: 'dataset-1', header: [], rows: [] },
      isLoading: false,
      error: null
    });
    mockUseExperimentResultsQuery.mockReturnValue({
      data: {
        data: [
        {
          datasetRow: { id: 'row-1', values: ['a'] },
          experimentResult: 'ok',
          experimentResultId: 'result-1',
          createdAt: new Date()
        }],

        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      },
      isLoading: false,
      error: null
    });

    customRender(<ExperimentResultsList projectId="project-1" experimentId="exp-1" />);

    expect(screen.getByText(/No dataset header found/i)).toBeInTheDocument();
  });

  it('should display no results when combined rows empty', () => {
    mockUseDatasetQuery.mockReturnValue({
      data: { id: 'dataset-1', header: ['col1'], rows: [] },
      isLoading: false,
      error: null
    });
    mockUseExperimentResultsQuery.mockReturnValue({
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
      isLoading: false,
      error: null
    });

    customRender(<ExperimentResultsList projectId="project-1" experimentId="exp-1" />);

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('should render search and table when results exist', () => {
    mockUseDatasetQuery.mockReturnValue({
      data: {
        id: 'dataset-1',
        header: ['input', 'expected'],
        rows: [
        { id: 'row-1', values: ['a', 'b'] }]

      },
      isLoading: false,
      error: null
    });
    mockUseExperimentResultsQuery.mockReturnValue({
      data: [{ datasetRowId: 'row-1', result: 'ok' }],
      isLoading: false,
      error: null
    });

    customRender(<ExperimentResultsList projectId="project-1" experimentId="exp-1" />);

    expect(screen.getByPlaceholderText('Search results')).toBeInTheDocument();
    expect(screen.getByText('input')).toBeInTheDocument();
    expect(screen.getByText('expected')).toBeInTheDocument();
    expect(screen.getByText('Experiment Result')).toBeInTheDocument();
  });

  it('should filter results when search query changes', () => {
    mockUseDatasetQuery.mockReturnValue({
      data: {
        id: 'dataset-1',
        header: ['input', 'expected'],
        rows: [
        { id: 'row-1', values: ['hello', 'world'] },
        { id: 'row-2', values: ['foo', 'bar'] }]

      },
      isLoading: false,
      error: null
    });
    mockUseExperimentResultsQuery.mockReturnValue({
      data: {
        data: [
        {
          datasetRow: { id: 'row-1', values: ['hello', 'world'] },
          experimentResult: 'ok',
          experimentResultId: 'result-1',
          createdAt: new Date()
        },
        {
          datasetRow: { id: 'row-2', values: ['foo', 'bar'] },
          experimentResult: 'nok',
          experimentResultId: 'result-2',
          createdAt: new Date()
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
      isLoading: false,
      error: null
    });

    customRender(<ExperimentResultsList projectId="project-1" experimentId="exp-1" />);

    const searchInput = screen.getByPlaceholderText('Search results');
    fireEvent.change(searchInput, { target: { value: 'hello' } });

    expect(searchInput).toHaveValue('hello');
  });

  it('should handle pagination when resultsData has pagination', () => {
    mockUseDatasetQuery.mockReturnValue({
      data: {
        id: 'dataset-1',
        header: ['input', 'expected'],
        rows: []
      },
      isLoading: false,
      error: null
    });
    mockUseExperimentResultsQuery.mockReturnValue({
      data: {
        data: [
        {
          datasetRow: { id: 'row-1', values: ['a', 'b'] },
          experimentResult: 'ok',
          experimentResultId: 'result-1',
          createdAt: new Date()
        }],

        pagination: {
          page: 2,
          limit: 20,
          total: 50,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true
        }
      },
      isLoading: false,
      error: null
    });

    customRender(<ExperimentResultsList projectId="project-1" experimentId="exp-1" />);


    expect(screen.getByText(/50/)).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ExperimentsTable } from '../experiments-table';
import { ExperimentResponse } from '@/types/experiments';
import { render as customRender } from '@/__tests__/test-utils';
import { useNavigate, useParams } from '@tanstack/react-router';

jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(() => jest.fn()),
  useParams: jest.fn(),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

const mockDeleteExperiment = jest.fn().mockResolvedValue(undefined);
const mockRerunExperiment = jest.fn().mockResolvedValue(undefined);

jest.mock('@/hooks/experiments/use-experiments-query', () => ({
  useExperimentsQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null
  })),
  useDeleteExperiment: jest.fn(() => ({
    mutateAsync: mockDeleteExperiment,
    isPending: false
  })),
  useRerunExperiment: jest.fn(() => ({
    mutateAsync: mockRerunExperiment,
    isPending: false
  }))
}));

jest.mock('../../cards/experiment-card', () => ({
  ExperimentCard: ({ experiment, onView, onRerun, onDelete }: any) =>
  <div data-testid={`experiment-card-${experiment.id}`}>
      <div>{experiment.name}</div>
      <button onClick={() => onView(experiment.id)}>View</button>
      <button onClick={() => onRerun(experiment)}>Rerun</button>
      <button onClick={() => onDelete(experiment)}>Delete</button>
    </div>

}));

jest.mock('@/lib/error-handling', () => ({
  isForbiddenError: jest.fn(() => false),
  getErrorMessage: jest.fn((_err: unknown, fallback: string) => fallback)
}));

jest.mock('@/components/shared/table', () => ({
  TableContainer: ({ children, isLoading, error, isEmpty, emptyMessage }: any) => {
    if (isLoading) return <div data-testid="loading">Loading...</div>;
    if (error) return <div data-testid="error">Error: {error}</div>;
    if (isEmpty) return <div data-testid="empty">{emptyMessage}</div>;
    return <div>{children}</div>;
  },
  TablePagination: ({ meta, onPageChange }: any) =>
  <div data-testid="pagination">
      <button onClick={() => onPageChange(meta.page + 1)}>Next</button>
      <button onClick={() => onPageChange(meta.page - 1)}>Previous</button>
    </div>

}));

const mockUseExperimentsQuery = require('@/hooks/experiments/use-experiments-query').useExperimentsQuery;
const mockUseDeleteExperiment = require('@/hooks/experiments/use-experiments-query').useDeleteExperiment;
const mockUseRerunExperiment = require('@/hooks/experiments/use-experiments-query').useRerunExperiment;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

describe('ExperimentsTable', () => {
  const mockNavigate = jest.fn();

  const mockExperiments: ExperimentResponse[] = [
  {
    id: 'experiment-1',
    projectId: 'project-1',
    name: 'Experiment 1',
    description: 'Description 1',
    promptVersionId: 'prompt-1',
    datasetId: 'dataset-1',
    promptInputMappings: {},
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'experiment-2',
    projectId: 'project-1',
    name: 'Experiment 2',
    description: 'Description 2',
    promptVersionId: 'prompt-2',
    datasetId: 'dataset-2',
    promptInputMappings: {},
    createdAt: new Date('2024-01-02').toISOString(),
    updatedAt: new Date('2024-01-02').toISOString()
  },
  {
    id: 'experiment-3',
    projectId: 'project-1',
    name: 'Experiment 3',
    description: 'Description 3',
    promptVersionId: 'prompt-3',
    datasetId: 'dataset-3',
    promptInputMappings: {},
    createdAt: new Date('2024-01-03').toISOString(),
    updatedAt: new Date('2024-01-03').toISOString()
  }];


  beforeEach(() => {
    jest.clearAllMocks();
    require('@/lib/error-handling').isForbiddenError.mockReturnValue(false);
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseParams.mockReturnValue({ organisationId: 'org-1', projectId: 'project-1' } as any);
    mockUseExperimentsQuery.mockReturnValue({
      data: mockExperiments,
      isLoading: false,
      error: null
    });
    mockUseDeleteExperiment.mockReturnValue({
      mutateAsync: mockDeleteExperiment,
      isPending: false
    });
    mockUseRerunExperiment.mockReturnValue({
      mutateAsync: mockRerunExperiment,
      isPending: false
    });
  });

  it('should render experiments', () => {
    customRender(<ExperimentsTable searchQuery="" />);

    expect(screen.getByText('Experiment 1')).toBeInTheDocument();
    expect(screen.getByText('Experiment 2')).toBeInTheDocument();
    expect(screen.getByText('Experiment 3')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    mockUseExperimentsQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null
    });

    customRender(<ExperimentsTable searchQuery="" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockUseExperimentsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Failed to fetch experiments'
    });

    customRender(<ExperimentsTable searchQuery="" />);

    expect(screen.getByText(/Error: Failed to fetch experiments/i)).toBeInTheDocument();
  });

  it('should display empty state', () => {
    mockUseExperimentsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    customRender(<ExperimentsTable searchQuery="" />);

    expect(screen.getByText('No experiments found')).toBeInTheDocument();
  });

  it('should filter experiments by search query', () => {
    customRender(<ExperimentsTable searchQuery="Experiment 1" />);

    expect(screen.getByText('Experiment 1')).toBeInTheDocument();
    expect(screen.queryByText('Experiment 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Experiment 3')).not.toBeInTheDocument();
  });

  it('should filter experiments by description', () => {
    customRender(<ExperimentsTable searchQuery="Description 2" />);

    expect(screen.getByText('Experiment 2')).toBeInTheDocument();
    expect(screen.queryByText('Experiment 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Experiment 3')).not.toBeInTheDocument();
  });

  it('should filter experiments by promptVersionId', () => {
    customRender(<ExperimentsTable searchQuery="prompt-2" />);

    expect(screen.getByText('Experiment 2')).toBeInTheDocument();
    expect(screen.queryByText('Experiment 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Experiment 3')).not.toBeInTheDocument();
  });

  it('should filter experiments by datasetId', () => {
    customRender(<ExperimentsTable searchQuery="dataset-3" />);

    expect(screen.getByText('Experiment 3')).toBeInTheDocument();
    expect(screen.queryByText('Experiment 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Experiment 2')).not.toBeInTheDocument();
  });

  it('should call router.push when View button is clicked', () => {
    customRender(<ExperimentsTable searchQuery="" />);

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organisations/$organisationId/projects/$projectId/experiments/$experimentId',
      params: { organisationId: 'org-1', projectId: 'project-1', experimentId: 'experiment-3' }
    });
  });

  it('should open delete dialog when Delete button is clicked', async () => {
    customRender(<ExperimentsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });
  });

  it('should call deleteExperiment when delete is confirmed', async () => {
    customRender(<ExperimentsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });


    const alertDialog = screen.getByTestId('alert-dialog');
    const confirmButton = within(alertDialog).getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteExperiment).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should close delete dialog when Cancel is clicked', async () => {
    customRender(<ExperimentsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });


    const alertDialog = screen.getByTestId('alert-dialog');
    const cancelButton = within(alertDialog).getByRole('button', { name: /cancel/i });


    fireEvent.click(cancelButton);
    expect(cancelButton).toBeInTheDocument();
  });

  it('should open rerun dialog when Rerun button is clicked', async () => {
    customRender(<ExperimentsTable searchQuery="" />);

    const rerunButtons = screen.getAllByText('Rerun');
    fireEvent.click(rerunButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Re-run Experiment/i)).toBeInTheDocument();
    });
  });

  it('should call rerunExperiment when rerun is confirmed', async () => {
    customRender(<ExperimentsTable searchQuery="" />);

    const rerunButtons = screen.getAllByText('Rerun');
    fireEvent.click(rerunButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Re-run Experiment/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /re-run/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRerunExperiment).toHaveBeenCalledWith('experiment-3');
    }, { timeout: 2000 });
  });

  it('should close rerun dialog when Cancel is clicked', async () => {
    customRender(<ExperimentsTable searchQuery="" />);

    const rerunButtons = screen.getAllByText('Rerun');
    fireEvent.click(rerunButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Re-run Experiment/i)).toBeInTheDocument();
    });


    const alertDialog = screen.getByTestId('alert-dialog');
    const cancelButton = within(alertDialog).getByRole('button', { name: /cancel/i });


    fireEvent.click(cancelButton);
    await waitFor(() => {

      expect(cancelButton).toBeInTheDocument();
    });
  });

  it('should display loading state for delete', () => {
    mockUseDeleteExperiment.mockReturnValue({
      mutateAsync: mockDeleteExperiment,
      isPending: true
    });

    customRender(<ExperimentsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);


    expect(screen.getByText(/Deleting/i)).toBeInTheDocument();
  });

  it('should display loading state for rerun', () => {
    mockUseRerunExperiment.mockReturnValue({
      mutateAsync: mockRerunExperiment,
      isPending: true
    });

    customRender(<ExperimentsTable searchQuery="" />);

    const rerunButtons = screen.getAllByText('Rerun');
    fireEvent.click(rerunButtons[0]);


    expect(screen.getByText(/Re-running/i)).toBeInTheDocument();
  });

  it('should handle pagination', () => {

    const manyExperiments: ExperimentResponse[] = Array.from({ length: 25 }, (_, i) => ({
      id: `experiment-${i}`,
      projectId: 'project-1',
      name: `Experiment ${i}`,
      description: `Description ${i}`,
      promptVersionId: `prompt-${i}`,
      datasetId: `dataset-${i}`,
      promptInputMappings: {},
      createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`).toISOString(),
      updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`).toISOString()
    }));

    mockUseExperimentsQuery.mockReturnValue({
      data: manyExperiments,
      isLoading: false,
      error: null
    });

    customRender(<ExperimentsTable searchQuery="" />);

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('should handle custom sort key and direction', () => {
    customRender(
      <ExperimentsTable
        searchQuery=""
        sortKey="name"
        sortDirection="asc" />

    );

    expect(screen.getByText('Experiment 1')).toBeInTheDocument();
  });


  it('should handle empty search query', () => {
    customRender(<ExperimentsTable searchQuery="" />);

    expect(screen.getByText('Experiment 1')).toBeInTheDocument();
    expect(screen.getByText('Experiment 2')).toBeInTheDocument();
    expect(screen.getByText('Experiment 3')).toBeInTheDocument();
  });

  it('should handle case-insensitive search', () => {
    customRender(<ExperimentsTable searchQuery="EXPERIMENT 1" />);

    expect(screen.getByText('Experiment 1')).toBeInTheDocument();
  });

  it('should handle partial search matches', () => {
    customRender(<ExperimentsTable searchQuery="Experiment" />);

    expect(screen.getByText('Experiment 1')).toBeInTheDocument();
    expect(screen.getByText('Experiment 2')).toBeInTheDocument();
    expect(screen.getByText('Experiment 3')).toBeInTheDocument();
  });

  it('should handle experiments with null description', () => {
    const experimentWithNullDesc: ExperimentResponse = {
      id: 'experiment-4',
      projectId: 'project-1',
      name: 'Experiment 4',
      description: null,
      promptVersionId: 'prompt-4',
      datasetId: 'dataset-4',
      promptInputMappings: {},
      createdAt: new Date('2024-01-04').toISOString(),
      updatedAt: new Date('2024-01-04').toISOString()
    };

    mockUseExperimentsQuery.mockReturnValue({
      data: [experimentWithNullDesc],
      isLoading: false,
      error: null
    });

    customRender(<ExperimentsTable searchQuery="" />);

    expect(screen.getByText('Experiment 4')).toBeInTheDocument();
  });

  it('should handle experiments with empty description', () => {
    const experimentWithEmptyDesc: ExperimentResponse = {
      id: 'experiment-5',
      projectId: 'project-1',
      name: 'Experiment 5',
      description: '',
      promptVersionId: 'prompt-5',
      datasetId: 'dataset-5',
      promptInputMappings: {},
      createdAt: new Date('2024-01-05').toISOString(),
      updatedAt: new Date('2024-01-05').toISOString()
    };

    mockUseExperimentsQuery.mockReturnValue({
      data: [experimentWithEmptyDesc],
      isLoading: false,
      error: null
    });

    customRender(<ExperimentsTable searchQuery="" />);

    expect(screen.getByText('Experiment 5')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    customRender(<ExperimentsTable searchQuery={longQuery} />);

    expect(screen.getByText('No experiments found')).toBeInTheDocument();
  });

  it('should handle special characters in search query', () => {
    customRender(<ExperimentsTable searchQuery="!@#$%^&*()" />);

    expect(screen.getByText('No experiments found')).toBeInTheDocument();
  });

  it('should handle missing projectId in params', () => {
    mockUseParams.mockReturnValue({} as any);

    customRender(<ExperimentsTable searchQuery="" />);


    expect(screen.getByText('Experiment 1')).toBeInTheDocument();
  });

  it('should handle delete error', async () => {
    mockDeleteExperiment.mockRejectedValueOnce(new Error('Failed to delete'));

    customRender(<ExperimentsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });


    const alertDialog = screen.getByTestId('alert-dialog');
    const confirmButton = within(alertDialog).getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmButton);


    await waitFor(() => {
      expect(mockDeleteExperiment).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should show PermissionError when isForbiddenError', () => {
    const { isForbiddenError } = require('@/lib/error-handling');
    isForbiddenError.mockReturnValue(true);

    mockUseExperimentsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Forbidden')
    });

    customRender(<ExperimentsTable searchQuery="" />);

    expect(screen.getByText(/permission/i)).toBeInTheDocument();
  });

  it('should handle rerun error', async () => {
    mockRerunExperiment.mockRejectedValueOnce(new Error('Failed to rerun'));

    customRender(<ExperimentsTable searchQuery="" />);

    const rerunButtons = screen.getAllByText('Rerun');
    fireEvent.click(rerunButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Re-run Experiment/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /re-run/i });
    fireEvent.click(confirmButton);


    await waitFor(() => {
      expect(mockRerunExperiment).toHaveBeenCalled();
    });
  });
});
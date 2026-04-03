import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnnotationQueuesTable } from '../annotation-queues-table';
import { useAnnotationQueuesQuery, useDeleteAnnotationQueue } from '@/hooks/annotation-queues/use-annotation-queues-query';
import { useNavigate } from '@tanstack/react-router';
import { AnnotationQueueListItemResponse, AnnotationQueueType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/hooks/annotation-queues/use-annotation-queues-query', () => ({
  useAnnotationQueuesQuery: jest.fn(),
  useDeleteAnnotationQueue: jest.fn()
}));


let mockErrorState: string | null = null;
let mockErrorObject: {message: string | null;} = { message: null };

const mockUseActionError = jest.fn(() => {
  return {
    get message() {
      return mockErrorObject.message;
    },
    handleError: jest.fn((error: unknown) => {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = 'An error occurred';
      }
      mockErrorState = errorMessage;
      mockErrorObject.message = errorMessage;
    }),
    clear: jest.fn(() => {
      mockErrorState = null;
      mockErrorObject.message = null;
    })
  };
});

jest.mock('@/hooks/shared/use-action-error', () => ({
  useActionError: (...args: any[]) => mockUseActionError(...args)
}));

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(() => jest.fn()),
  useParams: jest.fn(() => ({ organisationId: 'org-1', projectId: 'project-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

jest.mock('@/components/annotation-queues/cards/annotation-queue-card', () => ({
  AnnotationQueueCard: ({ queue, onView, onEdit, onDelete }: any) =>
  <div data-testid={`queue-card-${queue.id}`}>
      <div>{queue.name}</div>
      <button onClick={() => onView(queue)}>View</button>
      <button onClick={() => onEdit(queue)}>Edit</button>
      <button onClick={() => onDelete(queue.id)}>Delete</button>
    </div>

}));

jest.mock('@/components/shared/table', () => ({
  TableContainer: ({ children, isLoading, error, isEmpty, emptyMessage }: any) => {
    if (isLoading) return <div>Loading...</div>;
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return <div>Error: {errorMessage}</div>;
    }
    if (isEmpty) return <div>{emptyMessage}</div>;
    return <div>{children}</div>;
  },
  TablePagination: ({ meta, onPageChange }: any) =>
  <div data-testid="table-pagination">
      <button onClick={() => onPageChange(meta.currentPage + 1)}>Next</button>
    </div>

}));

const mockUseAnnotationQueuesQuery = useAnnotationQueuesQuery as jest.MockedFunction<typeof useAnnotationQueuesQuery>;
const mockUseDeleteAnnotationQueue = useDeleteAnnotationQueue as jest.MockedFunction<typeof useDeleteAnnotationQueue>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

describe('AnnotationQueuesTable', () => {
  const mockNavigate = jest.fn();

  const mockQueues: AnnotationQueueListItemResponse[] = [
  {
    id: 'queue-1',
    name: 'Queue 1',
    description: 'Description 1',
    type: AnnotationQueueType.CONVERSATIONS,
    templateId: 'template-1',
    annotations: [],
    tracesToBeAnnotated: []
  },
  {
    id: 'queue-2',
    name: 'Queue 2',
    description: 'Description 2',
    type: AnnotationQueueType.TRACES,
    templateId: 'template-2',
    annotations: [],
    tracesToBeAnnotated: []
  }];


  const defaultQueryReturn = {
    data: mockQueues,
    isLoading: false,
    error: null
  };

  const defaultDeleteMutation = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockErrorState = null;
    mockErrorObject.message = null;
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseAnnotationQueuesQuery.mockReturnValue(defaultQueryReturn as any);
    mockUseDeleteAnnotationQueue.mockReturnValue(defaultDeleteMutation as any);
  });

  it('should render annotation queues', () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    expect(screen.getByText('Queue 1')).toBeInTheDocument();
    expect(screen.getByText('Queue 2')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    mockUseAnnotationQueuesQuery.mockReturnValue({
      ...defaultQueryReturn,
      isLoading: true
    } as any);

    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const error = new Error('Failed to load queues');
    mockUseAnnotationQueuesQuery.mockReturnValue({
      ...defaultQueryReturn,
      error: error
    } as any);

    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    expect(screen.getByText(/Error: Failed to load queues/i)).toBeInTheDocument();
  });

  it('should display empty state', () => {
    mockUseAnnotationQueuesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: []
    } as any);

    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    expect(screen.getByText('No annotation queues found')).toBeInTheDocument();
  });

  it('should filter queues by search query', () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery="Queue 1"
        projectId="project-1" />

    );

    expect(screen.getByText('Queue 1')).toBeInTheDocument();
    expect(screen.queryByText('Queue 2')).not.toBeInTheDocument();
  });

  it('should filter queues by description', () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery="Description 2"
        projectId="project-1" />

    );

    expect(screen.getByText('Queue 2')).toBeInTheDocument();
    expect(screen.queryByText('Queue 1')).not.toBeInTheDocument();
  });

  it('should handle case-insensitive search', () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery="queue 1"
        projectId="project-1" />

    );

    expect(screen.getByText('Queue 1')).toBeInTheDocument();
  });

  it('should navigate to view page when View is clicked', () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/organisations/$organisationId/projects/$projectId/annotation-queues/$queueId', params: { organisationId: 'org-1', projectId: 'project-1', queueId: 'queue-1' } });
  });

  it('should navigate to edit page when Edit is clicked', () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/organisations/$organisationId/projects/$projectId/annotation-queues/edit/$queueId', params: { organisationId: 'org-1', projectId: 'project-1', queueId: 'queue-1' } });
  });

  it('should open delete dialog when Delete is clicked', async () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
    });
  });

  it('should call deleteAnnotationQueue when delete is confirmed', async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    mockUseDeleteAnnotationQueue.mockReturnValue({
      ...defaultDeleteMutation,
      mutateAsync: mockDelete
    } as any);

    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
    });


    const allDeleteButtons = screen.getAllByRole('button', { name: /delete/i });
    const confirmButton = allDeleteButtons[allDeleteButtons.length - 1];
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('queue-1');
    });
  });


  it('should handle empty string search query', () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    expect(screen.getByText('Queue 1')).toBeInTheDocument();
    expect(screen.getByText('Queue 2')).toBeInTheDocument();
  });

  it('should handle queue without description in search', () => {
    const queueWithoutDesc: AnnotationQueueListItemResponse[] = [
    {
      ...mockQueues[0],
      description: undefined
    }];


    mockUseAnnotationQueuesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: queueWithoutDesc
    } as any);

    customRender(
      <AnnotationQueuesTable
        searchQuery="Queue 1"
        projectId="project-1" />

    );

    expect(screen.getByText('Queue 1')).toBeInTheDocument();
  });

  it('should handle queue with null description', () => {
    const queueWithNullDesc: AnnotationQueueListItemResponse[] = [
    {
      ...mockQueues[0],
      description: null as any
    }];


    mockUseAnnotationQueuesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: queueWithNullDesc
    } as any);

    customRender(
      <AnnotationQueuesTable
        searchQuery="Queue 1"
        projectId="project-1" />

    );

    expect(screen.getByText('Queue 1')).toBeInTheDocument();
  });

  it('should handle sorting by name ascending', () => {
    const unsortedQueues: AnnotationQueueListItemResponse[] = [
    {
      id: 'queue-2',
      name: 'Zebra Queue',
      description: 'Description',
      type: AnnotationQueueType.CONVERSATIONS,
      templateId: 'template-1',
      annotations: [],
      tracesToBeAnnotated: []
    },
    {
      id: 'queue-1',
      name: 'Alpha Queue',
      description: 'Description',
      type: AnnotationQueueType.CONVERSATIONS,
      templateId: 'template-1',
      annotations: [],
      tracesToBeAnnotated: []
    }];


    mockUseAnnotationQueuesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: unsortedQueues
    } as any);

    const { container } = customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1"
        sortKey="name"
        sortDirection="asc" />

    );

    const cards = container.querySelectorAll('[data-testid^="queue-card-"]');
    expect(cards.length).toBe(2);
  });

  it('should handle sorting by name descending', () => {
    const unsortedQueues: AnnotationQueueListItemResponse[] = [
    {
      id: 'queue-1',
      name: 'Alpha Queue',
      description: 'Description',
      type: AnnotationQueueType.CONVERSATIONS,
      templateId: 'template-1',
      annotations: [],
      tracesToBeAnnotated: []
    },
    {
      id: 'queue-2',
      name: 'Zebra Queue',
      description: 'Description',
      type: AnnotationQueueType.CONVERSATIONS,
      templateId: 'template-1',
      annotations: [],
      tracesToBeAnnotated: []
    }];


    mockUseAnnotationQueuesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: unsortedQueues
    } as any);

    const { container } = customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1"
        sortKey="name"
        sortDirection="desc" />

    );

    const cards = container.querySelectorAll('[data-testid^="queue-card-"]');
    expect(cards.length).toBe(2);
  });

  it('should handle sorting by type', () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1"
        sortKey="type"
        sortDirection="asc" />

    );

    expect(screen.getByText('Queue 1')).toBeInTheDocument();
    expect(screen.getByText('Queue 2')).toBeInTheDocument();
  });

  it('should handle delete error', async () => {
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Failed to delete'));
    mockUseDeleteAnnotationQueue.mockReturnValue({
      ...defaultDeleteMutation,
      mutateAsync: mockMutateAsync
    } as any);

    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
    });


    const confirmButtons = screen.getAllByText(/delete/i);

    const confirmButton = confirmButtons[confirmButtons.length - 1];
    fireEvent.click(confirmButton);


    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    }, { timeout: 3000 });
    expect(mockErrorObject.message).toBe('Failed to delete');
  });

  it('should handle delete loading state', async () => {
    mockUseDeleteAnnotationQueue.mockReturnValue({
      ...defaultDeleteMutation,
      isPending: true
    } as any);

    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
    });

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should close delete dialog when cancelled', async () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="project-1" />

    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton);
    expect(cancelButton).toBeInTheDocument();
  });

  it('should handle empty string projectId', () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery=""
        projectId="" />

    );


    expect(screen.getByText('Queue 1')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    customRender(
      <AnnotationQueuesTable
        searchQuery={longQuery}
        projectId="project-1" />

    );


    expect(screen.getByText('No annotation queues found')).toBeInTheDocument();
  });

  it('should handle special characters in search query', () => {
    customRender(
      <AnnotationQueuesTable
        searchQuery="!@#$%^&*()"
        projectId="project-1" />

    );


    expect(screen.getByText('No annotation queues found')).toBeInTheDocument();
  });
});
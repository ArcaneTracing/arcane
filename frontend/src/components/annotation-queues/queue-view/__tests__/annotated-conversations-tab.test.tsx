import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnnotatedConversationsTab } from '../annotated-conversations-tab';
import { AnnotationResponse, AnnotationAnswerResponse } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

const mockDeleteAnnotation = jest.fn().mockResolvedValue(undefined);
const mockInvalidateQueries = jest.fn();
jest.mock('@/hooks/annotation-queues/use-queue-annotations', () => ({
  useQueueAnnotations: jest.fn(() => ({
    deleteAnnotation: mockDeleteAnnotation,
    isDeleteLoading: false
  }))
}));

jest.mock('@/hooks/annotation-queues/use-annotation-queues-query', () => ({
  useAnnotationQueueQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn()
  }))
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: jest.fn(() => ({
      invalidateQueries: mockInvalidateQueries
    }))
  };
});

jest.mock('../delete-annotation-dialog', () => ({
  DeleteAnnotationDialog: ({ isOpen, onConfirm, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="delete-annotation-dialog">
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>);

  }
}));

jest.mock('../annotate-conversation-dialog', () => ({
  AnnotateConversationDialog: ({ isOpen, conversationId, onClose, onComplete }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="annotate-conversation-dialog">
        <div>Conversation ID: {conversationId}</div>
        <button onClick={onClose}>Close</button>
        <button onClick={onComplete}>Complete</button>
      </div>);

  }
}));

const mockUseQueueAnnotations = require('@/hooks/annotation-queues/use-queue-annotations').useQueueAnnotations;

describe('AnnotatedConversationsTab', () => {
  const mockAnnotations: AnnotationResponse[] = [
  {
    id: 'annotation-1',
    conversationId: 'conv-1',
    answers: [
    {
      id: 'answer-1',
      questionId: 'question-1',
      value: 'Answer 1'
    }]

  },
  {
    id: 'annotation-2',
    conversationId: 'conv-2',
    answers: [
    {
      id: 'answer-2',
      questionId: 'question-2',
      value: 'Answer 2'
    },
    {
      id: 'answer-3',
      questionId: 'question-3',
      value: 'Answer 3'
    }]

  }];


  const mockConversations = [
  {
    otelConversationId: 'conv-1',
    conversationConfigId: 'config-1',
    datasourceId: 'datasource-1',
    traceIds: ['trace-1', 'trace-2']
  },
  {
    otelConversationId: 'conv-2',
    conversationConfigId: 'config-2',
    datasourceId: 'datasource-1',
    traceIds: ['trace-3']
  }];


  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockClear();
    mockUseQueueAnnotations.mockReturnValue({
      deleteAnnotation: mockDeleteAnnotation,
      isDeleteLoading: false
    });
  });

  it('should render conversation annotations table', () => {
    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations}
        conversations={mockConversations} />

    );

    expect(screen.getByText('conv-1')).toBeInTheDocument();
    expect(screen.getByText('conv-2')).toBeInTheDocument();
  });

  it('should display answer count', () => {
    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations}
        conversations={mockConversations} />

    );

    expect(screen.getByText(/1 answer/i)).toBeInTheDocument();
    expect(screen.getByText(/2 answers/i)).toBeInTheDocument();
  });

  it('should display empty state when no conversation annotations', () => {
    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={[]}
        conversations={[]} />

    );

    expect(screen.getByText(/No annotated conversations found/i)).toBeInTheDocument();
  });

  it('should filter out non-conversation annotations', () => {
    const mixedAnnotations: AnnotationResponse[] = [
    {
      id: 'annotation-1',
      conversationId: 'conv-1',
      answers: []
    },
    {
      id: 'annotation-2',
      traceId: 'trace-1',
      answers: []
    }];


    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mixedAnnotations}
        conversations={mockConversations} />

    );

    expect(screen.getByText('conv-1')).toBeInTheDocument();
    expect(screen.queryByText('trace-1')).not.toBeInTheDocument();
  });

  it('should open annotate dialog when View button is clicked', async () => {
    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations}
        conversations={mockConversations} />

    );

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-conversation-dialog')).toBeInTheDocument();
    });
  });

  it('should open annotate dialog when Edit button is clicked', async () => {
    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations}
        conversations={mockConversations} />

    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-conversation-dialog')).toBeInTheDocument();
    });
  });

  it('should open delete dialog when Delete button is clicked', async () => {
    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations}
        conversations={mockConversations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-annotation-dialog')).toBeInTheDocument();
    });
  });

  it('should call deleteAnnotation when delete is confirmed', async () => {
    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations}
        conversations={mockConversations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-annotation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteAnnotation).toHaveBeenCalledWith('annotation-1');
    });
  });

  it('should call fetchAnnotationQueue after annotation completes', async () => {
    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations}
        conversations={mockConversations} />

    );

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-conversation-dialog')).toBeInTheDocument();
    });

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['annotationQueue', 'project-1', 'queue-1']
      });
    });
  });

  it('should call invalidateQueries after delete completes', async () => {
    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations}
        conversations={mockConversations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-annotation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['annotationQueue', 'project-1', 'queue-1']
      });
    });
  });


  it('should handle annotation without answers', () => {
    const annotationWithoutAnswers: AnnotationResponse = {
      id: 'annotation-3',
      conversationId: 'conv-3',
      answers: []
    };

    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={[annotationWithoutAnswers]}
        conversations={mockConversations} />

    );

    expect(screen.getByText('conv-3')).toBeInTheDocument();
    expect(screen.getByText(/0 answers/i)).toBeInTheDocument();
  });

  it('should handle annotation with undefined answers', () => {
    const annotationWithoutAnswers: AnnotationResponse = {
      id: 'annotation-4',
      conversationId: 'conv-4',
      answers: undefined
    };

    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={[annotationWithoutAnswers]}
        conversations={mockConversations} />

    );

    expect(screen.getByText('conv-4')).toBeInTheDocument();
    expect(screen.getByText(/0 answers/i)).toBeInTheDocument();
  });

  it('should handle missing conversation data', () => {
    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations}
        conversations={[]} />

    );


    expect(screen.getByText('conv-1')).toBeInTheDocument();
  });

  it('should handle delete error gracefully', async () => {
    mockDeleteAnnotation.mockRejectedValueOnce(new Error('Failed to delete'));

    customRender(
      <AnnotatedConversationsTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations}
        conversations={mockConversations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-annotation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);


    await waitFor(() => {
      expect(mockDeleteAnnotation).toHaveBeenCalled();
    });
  });
});
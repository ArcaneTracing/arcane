import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConversationsToAnnotateTab } from '../conversations-to-annotate-tab';
import { QueuedConversationResponse } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

const mockRemoveConversation = jest.fn().mockResolvedValue(undefined);
const mockInvalidateQueries = jest.fn();

jest.mock('@/hooks/annotation-queues/use-annotation-queues-query', () => ({
  useRemoveConversation: jest.fn()
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

jest.mock('../delete-conversation-dialog', () => ({
  DeleteConversationDialog: ({ isOpen, onConfirm, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="delete-conversation-dialog">
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>);

  }
}));

import { useRemoveConversation } from '@/hooks/annotation-queues/use-annotation-queues-query';
import { useQueryClient } from '@tanstack/react-query';

const mockUseRemoveConversation = useRemoveConversation as jest.MockedFunction<typeof useRemoveConversation>;

describe('ConversationsToAnnotateTab', () => {
  const mockConversations: QueuedConversationResponse[] = [
  {
    id: 'queue-conv-1',
    otelConversationId: 'conv-1',
    conversationConfigId: 'config-1',
    datasourceId: 'datasource-1',
    traceIds: ['trace-1', 'trace-2']
  },
  {
    id: 'queue-conv-2',
    otelConversationId: 'conv-2',
    conversationConfigId: 'config-2',
    datasourceId: 'datasource-1',
    traceIds: ['trace-3']
  }];


  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockClear();
    mockUseRemoveConversation.mockReturnValue({
      mutateAsync: mockRemoveConversation,
      isPending: false,
      error: null
    } as any);
  });

  it('should render conversations table', () => {
    customRender(
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={mockConversations} />

    );

    expect(screen.getByText('conv-1')).toBeInTheDocument();
    expect(screen.getByText('conv-2')).toBeInTheDocument();
  });

  it('should display trace count', () => {
    customRender(
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={mockConversations} />

    );


    expect(screen.getByText(/2 traces/i)).toBeInTheDocument();
    expect(screen.getByText(/1 trace/i)).toBeInTheDocument();
  });

  it('should display empty state when no conversations', () => {
    customRender(
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={[]} />

    );

    expect(screen.getByText(/No conversations to be annotated/i)).toBeInTheDocument();
  });

  it('should open annotate dialog when Annotate button is clicked', async () => {
    customRender(
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={mockConversations} />

    );

    const annotateButtons = screen.getAllByRole('button', { name: /annotate/i });
    fireEvent.click(annotateButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-conversation-dialog')).toBeInTheDocument();
    });
  });

  it('should open delete dialog when Delete button is clicked', async () => {
    customRender(
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={mockConversations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-conversation-dialog')).toBeInTheDocument();
    });
  });

  it('should call removeConversation when delete is confirmed', async () => {
    customRender(
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={mockConversations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-conversation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRemoveConversation).toHaveBeenCalled();
    });
  });

  it('should call fetchAnnotationQueue after annotation completes', async () => {
    customRender(
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={mockConversations} />

    );

    const annotateButtons = screen.getAllByRole('button', { name: /annotate/i });
    fireEvent.click(annotateButtons[0]);

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
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={mockConversations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-conversation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['annotationQueue', 'project-1', 'queue-1']
      });
    });
  });


  it('should handle single conversation', () => {
    customRender(
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={[mockConversations[0]]} />

    );

    expect(screen.getByText('conv-1')).toBeInTheDocument();
    expect(screen.queryByText('conv-2')).not.toBeInTheDocument();
  });

  it('should handle conversation with no trace IDs', () => {
    const conversationWithNoTraces: QueuedConversationResponse = {
      id: 'queue-conv-3',
      otelConversationId: 'conv-3',
      conversationConfigId: 'config-3',
      datasourceId: 'datasource-1',
      traceIds: []
    };

    customRender(
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={[conversationWithNoTraces]} />

    );

    expect(screen.getByText('conv-3')).toBeInTheDocument();
    expect(screen.getByText(/0 traces/i)).toBeInTheDocument();
  });

  it('should handle delete error gracefully', async () => {
    mockRemoveConversation.mockRejectedValueOnce(new Error('Failed to delete'));

    customRender(
      <ConversationsToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        conversations={mockConversations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-conversation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);


    await waitFor(() => {
      expect(mockRemoveConversation).toHaveBeenCalled();
    });
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddConversationToQueueDialog } from '../add-conversation-to-queue-dialog';
import { useAnnotationQueuesByTypeQuery, useAddConversation } from '@/hooks/annotation-queues/use-annotation-queues-query';
import { ConversationListItemResponse, AnnotationQueueType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/hooks/annotation-queues/use-annotation-queues-query', () => ({
  useAnnotationQueuesByTypeQuery: jest.fn(() => ({
    data: [],
    isLoading: false
  })),
  useAddConversation: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false
  }))
}));


let mockErrorState: string | null = null;
let mockErrorObject: {message: string | null;} = { message: null };

jest.mock('@/hooks/shared/use-action-error', () => {
  return {
    useActionError: jest.fn(() => {
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
    })
  };
});

const mockUseActionError = require('@/hooks/shared/use-action-error').useActionError;

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

const mockUseAnnotationQueuesByTypeQuery = useAnnotationQueuesByTypeQuery as jest.MockedFunction<typeof useAnnotationQueuesByTypeQuery>;
const mockUseAddConversation = useAddConversation as jest.MockedFunction<typeof useAddConversation>;

describe('AddConversationToQueueDialog', () => {
  const mockConversations: ConversationListItemResponse[] = [
  {
    conversationId: 'conv-1',
    name: 'Conversation 1',
    traceIds: ['trace-1', 'trace-2'],
    traceCount: 2
  },
  {
    conversationId: 'conv-2',
    name: 'Conversation 2',
    traceIds: ['trace-3'],
    traceCount: 1
  }];


  const mockQueues = [
  {
    id: 'queue-1',
    name: 'Queue 1',
    description: 'Description 1',
    type: AnnotationQueueType.CONVERSATIONS
  },
  {
    id: 'queue-2',
    name: 'Queue 2',
    description: 'Description 2',
    type: AnnotationQueueType.CONVERSATIONS
  }];


  const defaultQueuesQueryReturn = {
    data: mockQueues,
    isLoading: false
  };

  const defaultAddMutation = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockErrorState = null;
    mockErrorObject.message = null;
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue(defaultQueuesQueryReturn as any);
    mockUseAddConversation.mockReturnValue(defaultAddMutation as any);
  });

  it('should render trigger button when no trigger prop provided', () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('should render custom trigger when provided', () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1"
        trigger={<button>Custom Trigger</button>} />

    );

    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('should open dialog when trigger is clicked', async () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );
    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    await waitFor(() => {
      expect(screen.getByText(/Select an annotation queue/i)).toBeInTheDocument();
    });
  });

  it('should display conversation count in description', async () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1', 'conv-2'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );
    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    await waitFor(() => {
      expect(screen.getByText(/2 conversations/i)).toBeInTheDocument();
    });
  });

  it('should display singular conversation in description', async () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );
    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    await waitFor(() => {
      expect(screen.getByText(/1 conversation/i)).toBeInTheDocument();
    });
  });

  it('should display annotation queues', async () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );
    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Queue 1')).toBeInTheDocument();
      expect(screen.getByText('Queue 2')).toBeInTheDocument();
    });
  });

  it('should show loading state when queues are loading', () => {
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({
      ...defaultQueuesQueryReturn,
      isLoading: true
    } as any);

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );
    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    expect(screen.getByText('Loading annotation queues...')).toBeInTheDocument();
  });

  it('should show empty state when no queues found', () => {
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({
      data: [],
      isLoading: false
    } as any);

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );
    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    expect(screen.getByText(/No conversation annotation queues found/i)).toBeInTheDocument();
  });

  it('should select queue when clicked', () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );
    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    const queue1 = screen.getByText('Queue 1');
    fireEvent.click(queue1.closest('div')!);


    const addButton = screen.getByText('Add to Queue');
    expect(addButton).not.toBeDisabled();
  });

  it('should call addConversationMutation when Add to Queue is clicked', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const mockOnSuccess = jest.fn();
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1"
        onSuccess={mockOnSuccess} />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const queue1 = screen.getByText('Queue 1');
      fireEvent.click(queue1.closest('div')!);
    });


    const addButton = screen.getByText('Add to Queue');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        queueId: 'queue-1',
        decodeTraceIds: false,
        data: {
          conversationConfigId: 'config-1',
          datasourceId: 'ds-1',
          otelConversationId: 'conv-1',
          otelTraceIds: ['trace-1', 'trace-2'],
          startDate: undefined,
          endDate: undefined
        }
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle multiple conversations', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1', 'conv-2'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    const queue1 = screen.getByText('Queue 1');
    fireEvent.click(queue1.closest('div')!);


    const addButton = screen.getByText('Add to Queue');
    fireEvent.click(addButton);

    await waitFor(() => {

      expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    });
  });

  it('should show loading state when adding', async () => {
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      isPending: true
    } as any);

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const queue1 = screen.getByText('Queue 1');
      fireEvent.click(queue1.closest('div')!);
    });

    expect(screen.getByText('Adding...')).toBeInTheDocument();
  });

  it('should disable Add button when no queue is selected', async () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const addButton = screen.getByText('Add to Queue');
      expect(addButton).toBeDisabled();
    });
  });

  it('should disable buttons when adding', async () => {
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      isPending: true
    } as any);

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });
  });

  it('should display error message', async () => {
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('Failed to add'));
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container, rerender } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const queue1 = screen.getByText('Queue 1');
      fireEvent.click(queue1.closest('div')!);
    });


    const addButton = screen.getByText('Add to Queue');
    fireEvent.click(addButton);


    await waitFor(() => {
      expect(mockErrorState).toBe('Failed to add');
    }, { timeout: 3000 });


    rerender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );


    await waitFor(() => {
      expect(screen.getByText(/Failed to add/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    consoleErrorSpy.mockRestore();
  });

  it('should call onSuccess callback after successful add', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const mockOnSuccess = jest.fn();
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1"
        onSuccess={mockOnSuccess} />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const queue1 = screen.getByText('Queue 1');
      fireEvent.click(queue1.closest('div')!);
    });


    const addButton = screen.getByText('Add to Queue');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });


  it('should handle empty selectedConversations', async () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set()}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      expect(screen.getByText(/0 conversations/i)).toBeInTheDocument();
    });
  });

  it('should handle empty conversations array', () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={[]}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('should handle conversation without traceIds', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const conversationWithoutTraces: ConversationListItemResponse[] = [
    {
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: [],
      traceCount: 0
    }];


    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={conversationWithoutTraces}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const queue1 = screen.getByText('Queue 1');
      fireEvent.click(queue1.closest('div')!);
    });


    const addButton = screen.getByText('Add to Queue');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        queueId: 'queue-1',
        decodeTraceIds: false,
        data: {
          conversationConfigId: 'config-1',
          datasourceId: 'ds-1',
          otelConversationId: 'conv-1',
          otelTraceIds: [],
          startDate: undefined,
          endDate: undefined
        }
      });
    });
  });

  it('should handle conversation with empty traceIds array', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const conversationWithEmptyTraces: ConversationListItemResponse[] = [
    {
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: [],
      traceCount: 0
    }];


    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={conversationWithEmptyTraces}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const queue1 = screen.getByText('Queue 1');
      fireEvent.click(queue1.closest('div')!);
    });


    const addButton = screen.getByText('Add to Queue');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        queueId: 'queue-1',
        decodeTraceIds: false,
        data: {
          conversationConfigId: 'config-1',
          datasourceId: 'ds-1',
          otelConversationId: 'conv-1',
          otelTraceIds: [],
          startDate: undefined,
          endDate: undefined
        }
      });
    });
  });

  it('should handle empty string projectId', () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId=""
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('should handle empty string datasourceId', () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId=""
        conversationConfigId="config-1" />

    );

    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('should handle empty string conversationConfigId', () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="" />

    );

    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('should handle missing onSuccess callback', () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1"
        onSuccess={undefined} />

    );

    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('should handle queue without description', async () => {
    const queuesWithoutDesc = [
    {
      id: 'queue-1',
      name: 'Queue 1',
      description: undefined,
      type: AnnotationQueueType.CONVERSATIONS
    }];


    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({
      data: queuesWithoutDesc,
      isLoading: false
    } as any);

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Queue 1')).toBeInTheDocument();
    });
  });

  it('should handle queue with null description', async () => {
    const queuesWithNullDesc = [
    {
      id: 'queue-1',
      name: 'Queue 1',
      description: null,
      type: AnnotationQueueType.CONVERSATIONS
    }];


    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({
      data: queuesWithNullDesc,
      isLoading: false
    } as any);

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    await waitFor(() => {
      expect(screen.getByText('Queue 1')).toBeInTheDocument();
    });
  });

  it('should handle very long queue name', async () => {
    const queuesWithLongName = [
    {
      id: 'queue-1',
      name: 'a'.repeat(500),
      description: 'Description',
      type: AnnotationQueueType.CONVERSATIONS
    }];


    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({
      data: queuesWithLongName,
      isLoading: false
    } as any);

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    await waitFor(() => {
      expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
    });
  });

  it('should handle very long queue description', async () => {
    const queuesWithLongDesc = [
    {
      id: 'queue-1',
      name: 'Queue 1',
      description: 'b'.repeat(1000),
      type: AnnotationQueueType.CONVERSATIONS
    }];


    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({
      data: queuesWithLongDesc,
      isLoading: false
    } as any);

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }

    await waitFor(() => {
      expect(screen.getByText('b'.repeat(1000))).toBeInTheDocument();
    });
  });

  it('should handle cancel button click', async () => {
    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const queue1 = screen.getByText('Queue 1');
      fireEvent.click(queue1.closest('div')!);
    });


    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);


    await waitFor(() => {
      expect(screen.queryByText(/Select an annotation queue/i)).not.toBeInTheDocument();
    });
  });

  it('should not add when no queue is selected', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      mutateAsync: mockMutateAsync
    } as any);

    customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );
    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    const addButton = screen.getByText('Add to Queue');
    expect(addButton).toBeDisabled();


    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('should not add when no conversations are selected', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set()}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const queue1 = screen.getByText('Queue 1');
      fireEvent.click(queue1.closest('div')!);
    });


    const addButton = screen.getByText('Add to Queue');
    fireEvent.click(addButton);


    await waitFor(() => {
      expect(mockMutateAsync).not.toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('should handle non-Error rejection', async () => {
    const mockMutateAsync = jest.fn().mockRejectedValue('String error');
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container, rerender } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set(['conv-1'])}
        conversations={mockConversations}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const queue1 = screen.getByText('Queue 1');
      fireEvent.click(queue1.closest('div')!);
    });


    const addButton = screen.getByText('Add to Queue');
    fireEvent.click(addButton);


    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    }, { timeout: 3000 });


    await waitFor(() => {
      expect(mockErrorObject.message).toBeTruthy();
    }, { timeout: 3000 });

    expect(mockErrorObject.message).toBe('String error');

    consoleErrorSpy.mockRestore();
  });

  it('should handle conversation with missing conversationId', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseAddConversation.mockReturnValue({
      ...defaultAddMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const conversationWithoutId: ConversationListItemResponse[] = [
    {
      conversationId: '',
      name: 'Conversation 1',
      traceIds: ['trace-1'],
      traceCount: 1
    }];


    const { container } = customRender(
      <AddConversationToQueueDialog
        selectedConversations={new Set([''])}
        conversations={conversationWithoutId}
        projectId="project-1"
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );

    const triggerButton = container.querySelector('button');
    if (triggerButton) {
      fireEvent.click(triggerButton);
    }


    await waitFor(() => {
      const queue1 = screen.getByText('Queue 1');
      fireEvent.click(queue1.closest('div')!);
    });


    const addButton = screen.getByText('Add to Queue');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        queueId: 'queue-1',
        decodeTraceIds: false,
        data: {
          conversationConfigId: 'config-1',
          datasourceId: 'ds-1',
          otelConversationId: '',
          otelTraceIds: ['trace-1'],
          startDate: undefined,
          endDate: undefined
        }
      });
    });
  });
});
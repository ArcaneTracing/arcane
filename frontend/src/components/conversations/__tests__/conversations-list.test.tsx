import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationsList } from '../conversations-list';
import { ConversationListItemResponse } from '@/types/conversations';
import { useParams, useNavigate, useLocation } from '@tanstack/react-router';
import { createTestQueryClient } from '@/__tests__/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';

jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(() => jest.fn()),
  useLocation: jest.fn(),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
const wrapper = ({ children }: {children: React.ReactNode;}) => {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('ConversationsList', () => {
  const mockNavigate = jest.fn();

  const mockConversations: ConversationListItemResponse[] = [
  {
    id: '1',
    conversationId: 'conv-1',
    name: 'Conversation 1',
    traceIds: ['trace-1', 'trace-2'],
    traceCount: 2
  } as Conversation,
  {
    id: '2',
    conversationId: 'conv-2',
    name: 'Conversation 2',
    traceIds: ['trace-3'],
    traceCount: 1
  } as Conversation];


  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ organisationId: 'org-1', projectId: 'project-1' } as any);
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({ pathname: '/projects/project-1/conversations' } as any);
  });

  it('should render loading state', () => {
    render(
      <ConversationsList
        conversations={[]}
        isLoading={true}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    const loader = screen.getByTestId('icon-loader2');
    expect(loader).toBeInTheDocument();
  });

  it('should render error state', () => {
    render(
      <ConversationsList
        conversations={[]}
        isLoading={false}
        error="Error loading conversations"
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText(/Error: Error loading conversations/i)).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(
      <ConversationsList
        conversations={[]}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText('No conversations found')).toBeInTheDocument();
  });

  it('should render conversations', () => {
    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
    expect(screen.getByText('Conversation 2')).toBeInTheDocument();
  });

  it('should handle conversation selection', () => {
    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();
  });

  it('should handle select all', () => {
    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it('should navigate when view button is clicked', () => {
    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);
    expect(mockNavigate).toHaveBeenCalled();
  });


  it('should handle conversations with missing name', () => {
    const conversationWithoutName: ConversationListItemResponse[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: undefined,
      traceIds: ['trace-1'],
      traceCount: 1
    }];


    render(
      <ConversationsList
        conversations={conversationWithoutName}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );

    expect(screen.getByText('conv-1')).toBeInTheDocument();
  });

  it('should handle conversations with empty string name', () => {
    const conversationWithEmptyName: ConversationListItemResponse[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: '',
      traceIds: ['trace-1'],
      traceCount: 1
    }];


    render(
      <ConversationsList
        conversations={conversationWithEmptyName}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );

    expect(screen.getByText('conv-1')).toBeInTheDocument();
  });

  it('should handle conversations with missing traceIds', () => {
    const conversationWithoutTraces: ConversationListItemResponse[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: undefined,
      traceCount: 0
    }];


    render(
      <ConversationsList
        conversations={conversationWithoutTraces}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText('No trace IDs')).toBeInTheDocument();
  });

  it('should handle conversations with empty traceIds array', () => {
    const conversationWithEmptyTraces: ConversationListItemResponse[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: [],
      traceCount: 0
    }];


    render(
      <ConversationsList
        conversations={conversationWithEmptyTraces}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText('No trace IDs')).toBeInTheDocument();
  });

  it('should handle conversations with missing traceCount', () => {
    const conversationWithoutTraceCount: Conversation[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: ['trace-1', 'trace-2'],
      traceCount: undefined
    }];


    render(
      <ConversationsList
        conversations={conversationWithoutTraceCount}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );

    expect(screen.getByText(/2 traces/i)).toBeInTheDocument();
  });

  it('should handle very long conversation names', () => {
    const longNameConversation: Conversation[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: 'a'.repeat(500),
      traceIds: ['trace-1'],
      traceCount: 1
    }];


    render(
      <ConversationsList
        conversations={longNameConversation}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle very long trace IDs', () => {
    const conversationWithLongTraceId: ConversationListItemResponse[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: ['a'.repeat(200)],
      traceCount: 1
    }];


    render(
      <ConversationsList
        conversations={conversationWithLongTraceId}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );

    const traceIdElements = screen.getAllByText(/a{40}/);

    expect(traceIdElements.length).toBeGreaterThan(0);

    expect(traceIdElements[0].textContent).toMatch(/\.\.\./);
  });

  it('should handle multiple trace IDs', () => {
    const conversationWithManyTraces: Conversation[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: Array.from({ length: 10 }, (_, i) => `trace-${i}`),
      traceCount: 10
    }];


    render(
      <ConversationsList
        conversations={conversationWithManyTraces}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText(/\+9 more/i)).toBeInTheDocument();
  });

  it('should handle singular trace count', () => {
    const conversationWithOneTrace: ConversationListItemResponse[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: ['trace-1'],
      traceCount: 1
    }];


    render(
      <ConversationsList
        conversations={conversationWithOneTrace}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText('1 trace')).toBeInTheDocument();
  });

  it('should handle plural trace count', () => {
    const conversationWithManyTraces: Conversation[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: ['trace-1', 'trace-2'],
      traceCount: 2
    }];


    render(
      <ConversationsList
        conversations={conversationWithManyTraces}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText('2 traces')).toBeInTheDocument();
  });

  it('should handle empty string datasourceId', () => {
    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId=""
        conversationConfigId="config-1" />,

      { wrapper }
    );

    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
  });

  it('should handle empty string conversationConfigId', () => {
    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="" />,

      { wrapper }
    );

    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
  });

  it('should handle startDate and endDate props', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1"
        startDate={startDate}
        endDate={endDate} />,

      { wrapper }
    );

    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
  });

  it('should include date params in navigation URL', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1"
        startDate={startDate}
        endDate={endDate} />,

      { wrapper }
    );

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.objectContaining({
          start: expect.stringContaining('2024-01-01')
        })
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.objectContaining({
          end: expect.stringContaining('2024-01-31')
        })
      })
    );
  });

  it('should calculate dates from lookback when startDate/endDate are missing', () => {
    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1"
        lookback="1h" />,

      { wrapper }
    );

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String)
        })
      })
    );
  });

  it('should prefer startDate/endDate over lookback when both are provided', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1"
        startDate={startDate}
        endDate={endDate}
        lookback="1h" />,

      { wrapper }
    );

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.objectContaining({
          start: expect.stringContaining('2024-01-01'),
          end: expect.stringContaining('2024-01-31')
        })
      })
    );
  });

  it('should handle missing projectId from useParams', () => {
    mockUseParams.mockReturnValue({ projectId: undefined } as any);

    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );

    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
  });

  it('should reset selection when conversations change', () => {
    const { rerender } = render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );


    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();


    rerender(
      <ConversationsList
        conversations={[{ ...mockConversations[0], id: '3' }]}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />

    );


    const newCheckboxes = screen.getAllByRole('checkbox');
    expect(newCheckboxes[1]).not.toBeChecked();
  });

  it('should handle deselect all', () => {
    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );

    const checkboxes = screen.getAllByRole('checkbox');

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).toBeChecked();


    fireEvent.click(checkboxes[0]);
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('should show selection count when conversations are selected', () => {
    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    expect(screen.getByText(/1 conversation selected/i)).toBeInTheDocument();
  });

  it('should show plural selection count', () => {
    render(
      <ConversationsList
        conversations={mockConversations}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(screen.getByText(/2 conversations selected/i)).toBeInTheDocument();
  });

  it('should handle conversation without id', () => {
    const conversationWithoutId: Conversation[] = [
    {
      id: '',
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: ['trace-1'],
      traceCount: 1
    }];


    render(
      <ConversationsList
        conversations={conversationWithoutId}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );

    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
  });

  it('should handle very long error message', () => {
    const longError = 'a'.repeat(1000);
    render(
      <ConversationsList
        conversations={[]}
        isLoading={false}
        error={longError}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText(new RegExp(longError.substring(0, 100)))).toBeInTheDocument();
  });

  it('should handle special characters in error message', () => {
    const specialError = 'Error!@#$%^&*()_+-=[]{}|;:,.<>?';
    render(
      <ConversationsList
        conversations={[]}
        isLoading={false}
        error={specialError}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );
    expect(screen.getByText(new RegExp(specialError))).toBeInTheDocument();
  });

  it('should handle conversation with null name', () => {
    const conversationWithNullName: ConversationListItemResponse[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: null as any,
      traceIds: ['trace-1'],
      traceCount: 1
    }];


    render(
      <ConversationsList
        conversations={conversationWithNullName}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );

    expect(screen.getByText('conv-1')).toBeInTheDocument();
  });

  it('should handle single trace ID display', () => {
    const conversationWithOneTrace: ConversationListItemResponse[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      name: 'Conversation 1',
      traceIds: ['trace-1'],
      traceCount: 1
    }];


    render(
      <ConversationsList
        conversations={conversationWithOneTrace}
        isLoading={false}
        error={null}
        datasourceId="ds-1"
        conversationConfigId="config-1" />,

      { wrapper }
    );


    const traceIdElements = screen.getAllByText('trace-1');
    expect(traceIdElements.length).toBeGreaterThan(0);

    const visibleElement = traceIdElements.find((el) => {
      const cell = el.closest('td');
      return cell !== null;
    });
    expect(visibleElement).toBeTruthy();
  });

  it('should handle checkbox click event propagation', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <ConversationsList
          conversations={mockConversations}
          isLoading={false}
          error={null}
          datasourceId="ds-1"
          conversationConfigId="config-1" />
        ,
      </div>,
      { wrapper }
    );

    const checkboxes = screen.getAllByRole('checkbox');

    fireEvent.click(checkboxes[1]);
    expect(checkboxes[1]).toBeChecked();
  });
});
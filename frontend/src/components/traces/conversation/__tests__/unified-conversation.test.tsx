import React from 'react'
import { render, screen } from '@testing-library/react'
import { UnifiedConversation } from '../unified-conversation'

const mockUseEntitiesQuery = jest.fn(() => ({ data: [], isLoading: false }))

jest.mock('@/hooks/entities/use-entities-query', () => ({
  useEntitiesQuery: () => mockUseEntitiesQuery(),
}))

jest.mock('../conversation-messages', () => ({
  ConversationMessages: ({
    messages,
    emptyMessage,
  }: {
    messages: unknown[]
    emptyMessage: { title: string; description: string }
  }) => (
    <div data-testid="conversation-messages">
      {messages.length === 0 ? (
        <div data-testid="empty">
          <span>{emptyMessage.title}</span>
          <span>{emptyMessage.description}</span>
        </div>
      ) : (
        <div data-testid="messages">{messages.length} messages</div>
      )}
    </div>
  ),
}))

describe('UnifiedConversation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseEntitiesQuery.mockReturnValue({ data: [], isLoading: false })
  })

  it('renders empty message when no trace', () => {
    render(<UnifiedConversation trace={null} />)
    expect(screen.getByText('No messages found in this trace')).toBeInTheDocument()
    expect(
      screen.getByText('Make sure entities with message matching are configured')
    ).toBeInTheDocument()
  })

  it('renders empty message when trace undefined', () => {
    render(<UnifiedConversation trace={undefined} />)
    expect(screen.getByText('No messages found in this trace')).toBeInTheDocument()
  })

  it('renders empty message when no entities', () => {
    render(<UnifiedConversation trace={{ traceID: 't1', batches: [] }} />)
    expect(screen.getByText('No messages found in this trace')).toBeInTheDocument()
  })

  it('extracts and displays messages when entities have canonical matching', () => {
    mockUseEntitiesQuery.mockReturnValue({
      data: [
        {
          id: 'e1',
          messageMatching: {
            type: 'CANONICAL',
            canonicalMessageMatchingConfiguration: {},
          },
        },
      ],
      isLoading: false,
    })

    render(<UnifiedConversation trace={{ traceID: 't1', batches: [] }} />)
    expect(screen.getByTestId('conversation-messages')).toBeInTheDocument()
  })

  it('extracts and displays messages when entities have flat matching', () => {
    mockUseEntitiesQuery.mockReturnValue({
      data: [
        {
          id: 'e1',
          messageMatching: {
            type: 'FLAT',
            flatMessageMatchingConfiguration: {},
          },
        },
      ],
      isLoading: false,
    })

    render(<UnifiedConversation trace={{ traceID: 't1', batches: [] }} />)
    expect(screen.getByTestId('conversation-messages')).toBeInTheDocument()
  })
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ConversationMessages } from '../conversation-messages'
import { MessageType } from '@/types'
import type { ExtractedMessage } from '@/lib/message-matching/shared'

const createMessage = (overrides?: Partial<ExtractedMessage>): ExtractedMessage => ({
  type: MessageType.USER,
  content: 'Hello',
  timestamp: 1700000000000,
  spanId: 'span-1',
  ...overrides,
})

describe('ConversationMessages', () => {
  it('shows empty state when no messages', () => {
    render(<ConversationMessages messages={[]} />)
    expect(screen.getByText('No messages found')).toBeInTheDocument()
  })

  it('shows custom empty message when provided', () => {
    render(
      <ConversationMessages
        messages={[]}
        emptyMessage={{ title: 'No chat yet', description: 'Start a conversation' }}
      />
    )
    expect(screen.getByText('No chat yet')).toBeInTheDocument()
    expect(screen.getByText('Start a conversation')).toBeInTheDocument()
  })

  it('shows empty title only when no description', () => {
    render(<ConversationMessages messages={[]} emptyMessage={{ title: 'Custom title' }} />)
    expect(screen.getByText('Custom title')).toBeInTheDocument()
  })

  it('renders user message with content', () => {
    const messages = [createMessage({ type: MessageType.USER, content: 'User says hi' })]
    render(<ConversationMessages messages={messages} />)
    expect(screen.getByText('User says hi')).toBeInTheDocument()
  })

  it('renders assistant message with AI Assistant label', () => {
    const messages = [
      createMessage({ type: MessageType.ASSISTANT, content: 'Assistant reply', spanId: 'span-2' }),
    ]
    render(<ConversationMessages messages={messages} />)
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('Assistant reply')).toBeInTheDocument()
  })

  it('renders system message as full-width banner', () => {
    const messages = [
      createMessage({ type: MessageType.SYSTEM, content: 'System prompt', spanId: 'span-3' }),
    ]
    render(<ConversationMessages messages={messages} />)
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.getByText('System prompt')).toBeInTheDocument()
  })

  it('renders tool message with Tool label', () => {
    const messages = [
      createMessage({ type: MessageType.TOOL, content: 'Tool result', spanId: 'span-4' }),
    ]
    render(<ConversationMessages messages={messages} />)
    expect(screen.getByText('Tool')).toBeInTheDocument()
    expect(screen.getByText('Tool result')).toBeInTheDocument()
  })

  it('shows metadata section when message has name', () => {
    const messages = [
      createMessage({
        type: MessageType.ASSISTANT,
        content: 'Reply',
        name: 'gpt-4',
        spanId: 'span-5',
      }),
    ]
    render(<ConversationMessages messages={messages} />)
    expect(screen.getByText('Name:')).toBeInTheDocument()
    expect(screen.getByText('gpt-4')).toBeInTheDocument()
  })

  it('shows tool call metadata when present', () => {
    const messages = [
      createMessage({
        type: MessageType.ASSISTANT,
        content: 'Call',
        tool_call_id: 'call-123',
        tool_call_function_name: 'get_weather',
        tool_call_function_arguments: { city: 'London' },
        spanId: 'span-6',
      }),
    ]
    render(<ConversationMessages messages={messages} />)
    expect(screen.getByText('Function:')).toBeInTheDocument()
    expect(screen.getByText('get_weather')).toBeInTheDocument()
    expect(screen.getByText('Call ID:')).toBeInTheDocument()
    expect(screen.getByText('call-123')).toBeInTheDocument()
    expect(screen.getByText('Arguments:')).toBeInTheDocument()
    expect(screen.getByText(/"city": "London"/)).toBeInTheDocument()
  })

  it('renders multiple messages in order', () => {
    const messages = [
      createMessage({ type: MessageType.USER, content: 'First', spanId: 's1' }),
      createMessage({ type: MessageType.ASSISTANT, content: 'Second', spanId: 's2' }),
    ]
    render(<ConversationMessages messages={messages} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})

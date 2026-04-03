import React from 'react'
import { render, screen } from '@testing-library/react'
import { SpanConversationTab } from '../span-conversation-tab'

describe('SpanConversationTab', () => {
  it('shows select span message when no span', () => {
    render(<SpanConversationTab selectedSpan={null} />)
    expect(screen.getByText('Select a span to view conversation')).toBeInTheDocument()
  })

  it('shows not model span message when span has no matchedEntity', () => {
    const span = {
      spanId: 's1',
      name: 'op',
      matchedEntity: null,
    }
    render(<SpanConversationTab selectedSpan={span as any} />)
    expect(screen.getByText('This span is not a model span')).toBeInTheDocument()
  })

  it('shows not model span when matchedEntity has no message matching', () => {
    const span = {
      spanId: 's1',
      name: 'op',
      matchedEntity: { messageMatching: null },
    }
    render(<SpanConversationTab selectedSpan={span as any} />)
    expect(screen.getByText('This span is not a model span')).toBeInTheDocument()
  })
})

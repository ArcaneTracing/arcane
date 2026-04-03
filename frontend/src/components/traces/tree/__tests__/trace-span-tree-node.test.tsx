import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpanTreeNode } from '../trace-span-tree-node'
import type { NormalizedSpan } from '@/types/traces'

const createSpan = (overrides?: Partial<NormalizedSpan>): NormalizedSpan => ({
  spanId: 's1',
  parentSpanId: null,
  name: 'test-span',
  startTime: 1000000,
  endTime: 2000000,
  duration: 1,
  attributes: [],
  events: [],
  resource: {},
  ...overrides,
})

describe('SpanTreeNode', () => {
  const onSelect = jest.fn()
  const onToggleExpand = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders span name and duration', () => {
    const span = createSpan({ name: 'my-op', duration: 150 })
    render(
      <SpanTreeNode
        span={span}
        onSelect={onSelect}
        expandedNodes={new Set()}
        onToggleExpand={onToggleExpand}
      />
    )
    expect(screen.getByText('my-op')).toBeInTheDocument()
  })

  it('calls onSelect when row clicked', async () => {
    const user = userEvent.setup()
    const span = createSpan()
    render(
      <SpanTreeNode
        span={span}
        onSelect={onSelect}
        expandedNodes={new Set()}
        onToggleExpand={onToggleExpand}
      />
    )
    await user.click(screen.getByText('test-span'))
    expect(onSelect).toHaveBeenCalledWith(span)
  })

  it('shows expand button when span has children', () => {
    const span = createSpan({
      children: [createSpan({ spanId: 's2', name: 'child' })],
    })
    render(
      <SpanTreeNode
        span={span}
        onSelect={onSelect}
        expandedNodes={new Set()}
        onToggleExpand={onToggleExpand}
      />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
    const expandBtn = screen.getByRole('button', { name: /expand/i })
    expect(expandBtn).toBeInTheDocument()
  })

  it('calls onToggleExpand when expand button clicked', async () => {
    const user = userEvent.setup()
    const span = createSpan({
      children: [createSpan({ spanId: 's2', name: 'child' })],
    })
    render(
      <SpanTreeNode
        span={span}
        onSelect={onSelect}
        expandedNodes={new Set()}
        onToggleExpand={onToggleExpand}
      />
    )
    await user.click(screen.getByRole('button', { name: /expand/i }))
    expect(onToggleExpand).toHaveBeenCalledWith('s1')
  })

  it('renders children when expanded', () => {
    const span = createSpan({
      children: [createSpan({ spanId: 's2', name: 'child-span' })],
    })
    render(
      <SpanTreeNode
        span={span}
        onSelect={onSelect}
        expandedNodes={new Set(['s1'])}
        onToggleExpand={onToggleExpand}
      />
    )
    expect(screen.getByText('child-span')).toBeInTheDocument()
  })

  it('shows ChevronDown when expanded', () => {
    const span = createSpan({
      children: [createSpan({ spanId: 's2', name: 'child' })],
    })
    render(
      <SpanTreeNode
        span={span}
        onSelect={onSelect}
        expandedNodes={new Set(['s1'])}
        onToggleExpand={onToggleExpand}
      />
    )
    expect(screen.getByText('child')).toBeInTheDocument()
  })
})

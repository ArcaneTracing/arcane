import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { TraceGraph } from '../trace-graph'

jest.mock('@xyflow/react', () => ({
  ReactFlow: ({ nodes, edges }: { nodes: unknown[]; edges: unknown[] }) => (
    <div data-testid="react-flow">
      {nodes.length} nodes, {edges.length} edges
    </div>
  ),
  Controls: () => null,
  Background: () => null,
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useNodesState: (initial: unknown[]) => [initial, jest.fn(), jest.fn()],
  useEdgesState: (initial: unknown[]) => [initial, jest.fn(), jest.fn()],
}))

jest.mock('@/hooks/entities/use-entities-query', () => ({
  useEntitiesQuery: jest.fn(() => ({ data: [], isLoading: false })),
}))

jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({ resolvedTheme: 'light' })),
}))

jest.mock('@/lib/trace-utils', () => ({
  createTraceNodes: jest.fn(() => ({ nodes: [], edges: [] })),
  extractTraceId: jest.fn((trace: unknown) => {
    if (trace && typeof trace === 'object' && 'traceID' in trace) return (trace as { traceID: string }).traceID
    return 'default'
  }),
}))

describe('TraceGraph', () => {
  it('renders with null trace', () => {
    render(<TraceGraph trace={null} />)
    expect(screen.getByText('Loading graph...')).toBeInTheDocument()
  })

  it('renders with empty trace', () => {
    render(<TraceGraph trace={{ traceID: 't1', batches: [] }} />)
    expect(screen.getByText('Loading graph...')).toBeInTheDocument()
  })

  it('renders with undefined trace', () => {
    render(<TraceGraph trace={undefined} />)
    expect(screen.getByText('Loading graph...')).toBeInTheDocument()
  })

  it('renders ReactFlow when container has dimensions', async () => {
    const rect = {
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => rect)

    render(<TraceGraph trace={{ traceID: 't1', batches: [] }} />)

    await waitFor(() => {
      expect(screen.getByTestId('react-flow')).toBeInTheDocument()
    }, { timeout: 300 })

    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect
  })
})

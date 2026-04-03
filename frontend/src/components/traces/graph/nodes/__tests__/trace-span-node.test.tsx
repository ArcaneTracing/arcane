import React from 'react'
import { render, screen } from '@testing-library/react'
import TraceSpanNode from '../trace-span-node'
import { EntityType } from '@/types/enums'

jest.mock('@xyflow/react', () => ({
  Handle: ({ type }: { type: string }) => <div data-testid={`handle-${type}`}>{type}</div>,
  Position: { Left: 'left', Right: 'right' },
}))

jest.mock('@/components/entities/forms/icon-picker', () => ({
  getIconColor: jest.fn(() => 'text-blue-600'),
}))

describe('TraceSpanNode', () => {
  const baseData = {
    spanName: 'test-span',
    serviceName: 'test-service',
    duration: 1500,
    startTime: 1000000,
    tags: [],
    logs: [],
  }

  it('renders span name and service', () => {
    render(
      <TraceSpanNode
        id="span-1"
        data={baseData}
        isConnectable={true}
      />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
    expect(screen.getByText('test-service')).toBeInTheDocument()
  })

  it('renders duration in ms', () => {
    render(
      <TraceSpanNode
        id="span-1"
        data={baseData}
        isConnectable={true}
      />
    )
    expect(screen.getByText('1.50ms')).toBeInTheDocument()
  })

  it('renders without matched entity (no entity border/icon)', () => {
    const { container } = render(
      <TraceSpanNode
        id="span-1"
        data={baseData}
        isConnectable={true}
      />
    )
    expect(container.querySelector('.border-gray-200')).toBeInTheDocument()
  })

  const minimalEntity = (entityType: EntityType, iconId?: string) => ({
    id: 'e1',
    name: 'Entity',
    type: 'entity',
    matchingAttributeName: 'attr',
    matchingPatternType: 'value' as const,
    messageMatching: null,
    entityType,
    iconId,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  it('renders with MODEL matched entity', () => {
    render(
      <TraceSpanNode
        id="span-1"
        data={{
          ...baseData,
          matchedEntity: minimalEntity(EntityType.MODEL),
        }}
        isConnectable={true}
      />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
  })

  it('renders with TOOL matched entity', () => {
    render(
      <TraceSpanNode
        id="span-1"
        data={{
          ...baseData,
          matchedEntity: minimalEntity(EntityType.TOOL),
        }}
        isConnectable={true}
      />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
  })

  it('renders with CUSTOM matched entity and iconId', () => {
    render(
      <TraceSpanNode
        id="span-1"
        data={{
          ...baseData,
          matchedEntity: minimalEntity(EntityType.CUSTOM, 'custom-icon'),
        }}
        isConnectable={true}
      />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
  })

  it('renders with matchedEntity but no entityType (fallback)', () => {
    render(
      <TraceSpanNode
        id="span-1"
        data={{
          ...baseData,
          matchedEntity: { ...minimalEntity(EntityType.MODEL), entityType: undefined as any },
        }}
        isConnectable={true}
      />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
  })

  it('renders handles for ReactFlow', () => {
    render(
      <TraceSpanNode
        id="span-1"
        data={baseData}
        isConnectable={true}
      />
    )
    expect(screen.getByTestId('handle-target')).toBeInTheDocument()
    expect(screen.getByTestId('handle-source')).toBeInTheDocument()
  })
})

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpanPreviewTab } from '../span-preview-tab'
import type { NormalizedSpan } from '@/types/traces'
import { HighlightValueType } from '@/types/enums'

const mockOnCopy = jest.fn().mockResolvedValue(undefined)

const createMockSpan = (overrides?: Partial<NormalizedSpan>): NormalizedSpan => ({
  spanId: 'span-1',
  parentSpanId: null,
  name: 'test-span',
  startTime: 1000000,
  endTime: 2000000,
  duration: 1,
  attributes: [
    { key: 'http.method', value: 'GET' },
    { key: 'http.url', value: '/api/test' },
  ],
  events: [],
  resource: {},
  ...overrides,
})

describe('SpanPreviewTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows message when selectedSpan is null', () => {
    render(
      <SpanPreviewTab selectedSpan={null} onCopy={mockOnCopy} />
    )
    expect(screen.getByText(/Select a span from the left panel to view details/)).toBeInTheDocument()
  })

  it('renders span name and duration when span is selected', () => {
    const span = createMockSpan()
    render(
      <SpanPreviewTab selectedSpan={span} onCopy={mockOnCopy} />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
    expect(screen.getByText(/Duration:/)).toBeInTheDocument()
    expect(screen.getByText(/Start:/)).toBeInTheDocument()
    expect(screen.getByText(/End:/)).toBeInTheDocument()
  })

  it('renders SpanAttributesTable when span has attributes', () => {
    const span = createMockSpan()
    render(
      <SpanPreviewTab selectedSpan={span} onCopy={mockOnCopy} />
    )
    expect(screen.getByText('Attributes')).toBeInTheDocument()
    expect(screen.getByText('http.method')).toBeInTheDocument()
    expect(screen.getByText('GET')).toBeInTheDocument()
  })

  it('does not render attributes table when span has no attributes', () => {
    const span = createMockSpan({ attributes: [] })
    render(
      <SpanPreviewTab selectedSpan={span} onCopy={mockOnCopy} />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
    expect(screen.queryByText('Attributes')).not.toBeInTheDocument()
  })

  it('renders entity highlights when span has matchedEntity', () => {
    const span = createMockSpan({
      attributes: [{ key: 'model', value: 'gpt-4' }],
      matchedEntity: {
        id: 'e1',
        name: 'Entity',
        entityHighlights: [
          { key: 'model', title: 'Model', valueType: HighlightValueType.STRING },
        ],
        messageMatching: null,
        createdAt: new Date(),
      } as NormalizedSpan['matchedEntity'],
    })
    render(
      <SpanPreviewTab selectedSpan={span} onCopy={mockOnCopy} />
    )
    expect(screen.getByText(/Model:/)).toBeInTheDocument()
    expect(screen.getByText('Model: gpt-4')).toBeInTheDocument()
  })

  it('formats NUMBER highlight value type', () => {
    const span = createMockSpan({
      attributes: [{ key: 'tokens', value: 150 }],
      matchedEntity: {
        id: 'e1',
        name: 'Entity',
        entityHighlights: [
          { key: 'tokens', title: 'Tokens', valueType: HighlightValueType.NUMBER },
        ],
        messageMatching: null,
        createdAt: new Date(),
      } as NormalizedSpan['matchedEntity'],
    })
    render(
      <SpanPreviewTab selectedSpan={span} onCopy={mockOnCopy} />
    )
    expect(screen.getByText(/Tokens:/)).toBeInTheDocument()
    expect(screen.getByText('Tokens: 150')).toBeInTheDocument()
  })

  it('formats BOOLEAN highlight value type', () => {
    const span = createMockSpan({
      attributes: [{ key: 'streaming', value: true }],
      matchedEntity: {
        id: 'e1',
        name: 'Entity',
        entityHighlights: [
          { key: 'streaming', title: 'Streaming', valueType: HighlightValueType.BOOLEAN },
        ],
        messageMatching: null,
        createdAt: new Date(),
      } as NormalizedSpan['matchedEntity'],
    })
    render(
      <SpanPreviewTab selectedSpan={span} onCopy={mockOnCopy} />
    )
    expect(screen.getByText(/Streaming:/)).toBeInTheDocument()
    expect(screen.getByText('Streaming: true')).toBeInTheDocument()
  })

  it('formats OBJECT highlight value type as JSON', () => {
    const span = createMockSpan({
      attributes: [{ key: 'config', value: { temperature: 0.7 } }],
      matchedEntity: {
        id: 'e1',
        name: 'Entity',
        entityHighlights: [
          { key: 'config', title: 'Config', valueType: HighlightValueType.OBJECT },
        ],
        messageMatching: null,
        createdAt: new Date(),
      } as NormalizedSpan['matchedEntity'],
    })
    render(
      <SpanPreviewTab selectedSpan={span} onCopy={mockOnCopy} />
    )
    expect(screen.getByText(/Config:/)).toBeInTheDocument()
    expect(screen.getByText(/"temperature":0.7/)).toBeInTheDocument()
  })

  it('renders in dataset mode with datasetColumns and onMapToColumn', () => {
    const onMapToColumn = jest.fn()
    const span = createMockSpan()
    render(
      <SpanPreviewTab
        selectedSpan={span}
        onCopy={mockOnCopy}
        datasetMode={true}
        datasetColumns={['col1']}
        onMapToColumn={onMapToColumn}
      />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
    expect(screen.getByText('Attributes')).toBeInTheDocument()
  })

  it('does not render entity highlights when no matching attribute', () => {
    const span = createMockSpan({
      attributes: [{ key: 'other', value: 'x' }],
      matchedEntity: {
        id: 'e1',
        name: 'Entity',
        entityHighlights: [
          { key: 'missing', title: 'Missing', valueType: HighlightValueType.STRING },
        ],
        messageMatching: null,
        createdAt: new Date(),
      } as NormalizedSpan['matchedEntity'],
    })
    render(
      <SpanPreviewTab selectedSpan={span} onCopy={mockOnCopy} />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
    expect(screen.queryByText(/Missing:/)).not.toBeInTheDocument()
  })

  it('calls onMapToColumn when Add Span to Column clicked in dataset mode', async () => {
    const onMapToColumn = jest.fn()
    const span = createMockSpan()
    render(
      <SpanPreviewTab
        selectedSpan={span}
        onCopy={mockOnCopy}
        datasetMode={true}
        datasetColumns={['col1']}
        onMapToColumn={onMapToColumn}
      />
    )
    const spanName = screen.getByText('test-span')
    fireEvent.contextMenu(spanName)
    const addSpanTrigger = await screen.findByRole('menuitem', { name: /add span to column/i })
    await userEvent.click(addSpanTrigger)
    const col1Item = await screen.findByRole('menuitem', { name: 'col1' })
    await userEvent.click(col1Item)
    expect(onMapToColumn).toHaveBeenCalledWith('col1', expect.stringContaining('spanId'), 'add')
  })

  it('calls onMapToColumn when Map Span to Column clicked in dataset mode', async () => {
    const onMapToColumn = jest.fn()
    const span = createMockSpan()
    render(
      <SpanPreviewTab
        selectedSpan={span}
        onCopy={mockOnCopy}
        datasetMode={true}
        datasetColumns={['colA']}
        onMapToColumn={onMapToColumn}
      />
    )
    const spanName = screen.getByText('test-span')
    fireEvent.contextMenu(spanName)
    const mapSpanTrigger = await screen.findByRole('menuitem', { name: /map span to column/i })
    await userEvent.click(mapSpanTrigger)
    const colAItem = await screen.findByRole('menuitem', { name: 'colA' })
    await userEvent.click(colAItem)
    expect(onMapToColumn).toHaveBeenCalledWith('colA', expect.stringContaining('spanId'), 'map')
  })
})

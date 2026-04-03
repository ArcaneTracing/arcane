import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TraceViewer } from '../trace-viewer'

jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(() => ({ projectId: 'p1', datasourceId: 'ds1' })),
}))

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationId: jest.fn(() => 'org-1'),
}))

jest.mock('@/hooks/entities/use-entities-query', () => ({
  useEntitiesQuery: jest.fn(() => ({ data: [], isLoading: false })),
}))

const mockSpans = [
  {
    spanId: 's1',
    parentSpanId: null,
    name: 'op',
    startTime: 0,
    endTime: 10,
    duration: 10,
    attributes: [],
    events: [],
    resource: {},
  },
]
const mockSpanTree = [...mockSpans]
const mockTraceMetrics = { spanCount: 1, totalDuration: 10 }

jest.mock('@/hooks/traces/use-trace-spans', () => ({
  useTraceSpans: jest.fn(() => ({
    spans: mockSpans,
    spanTree: mockSpanTree,
    traceMetrics: mockTraceMetrics,
  })),
}))

jest.mock('@/hooks/traces/use-trace-viewer-state', () => ({
  useTraceViewerState: jest.fn(() => ({
    selectedSpan: mockSpans[0],
    expandedNodes: new Set(['s1']),
    activeTab: 'preview',
    isModelSpan: false,
    handleSpanSelect: jest.fn(),
    toggleExpand: jest.fn(),
    setActiveTab: jest.fn(),
  })),
}))

jest.mock('@/hooks/traces/use-dataset-mode-state', () => ({
  useDatasetModeState: jest.fn(() => ({
    datasetMode: false,
    selectedDatasetId: null,
    columnMappings: [],
    datasetColumns: [],
    isMappingDrawerOpen: false,
    mappedColumnsSet: new Set(),
    setDatasetMode: jest.fn(),
    setSelectedDatasetId: jest.fn(),
    setIsMappingDrawerOpen: jest.fn(),
    handleMapToColumn: jest.fn(),
    handleRemoveMapping: jest.fn(),
    handleAddToDataset: jest.fn(),
  })),
}))

jest.mock('@/hooks/traces/use-trace-viewer-permissions', () => ({
  useTraceViewerPermissions: jest.fn(() => ({
    effectiveShowAddToAnnotationQueue: true,
    effectiveShowAddToDataset: true,
  })),
}))

jest.mock('../trace-tree-panel', () => ({
  TraceTreePanel: () => <div data-testid="trace-tree-panel">Trace Tree</div>,
}))
jest.mock('../trace-metadata-bar', () => ({
  TraceMetadataBar: () => <div data-testid="trace-metadata-bar">Metadata</div>,
}))
jest.mock('../span-preview-tab', () => ({
  SpanPreviewTab: () => <div data-testid="span-preview-tab">Preview</div>,
}))
jest.mock('../span-json-tab', () => ({
  SpanJsonTab: () => <div data-testid="span-json-tab">JSON</div>,
}))
jest.mock('../span-conversation-tab', () => ({
  SpanConversationTab: () => <div data-testid="span-conversation-tab">Conversation</div>,
}))
jest.mock('../annotate-trace-drawer', () => ({
  AnnotateTraceDrawer: () => null,
}))
jest.mock('../dataset-mode-toggle', () => ({
  DatasetModeToggle: () => null,
}))
jest.mock('../dataset-selector', () => ({
  DatasetSelector: () => null,
}))
jest.mock('../dataset-mapping-drawer', () => ({
  DatasetMappingDrawer: () => null,
}))

describe('TraceViewer', () => {
  const mockTrace = { traceID: 't1', batches: [] }

  it('renders trace tree panel and metadata bar', () => {
    render(
      <TraceViewer trace={mockTrace} traceId="trace-1" />
    )
    expect(screen.getByTestId('trace-tree-panel')).toBeInTheDocument()
    expect(screen.getByTestId('trace-metadata-bar')).toBeInTheDocument()
  })

  it('renders Preview and JSON tabs', () => {
    render(
      <TraceViewer trace={mockTrace} traceId="trace-1" />
    )
    expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'JSON View' })).toBeInTheDocument()
  })

  it('does not show dataset mode when showAddToDataset is false', () => {
    const { useTraceViewerPermissions } = require('@/hooks/traces/use-trace-viewer-permissions')
    useTraceViewerPermissions.mockReturnValue({
      effectiveShowAddToAnnotationQueue: true,
      effectiveShowAddToDataset: false,
    })

    render(
      <TraceViewer trace={mockTrace} traceId="trace-1" showAddToDataset={false} />
    )
    expect(screen.getByTestId('trace-tree-panel')).toBeInTheDocument()
  })

  it('shows Conversation View tab when isModelSpan is true', () => {
    const { useTraceViewerState } = require('@/hooks/traces/use-trace-viewer-state')
    useTraceViewerState.mockReturnValue({
      selectedSpan: mockSpans[0],
      expandedNodes: new Set(['s1']),
      activeTab: 'preview',
      isModelSpan: true,
      handleSpanSelect: jest.fn(),
      toggleExpand: jest.fn(),
      setActiveTab: jest.fn(),
    })

    render(<TraceViewer trace={mockTrace} traceId="trace-1" />)
    expect(screen.getByRole('tab', { name: 'Conversation View' })).toBeInTheDocument()
  })

  it('switches to JSON tab when JSON View clicked', async () => {
    const user = userEvent.setup()
    const setActiveTab = jest.fn()
    const { useTraceViewerState } = require('@/hooks/traces/use-trace-viewer-state')
    useTraceViewerState.mockReturnValue({
      selectedSpan: mockSpans[0],
      expandedNodes: new Set(['s1']),
      activeTab: 'preview',
      isModelSpan: false,
      handleSpanSelect: jest.fn(),
      toggleExpand: jest.fn(),
      setActiveTab,
    })

    render(<TraceViewer trace={mockTrace} traceId="trace-1" />)
    await user.click(screen.getByRole('tab', { name: 'JSON View' }))
    expect(setActiveTab).toHaveBeenCalledWith('json')
  })
})

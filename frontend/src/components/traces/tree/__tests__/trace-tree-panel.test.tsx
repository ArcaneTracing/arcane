import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TraceTreePanel } from '../trace-tree-panel';
import type { NormalizedSpan } from '@/types/traces';
import { EntityType } from '@/types/enums';
import * as traceQueries from '@/lib/traces/queries';

jest.mock('../trace-span-tree-node', () => ({
  SpanTreeNode: ({ span }: {span: NormalizedSpan;}) =>
  <div data-testid="span-tree-node">{span.name}</div>

}));

jest.mock('../viewer-filters-bar', () => ({
  ViewerFiltersBar: ({
    searchQuery,
    onSearchChange,
    filters,
    onFilterChange

  }: {searchQuery: string;onSearchChange: (query: string) => void;filters: {serviceName: string;entityId: string;showOnlyEntitySpans: boolean;};onFilterChange: (filters: any) => void;}) =>
  <div data-testid="viewer-filters-bar">
      <input
      data-testid="search-input"
      placeholder="Search by name or ID..."
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)} />

      <button data-testid="filter-button" title="Filters">Filters</button>
      <button data-testid="download-button" title="No span selected">Download</button>
      <button data-testid="copy-button" title="No trace available">Copy</button>
    </div>

}));

jest.mock('@/lib/traces/queries');

const createMockSpan = (overrides?: Partial<NormalizedSpan>): NormalizedSpan => ({
  spanId: 'span-1',
  parentSpanId: null,
  name: 'test-span',
  startTime: 1000000,
  endTime: 2000000,
  duration: 1,
  attributes: [],
  events: [],
  resource: {},
  ...overrides
});

const mockGetServiceName = traceQueries.getServiceName as jest.MockedFunction<typeof traceQueries.getServiceName>;

describe('TraceTreePanel', () => {
  const onSpanSelect = jest.fn();
  const onToggleExpand = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServiceName.mockReturnValue('unknown');
  });

  it('renders ViewerFiltersBar component', () => {
    render(
      <TraceTreePanel
        spanTree={[]}
        onSpanSelect={onSpanSelect}
        expandedNodes={new Set()}
        onToggleExpand={onToggleExpand}
        trace={null} />

    );
    expect(screen.getByTestId('viewer-filters-bar')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('renders span tree nodes when spans provided', () => {
    const spans = [createMockSpan({ spanId: 's1', name: 'root-span' })];
    render(
      <TraceTreePanel
        spanTree={spans}
        onSpanSelect={onSpanSelect}
        expandedNodes={new Set()}
        onToggleExpand={onToggleExpand}
        trace={null} />

    );
    expect(screen.getByTestId('span-tree-node')).toBeInTheDocument();
    expect(screen.getByText('root-span')).toBeInTheDocument();
  });

  it('shows "No spans found" when search has no matches', async () => {
    const user = userEvent.setup();
    const spans = [createMockSpan({ spanId: 's1', name: 'root-span' })];
    render(
      <TraceTreePanel
        spanTree={spans}
        onSpanSelect={onSpanSelect}
        expandedNodes={new Set()}
        onToggleExpand={onToggleExpand}
        trace={null} />

    );
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'nonexistent');
    expect(screen.getByText(/No spans found matching/)).toBeInTheDocument();
  });

  it('renders download and copy buttons', () => {
    render(
      <TraceTreePanel
        spanTree={[]}
        onSpanSelect={onSpanSelect}
        expandedNodes={new Set()}
        onToggleExpand={onToggleExpand}
        trace={null} />

    );
    expect(screen.getByTestId('download-button')).toBeInTheDocument();
    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
  });
  it('filters spans by spanId when searching', async () => {
    const user = userEvent.setup();
    const spans = [
    createMockSpan({ spanId: 'span-abc', name: 'op1' }),
    createMockSpan({ spanId: 'span-xyz', name: 'op2' })];

    render(
      <TraceTreePanel
        spanTree={spans}
        onSpanSelect={onSpanSelect}
        expandedNodes={new Set()}
        onToggleExpand={onToggleExpand}
        trace={null} />

    );
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'abc');
    expect(screen.getByText('op1')).toBeInTheDocument();
    expect(screen.queryByText('op2')).not.toBeInTheDocument();
  });
  it('filters spans by name when searching', async () => {
    const user = userEvent.setup();
    const spans = [
    createMockSpan({ spanId: 's1', name: 'http-handler' }),
    createMockSpan({ spanId: 's2', name: 'db-query' })];

    render(
      <TraceTreePanel
        spanTree={spans}
        onSpanSelect={onSpanSelect}
        expandedNodes={new Set()}
        onToggleExpand={onToggleExpand}
        trace={null} />

    );
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'http');
    expect(screen.getByText('http-handler')).toBeInTheDocument();
    expect(screen.queryByText('db-query')).not.toBeInTheDocument();
  });

  it('includes parent when child matches search', async () => {
    const user = userEvent.setup();
    const parentSpan = createMockSpan({ spanId: 'parent', name: 'root-op' });
    const childSpan = createMockSpan({ spanId: 'child', name: 'nested-db-call', parentSpanId: 'parent' });
    parentSpan.children = [childSpan];

    render(
      <TraceTreePanel
        spanTree={[parentSpan]}
        onSpanSelect={onSpanSelect}
        expandedNodes={new Set(['parent'])}
        onToggleExpand={onToggleExpand}
        trace={null} />

    );
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'db');
    expect(screen.getByText('root-op')).toBeInTheDocument();
  });
});
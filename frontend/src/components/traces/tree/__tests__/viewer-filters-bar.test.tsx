import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewerFiltersBar } from '../viewer-filters-bar';
import type { NormalizedSpan, TempoTraceResponse } from '@/types/traces';
import { EntityType } from '@/types/enums';
import * as traceQueries from '@/lib/traces/queries';

jest.mock('@/lib/traces/queries');

const mockGetServiceName = traceQueries.getServiceName as jest.MockedFunction<typeof traceQueries.getServiceName>;

const createMockSpan = (overrides?: Partial<NormalizedSpan>): NormalizedSpan => ({
  spanId: 'span-1',
  parentSpanId: null,
  name: 'test-span',
  startTime: 1000000,
  endTime: 2000000,
  duration: 1000,
  attributes: [],
  events: [],
  resource: {},
  ...overrides
});

describe('ViewerFiltersBar', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnFilterChange = jest.fn();
  const mockTrace: TempoTraceResponse = { batches: [] };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServiceName.mockReturnValue('unknown');
  });

  it('renders search input', () => {
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: [], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    expect(screen.getByPlaceholderText('Search by name or ID...')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search input', () => {
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: [], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const searchInput = screen.getByPlaceholderText('Search by name or ID...');


    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(mockOnSearchChange).toHaveBeenCalledWith('test');
  });

  it('shows filter button when filter options available', () => {
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: ['service1'], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    expect(screen.getByTitle('Filters')).toBeInTheDocument();
  });

  it('hides filter button when no filter options', () => {
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: [], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    expect(screen.queryByTitle('Filters')).not.toBeInTheDocument();
  });

  it('shows filter badge when filters are active', () => {
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: 'service1', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: ['service1'], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const filterButton = screen.getByTitle('Filters');
    expect(filterButton).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens popover when filter button clicked', async () => {
    const user = userEvent.setup();
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: ['service1'], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const filterButton = screen.getByTitle('Filters');
    await user.click(filterButton);
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Service Name')).toBeInTheDocument();
  });

  it('shows service name filter in popover', async () => {
    const user = userEvent.setup();
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: ['service1', 'service2'], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const filterButton = screen.getByTitle('Filters');
    await user.click(filterButton);
    expect(screen.getByLabelText('Service Name')).toBeInTheDocument();
    expect(screen.getByText('service1')).toBeInTheDocument();
    expect(screen.getByText('service2')).toBeInTheDocument();
  });

  it('shows entity filter in popover', async () => {
    const user = userEvent.setup();
    const entityMap = new Map([
    ['entity-1', 'Entity 1'],
    ['entity-2', 'Entity 2']]
    );
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: [], entityIds: ['entity-1', 'entity-2'] }}
        entityMap={entityMap}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const filterButton = screen.getByTitle('Filters');
    await user.click(filterButton);
    expect(screen.getByLabelText('Entity')).toBeInTheDocument();
    expect(screen.getByText('Entity 1')).toBeInTheDocument();
    expect(screen.getByText('Entity 2')).toBeInTheDocument();
  });

  it('shows checkbox for showOnlyEntitySpans', async () => {
    const user = userEvent.setup();
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: ['service1'], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const filterButton = screen.getByTitle('Filters');
    await user.click(filterButton);
    expect(screen.getByLabelText('Show only entity spans')).toBeInTheDocument();
  });

  it('calls onFilterChange when service name selected', async () => {
    const user = userEvent.setup();
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: ['service1'], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const filterButton = screen.getByTitle('Filters');
    await user.click(filterButton);
    const serviceSelect = screen.getByLabelText('Service Name');
    await user.click(serviceSelect);
    await user.click(screen.getByText('service1'));

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        serviceName: 'service1',
        entityId: '',
        showOnlyEntitySpans: false
      });
    });
  });

  it('calls onFilterChange when entity selected', async () => {
    const user = userEvent.setup();
    const entityMap = new Map([['entity-1', 'Entity 1']]);
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: [], entityIds: ['entity-1'] }}
        entityMap={entityMap}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const filterButton = screen.getByTitle('Filters');
    await user.click(filterButton);
    const entitySelect = screen.getByLabelText('Entity');
    await user.click(entitySelect);
    await user.click(screen.getByText('Entity 1'));

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        serviceName: '',
        entityId: 'entity-1',
        showOnlyEntitySpans: false
      });
    });
  });

  it('calls onFilterChange when checkbox toggled', async () => {
    const user = userEvent.setup();
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: ['service1'], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const filterButton = screen.getByTitle('Filters');
    await user.click(filterButton);
    const checkbox = screen.getByLabelText('Show only entity spans');
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        serviceName: '',
        entityId: '',
        showOnlyEntitySpans: true
      });
    });
  });

  it('shows clear all button when filters are active', async () => {
    const user = userEvent.setup();
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: 'service1', entityId: '', showOnlyEntitySpans: true }}
        filterOptions={{ serviceNames: ['service1'], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const filterButton = screen.getByTitle('Filters');
    await user.click(filterButton);
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('clears all filters when clear all clicked', async () => {
    const user = userEvent.setup();
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: 'service1', entityId: 'entity-1', showOnlyEntitySpans: true }}
        filterOptions={{ serviceNames: ['service1'], entityIds: ['entity-1'] }}
        entityMap={new Map([['entity-1', 'Entity 1']])}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const filterButton = screen.getByTitle('Filters');
    await user.click(filterButton);
    const clearButton = screen.getByText('Clear all');
    await user.click(clearButton);

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        serviceName: '',
        entityId: '',
        showOnlyEntitySpans: false
      });
    });
  });

  it('disables download button when no span selected', () => {
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: [], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        selectedSpanId={null}
        spanTree={[]}
        trace={mockTrace} />

    );
    const downloadBtn = screen.getByTitle('No span selected');
    expect(downloadBtn).toBeDisabled();
  });

  it('enables download button when span selected', () => {
    const spans = [createMockSpan({ spanId: 's1', name: 'my-span' })];
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: [], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        selectedSpanId="s1"
        spanTree={spans}
        trace={mockTrace} />

    );
    const downloadBtn = screen.getByTitle('Download my-span');
    expect(downloadBtn).not.toBeDisabled();
  });

  it('disables copy button when no trace', () => {
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: [], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={null} />

    );
    const copyBtn = screen.getByTitle('No trace available');
    expect(copyBtn).toBeDisabled();
  });

  it('enables copy button when trace provided', () => {
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: '', entityId: '', showOnlyEntitySpans: false }}
        filterOptions={{ serviceNames: [], entityIds: [] }}
        entityMap={new Map()}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    const copyBtn = screen.getByTitle('Copy whole trace as JSON');
    expect(copyBtn).not.toBeDisabled();
  });

  it('calculates correct filter count badge', () => {
    render(
      <ViewerFiltersBar
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        filters={{ serviceName: 'service1', entityId: 'entity-1', showOnlyEntitySpans: true }}
        filterOptions={{ serviceNames: ['service1'], entityIds: ['entity-1'] }}
        entityMap={new Map([['entity-1', 'Entity 1']])}
        onFilterChange={mockOnFilterChange}
        spanTree={[]}
        trace={mockTrace} />

    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
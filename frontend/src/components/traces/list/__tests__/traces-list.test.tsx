import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TracesList } from '../traces-list'
import type { TempoTraceSummary } from '@/types/traces'

const mockUseParams = global.mockUseParams as jest.Mock
const mockNavigate = global.mockNavigate as jest.Mock

jest.mock('../add-to-queue-dialog', () => ({
  AddToQueueDialog: () => <div data-testid="add-to-queue-dialog" />,
}))

const mockTrace: TempoTraceSummary = {
  traceID: 'trace-1',
  rootTraceName: 'test-span',
  rootServiceName: 'test-service',
  startTimeUnixNano: '1000000000',
  durationMs: 100,
  spanCount: 5,
}

describe('TracesList', () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ projectId: 'p1', organisationId: 'o1' })
    mockNavigate.mockClear()
  })

  it('shows loading spinner when isSearchLoading is true', () => {
    render(
      <TracesList
        traces={[]}
        datasourceId="ds-1"
        isSearchLoading={true}
        isFetchLoading={false}
        searchError={null}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows loading spinner when isFetchLoading is true', () => {
    render(
      <TracesList
        traces={[]}
        datasourceId="ds-1"
        isSearchLoading={false}
        isFetchLoading={true}
        searchError={null}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows error message when searchError is set', () => {
    render(
      <TracesList
        traces={[]}
        datasourceId="ds-1"
        isSearchLoading={false}
        isFetchLoading={false}
        searchError="Failed to fetch traces"
      />
    )
    expect(screen.getByText(/Error: Failed to fetch traces/)).toBeInTheDocument()
  })

  it('shows "No traces found" when traces array is empty', () => {
    render(
      <TracesList
        traces={[]}
        datasourceId="ds-1"
        isSearchLoading={false}
        isFetchLoading={false}
        searchError={null}
      />
    )
    expect(screen.getByText('No traces found')).toBeInTheDocument()
  })

  it('renders trace table when traces are provided', () => {
    render(
      <TracesList
        traces={[mockTrace]}
        datasourceId="ds-1"
        isSearchLoading={false}
        isFetchLoading={false}
        searchError={null}
      />
    )
    expect(screen.getByText('test-span')).toBeInTheDocument()
    expect(screen.getByText('test-service')).toBeInTheDocument()
  })

  it('renders open in new tab link for each trace row', () => {
    render(
      <TracesList
        traces={[mockTrace]}
        datasourceId="ds-1"
        isSearchLoading={false}
        isFetchLoading={false}
        searchError={null}
      />
    )
    const openInNewTabLinks = screen.getAllByTitle('Open in new tab')
    expect(openInNewTabLinks).toHaveLength(1)
    expect(openInNewTabLinks[0].closest('a')).toHaveAttribute('target', '_blank')
  })

  it('navigates with search params including spanName when clicking trace row with filters', async () => {
    render(
      <TracesList
        traces={[mockTrace]}
        datasourceId="ds-1"
        isSearchLoading={false}
        isFetchLoading={false}
        searchError={null}
        filters={{
          datasourceId: 'ds-1',
          q: 'query',
          attributes: 'attr=val',
          min_duration: '',
          max_duration: '',
          lookback: '1h',
          limit: 20,
          spanName: 'my-span',
        }}
        startDate={new Date('2024-01-15T10:00:00.000Z')}
        endDate={new Date('2024-01-15T12:00:00.000Z')}
      />
    )
    await userEvent.click(screen.getByText('test-span'))
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ traceId: 'trace-1', datasourceId: 'ds-1' }),
        search: expect.objectContaining({
          datasourceId: 'ds-1',
          q: 'query',
          attributes: 'attr=val',
          spanName: 'my-span',
        }),
      })
    )
  })
})

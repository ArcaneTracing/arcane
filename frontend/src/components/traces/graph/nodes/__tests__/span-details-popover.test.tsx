import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SpanDetailsPopover } from '../span-details-popover'

jest.mock('../span-basic-info', () => ({
  SpanBasicInfo: ({ spanName, serviceName, duration, spanId }: any) => (
    <div data-testid="span-basic-info">
      {spanName} | {serviceName} | {duration}ms | {spanId}
    </div>
  ),
}))

jest.mock('../span-tags-section', () => ({
  SpanTagsSection: ({ tags }: { tags: unknown[] }) => (
    <div data-testid="span-tags">Tags: {tags.length}</div>
  ),
}))

jest.mock('../span-logs-section', () => ({
  SpanLogsSection: ({ logs }: { logs: unknown[] }) => (
    <div data-testid="span-logs">Logs: {logs.length}</div>
  ),
}))

describe('SpanDetailsPopover', () => {
  it('renders trigger button', () => {
    render(
      <SpanDetailsPopover
        spanName="my-span"
        serviceName="my-service"
        duration={1500}
        spanId="span-123"
      />
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows detailed info when opened', async () => {
    render(
      <SpanDetailsPopover
        spanName="my-span"
        serviceName="my-service"
        duration={1500}
        spanId="span-123"
      />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByTestId('span-basic-info')).toBeInTheDocument()
    expect(screen.getByText(/my-span/)).toBeInTheDocument()
  })

  it('shows tags section with tags', async () => {
    render(
      <SpanDetailsPopover
        spanName="my-span"
        serviceName="my-service"
        duration={1500}
        spanId="span-123"
        tags={[{ key: 'http.method', value: 'GET' }]}
      />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByTestId('span-tags')).toBeInTheDocument()
    expect(screen.getByText(/Tags: 1/)).toBeInTheDocument()
  })

  it('shows logs section with logs', async () => {
    render(
      <SpanDetailsPopover
        spanName="my-span"
        serviceName="my-service"
        duration={1500}
        spanId="span-123"
        logs={[
          {
            timestamp: 1704067200000000,
            fields: [{ key: 'event', value: 'started' }],
          },
        ]}
      />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByTestId('span-logs')).toBeInTheDocument()
    expect(screen.getByText(/Logs: 1/)).toBeInTheDocument()
  })
})

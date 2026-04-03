import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TraceMetadataBar } from '../trace-metadata-bar'

jest.mock('@/components/traces/list/add-to-queue-dialog', () => ({
  AddToQueueDialog: ({ trigger }: { trigger?: React.ReactNode }) => (
    <div data-testid="add-to-queue-dialog">{trigger}</div>
  ),
}))

describe('TraceMetadataBar', () => {
  it('returns null when traceMetrics is null', () => {
    const { container } = render(<TraceMetadataBar traceMetrics={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders service name and latency', () => {
    render(
      <TraceMetadataBar
        traceMetrics={{
          duration: 150,
          startTime: 1700000000000,
          serviceName: 'my-service',
        }}
      />
    )
    expect(screen.getByText(/Env: my-service/)).toBeInTheDocument()
    expect(screen.getByText(/Latency:/)).toBeInTheDocument()
  })

  it('shows default when serviceName is empty', () => {
    render(
      <TraceMetadataBar
        traceMetrics={{
          duration: 100,
          startTime: 1700000000000,
          serviceName: '',
        }}
      />
    )
    expect(screen.getByText(/Env: default/)).toBeInTheDocument()
  })

  it('shows Annotate button when onAnnotate provided', async () => {
    const onAnnotate = jest.fn()
    render(
      <TraceMetadataBar
        traceMetrics={{
          duration: 100,
          startTime: 1700000000000,
          serviceName: 'svc',
        }}
        onAnnotate={onAnnotate}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Annotate' }))
    expect(onAnnotate).toHaveBeenCalled()
  })

  it('does not show Add to annotation queue when showAddToAnnotationQueue but missing ids', () => {
    render(
      <TraceMetadataBar
        traceMetrics={{
          duration: 100,
          startTime: 1700000000000,
          serviceName: 'svc',
        }}
        showAddToAnnotationQueue={true}
        projectId="p1"
      />
    )
    expect(screen.queryByText(/Add to annotation queue/)).not.toBeInTheDocument()
  })

  it('shows Add to annotation queue when all ids provided', () => {
    render(
      <TraceMetadataBar
        traceMetrics={{
          duration: 100,
          startTime: 1700000000000,
          serviceName: 'svc',
        }}
        showAddToAnnotationQueue={true}
        projectId="p1"
        datasourceId="ds1"
        traceId="trace-1"
      />
    )
    expect(screen.getByText('+ Add to annotation queue')).toBeInTheDocument()
  })

  it('does not show timestamp when startTime is falsy', () => {
    render(
      <TraceMetadataBar
        traceMetrics={{
          duration: 100,
          startTime: 0,
          serviceName: 'svc',
        }}
      />
    )
    expect(screen.getByText(/Env: svc/)).toBeInTheDocument()
    expect(screen.getByText(/Latency:/)).toBeInTheDocument()
  })

  it('shows both Annotate and Add to queue when both provided', () => {
    const onAnnotate = jest.fn()
    render(
      <TraceMetadataBar
        traceMetrics={{
          duration: 100,
          startTime: 1700000000000,
          serviceName: 'svc',
        }}
        onAnnotate={onAnnotate}
        showAddToAnnotationQueue={true}
        projectId="p1"
        datasourceId="ds1"
        traceId="trace-1"
      />
    )
    expect(screen.getByRole('button', { name: 'Annotate' })).toBeInTheDocument()
    expect(screen.getByText('+ Add to annotation queue')).toBeInTheDocument()
  })
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import { SpanLogsSection } from '../span-logs-section'

describe('SpanLogsSection', () => {
  it('returns null when logs is empty', () => {
    const { container } = render(<SpanLogsSection logs={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders logs when provided with array fields', () => {
    render(
      <SpanLogsSection
        logs={[
          {
            timestamp: 1704067200000000,
            attributes: [
              { key: 'event', value: 'started' },
              { key: 'count', value: 42 },
            ],
          },
        ]}
      />
    )
    expect(screen.getByText('Logs')).toBeInTheDocument()
    expect(screen.getByText(/event/i)).toBeInTheDocument()
    expect(screen.getByText('started')).toBeInTheDocument()
  })

  it('renders logs when fields is object', () => {
    render(
      <SpanLogsSection
        logs={[
          {
            timestamp: 1704067200000000,
            fields: { event: 'error', message: 'Something failed' } as any,
          },
        ]}
      />
    )
    expect(screen.getByText('Logs')).toBeInTheDocument()
  })
})

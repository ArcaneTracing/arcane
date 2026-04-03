import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  SpanBasicInfo,
  SpanServiceInfo,
  SpanDurationInfo,
} from '../span-basic-info'

describe('SpanBasicInfo', () => {
  it('renders inline variant with span name only', () => {
    render(
      <SpanBasicInfo
        spanName="my-span"
        serviceName="my-service"
        duration={2500}
      />
    )
    expect(screen.getByText('my-span')).toBeInTheDocument()
  })

  it('renders detailed variant with all fields', () => {
    render(
      <SpanBasicInfo
        spanName="my-span"
        serviceName="my-service"
        duration={2500}
        variant="detailed"
      />
    )
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByText('my-span')).toBeInTheDocument()
    expect(screen.getByText('my-service')).toBeInTheDocument()
    expect(screen.getByText('2.50ms')).toBeInTheDocument()
  })

  it('renders detailed variant with spanId when provided', () => {
    render(
      <SpanBasicInfo
        spanName="my-span"
        serviceName="my-service"
        duration={2500}
        spanId="abc123"
        variant="detailed"
      />
    )
    expect(screen.getByText('abc123')).toBeInTheDocument()
  })

  it('does not render spanId in detailed variant when not provided', () => {
    render(
      <SpanBasicInfo
        spanName="my-span"
        serviceName="my-service"
        duration={2500}
        variant="detailed"
      />
    )
    expect(screen.queryByText(/Span ID/)).not.toBeInTheDocument()
  })
})

describe('SpanServiceInfo', () => {
  it('renders service name', () => {
    render(<SpanServiceInfo serviceName="api-service" />)
    expect(screen.getByText('api-service')).toBeInTheDocument()
  })
})

describe('SpanDurationInfo', () => {
  it('renders duration in ms', () => {
    render(<SpanDurationInfo duration={1500} />)
    expect(screen.getByText('1.50ms')).toBeInTheDocument()
  })

  it('formats zero duration', () => {
    render(<SpanDurationInfo duration={0} />)
    expect(screen.getByText('0.00ms')).toBeInTheDocument()
  })
})

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpanJsonTab } from '../span-json-tab'

const mockSpan = {
  spanId: 'span-1',
  parentSpanId: null,
  name: 'test-span',
  startTime: 1000000,
  endTime: 2000000,
  duration: 1,
  attributes: [],
  events: [],
  resource: {},
}

describe('SpanJsonTab', () => {
  it('shows empty state when no span selected', () => {
    render(<SpanJsonTab selectedSpan={null} />)
    expect(screen.getByText('Select a span to view JSON')).toBeInTheDocument()
    expect(screen.getByTitle('No span selected')).toBeDisabled()
  })

  it('renders JsonViewer when span selected', () => {
    render(<SpanJsonTab selectedSpan={mockSpan as any} />)
    expect(screen.getByText('span')).toBeInTheDocument()
    expect(screen.getByTitle('Copy span JSON')).not.toBeDisabled()
  })

  it('Copy button is enabled when span selected', () => {
    render(<SpanJsonTab selectedSpan={mockSpan as any} />)
    const copyBtn = screen.getByTitle('Copy span JSON')
    expect(copyBtn).not.toBeDisabled()
  })

  it('calls clipboard.writeText when Copy clicked with span', async () => {
    const user = userEvent.setup()
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })
    render(<SpanJsonTab selectedSpan={mockSpan as any} />)
    const copyBtn = screen.getByTitle('Copy span JSON')
    await user.click(copyBtn)
    expect(writeText).toHaveBeenCalled()
    expect(writeText.mock.calls[0][0]).toContain('spanId')
    expect(writeText.mock.calls[0][0]).toContain('span-1')
  })
})

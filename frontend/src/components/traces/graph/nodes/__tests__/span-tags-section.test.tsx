import React from 'react'
import { render, screen } from '@testing-library/react'
import { SpanTagsSection } from '../span-tags-section'

describe('SpanTagsSection', () => {
  it('returns null when tags is empty', () => {
    const { container } = render(<SpanTagsSection tags={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders tags when provided', () => {
    render(
      <SpanTagsSection
        tags={[
          { key: 'http.method', value: 'GET' },
          { key: 'http.status_code', value: 200 },
        ]}
      />
    )
    expect(screen.getByText('Tags')).toBeInTheDocument()
    expect(screen.getByText(/http\.method/)).toBeInTheDocument()
    expect(screen.getByText('GET')).toBeInTheDocument()
    expect(screen.getByText(/http\.status_code/)).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })
})

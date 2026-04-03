import React from 'react'
import { render, screen } from '@testing-library/react'
import { SpanInfoField } from '../span-info-field'

describe('SpanInfoField', () => {
  it('renders string value', () => {
    render(<SpanInfoField label="Name" value="my-span" />)
    expect(screen.getByText(/Name:/)).toBeInTheDocument()
    expect(screen.getByText('my-span')).toBeInTheDocument()
  })

  it('renders number value', () => {
    render(<SpanInfoField label="Count" value={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders boolean value', () => {
    render(<SpanInfoField label="Active" value={true} />)
    expect(screen.getByText('true')).toBeInTheDocument()
  })

  it('renders em dash for null', () => {
    render(<SpanInfoField label="Empty" value={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders em dash for undefined', () => {
    render(<SpanInfoField label="Empty" value={undefined} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders JSON string for object value', () => {
    render(<SpanInfoField label="Data" value={{}} />)
    expect(screen.getByText('{}')).toBeInTheDocument()
  })

  it('renders JSON string for object with keys', () => {
    render(<SpanInfoField label="Data" value={{ foo: 'bar' }} />)
    expect(screen.getByText('{"foo":"bar"}')).toBeInTheDocument()
  })

  it('renders JSON string for array value', () => {
    render(<SpanInfoField label="Items" value={[1, 2, 3]} />)
    expect(screen.getByText('[1,2,3]')).toBeInTheDocument()
  })
})

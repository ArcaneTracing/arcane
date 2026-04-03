import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JsonViewer } from '../json-previewer'

describe('JsonViewer', () => {
  it('renders root name', () => {
    render(<JsonViewer data={{ foo: 'bar' }} />)
    expect(screen.getByText('root')).toBeInTheDocument()
  })

  it('renders custom root name', () => {
    render(<JsonViewer data={{ foo: 'bar' }} rootName="response" />)
    expect(screen.getByText('response')).toBeInTheDocument()
  })

  it('renders object with key-value', () => {
    render(<JsonViewer data={{ name: 'test' }} />)
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('"test"')).toBeInTheDocument()
  })

  it('renders array items', () => {
    render(<JsonViewer data={{ items: [1, 2] }} />)
    expect(screen.getByText('items')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    const ones = screen.getAllByText('1')
    expect(ones.length).toBeGreaterThanOrEqual(1)
  })

  it('renders null value', () => {
    render(<JsonViewer data={{ value: null }} />)
    expect(screen.getByText('null')).toBeInTheDocument()
  })

  it('renders number value', () => {
    render(<JsonViewer data={{ count: 42 }} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders boolean value', () => {
    render(<JsonViewer data={{ active: true }} />)
    expect(screen.getByText('true')).toBeInTheDocument()
  })

  it('toggles expand/collapse on click', async () => {
    const user = userEvent.setup()
    render(<JsonViewer data={{ nested: { a: 1 } }} />)
    expect(screen.getByText('nested')).toBeInTheDocument()
    expect(screen.getByText('a')).toBeInTheDocument()

    await user.click(screen.getByText('root'))
    expect(screen.getByText(/1 item/)).toBeInTheDocument()
  })

  it('copies to clipboard on copy button click', async () => {
    const user = userEvent.setup()
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    })

    render(<JsonViewer data={{ key: 'value' }} />)
    const copyBtns = screen.getAllByTitle('Copy to clipboard')
    await user.click(copyBtns[0])

    expect(writeText).toHaveBeenCalledWith(JSON.stringify({ key: 'value' }, null, 2))
  })

  it('renders with defaultExpanded false', () => {
    render(<JsonViewer data={{ a: 1, b: 2 }} defaultExpanded={false} />)
    expect(screen.getByText('root')).toBeInTheDocument()
    expect(screen.getByText(/2 items/)).toBeInTheDocument()
  })
})

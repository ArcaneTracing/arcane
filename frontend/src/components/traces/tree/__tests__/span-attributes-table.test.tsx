import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpanAttributesTable } from '../span-attributes-table'
import type { SpanAttribute } from '@/types/traces'

describe('SpanAttributesTable', () => {
  const onCopy = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when attributes is empty', () => {
    const { container } = render(
      <SpanAttributesTable attributes={[]} onCopy={onCopy} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when attributes is undefined', () => {
    const { container } = render(
      <SpanAttributesTable attributes={undefined as unknown as SpanAttribute[]} onCopy={onCopy} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders Attributes header and attribute rows', () => {
    const attributes: SpanAttribute[] = [
      { key: 'http.method', value: 'GET' },
      { key: 'http.status_code', value: 200 },
    ]
    render(
      <SpanAttributesTable attributes={attributes} onCopy={onCopy} />
    )
    expect(screen.getByText('Attributes')).toBeInTheDocument()
    expect(screen.getByText('http.method')).toBeInTheDocument()
    expect(screen.getByText('GET')).toBeInTheDocument()
    expect(screen.getByText('http.status_code')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('calls onCopy when copy button clicked', async () => {
    const attributes: SpanAttribute[] = [
      { key: 'key1', value: 'value1' },
    ]
    render(
      <SpanAttributesTable attributes={attributes} onCopy={onCopy} />
    )
    const copyButtons = screen.getAllByRole('button')
    await userEvent.click(copyButtons[0])
    expect(onCopy).toHaveBeenCalledWith('value1')
  })

  it('formats object values as JSON', () => {
    const attributes: SpanAttribute[] = [
      { key: 'metadata', value: { foo: 'bar', count: 1 } },
    ]
    render(
      <SpanAttributesTable attributes={attributes} onCopy={onCopy} />
    )
    expect(screen.getByText(/foo/)).toBeInTheDocument()
    expect(screen.getByText(/bar/)).toBeInTheDocument()
  })

  it('renders without context menu when not in dataset mode', () => {
    const attributes: SpanAttribute[] = [
      { key: 'key1', value: 'value1' },
    ]
    render(
      <SpanAttributesTable
        attributes={attributes}
        onCopy={onCopy}
        datasetMode={false}
      />
    )
    expect(screen.getByText('key1')).toBeInTheDocument()
    expect(screen.getByText('value1')).toBeInTheDocument()
  })

  it('renders in dataset mode with datasetColumns and onMapToColumn', () => {
    const onMapToColumn = jest.fn()
    const attributes: SpanAttribute[] = [
      { key: 'attr1', value: 'val1' },
    ]
    render(
      <SpanAttributesTable
        attributes={attributes}
        onCopy={onCopy}
        datasetMode={true}
        datasetColumns={['col1', 'col2']}
        onMapToColumn={onMapToColumn}
      />
    )
    expect(screen.getByText('attr1')).toBeInTheDocument()
    expect(screen.getByText('val1')).toBeInTheDocument()
  })

  it('formats number values as string', () => {
    const attributes: SpanAttribute[] = [
      { key: 'count', value: 42 },
    ]
    render(
      <SpanAttributesTable attributes={attributes} onCopy={onCopy} />
    )
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('calls onCopy when copy button clicked for value', async () => {
    const attributes: SpanAttribute[] = [
      { key: 'a', value: 'x' },
      { key: 'b', value: 'y' },
    ]
    render(
      <SpanAttributesTable attributes={attributes} onCopy={onCopy} />
    )
    const copyButtons = screen.getAllByRole('button')
    await userEvent.click(copyButtons[0])
    expect(onCopy).toHaveBeenCalledWith('x')
    await userEvent.click(copyButtons[1])
    expect(onCopy).toHaveBeenCalledWith('y')
  })

  it('calls onCopy with key when Copy Key clicked from context menu in dataset mode', async () => {
    const attributes: SpanAttribute[] = [{ key: 'attr1', value: 'val1' }]
    render(
      <SpanAttributesTable
        attributes={attributes}
        onCopy={onCopy}
        datasetMode={true}
        datasetColumns={['col1']}
        onMapToColumn={jest.fn()}
      />
    )
    const keyCell = screen.getByText('attr1')
    fireEvent.contextMenu(keyCell)
    const copyKeyItem = await screen.findByRole('menuitem', { name: /copy key/i })
    await userEvent.click(copyKeyItem)
    expect(onCopy).toHaveBeenCalledWith('attr1')
  })

  it('calls onMapToColumn when Add Key to Column clicked in dataset mode', async () => {
    const onMapToColumn = jest.fn()
    const attributes: SpanAttribute[] = [{ key: 'attr1', value: 'val1' }]
    render(
      <SpanAttributesTable
        attributes={attributes}
        onCopy={onCopy}
        datasetMode={true}
        datasetColumns={['col1', 'col2']}
        onMapToColumn={onMapToColumn}
      />
    )
    const keyCell = screen.getByText('attr1')
    fireEvent.contextMenu(keyCell)
    const addKeyTrigger = await screen.findByRole('menuitem', { name: /add key to column/i })
    await userEvent.click(addKeyTrigger)
    const col1Item = await screen.findByRole('menuitem', { name: 'col1' })
    await userEvent.click(col1Item)
    expect(onMapToColumn).toHaveBeenCalledWith('col1', 'attr1', 'add')
  })

  it('calls onMapToColumn when Map Value to Column clicked in dataset mode', async () => {
    const onMapToColumn = jest.fn()
    const attributes: SpanAttribute[] = [{ key: 'k1', value: 'v1' }]
    render(
      <SpanAttributesTable
        attributes={attributes}
        onCopy={onCopy}
        datasetMode={true}
        datasetColumns={['colA']}
        onMapToColumn={onMapToColumn}
      />
    )
    const valuePre = screen.getByText('v1')
    fireEvent.contextMenu(valuePre)
    const mapValueTrigger = await screen.findByRole('menuitem', { name: /map value to column/i })
    await userEvent.click(mapValueTrigger)
    const colAItem = await screen.findByRole('menuitem', { name: 'colA' })
    await userEvent.click(colAItem)
    expect(onMapToColumn).toHaveBeenCalledWith('colA', 'v1', 'map')
  })

  it('calls onMapToColumn when Map Key to Column clicked in dataset mode', async () => {
    const onMapToColumn = jest.fn()
    const attributes: SpanAttribute[] = [{ key: 'attrKey', value: 'val' }]
    render(
      <SpanAttributesTable
        attributes={attributes}
        onCopy={onCopy}
        datasetMode={true}
        datasetColumns={['col1']}
        onMapToColumn={onMapToColumn}
      />
    )
    const keyCell = screen.getByText('attrKey')
    fireEvent.contextMenu(keyCell)
    const mapKeyTrigger = await screen.findByRole('menuitem', { name: /map key to column/i })
    await userEvent.click(mapKeyTrigger)
    const col1Item = await screen.findByRole('menuitem', { name: 'col1' })
    await userEvent.click(col1Item)
    expect(onMapToColumn).toHaveBeenCalledWith('col1', 'attrKey', 'map')
  })

  it('calls onMapToColumn when Add Value to Column clicked in dataset mode', async () => {
    const onMapToColumn = jest.fn()
    const attributes: SpanAttribute[] = [{ key: 'k', value: 'fullValue' }]
    render(
      <SpanAttributesTable
        attributes={attributes}
        onCopy={onCopy}
        datasetMode={true}
        datasetColumns={['targetCol']}
        onMapToColumn={onMapToColumn}
      />
    )
    const valuePre = screen.getByText('fullValue')
    fireEvent.contextMenu(valuePre)
    const addValueTrigger = await screen.findByRole('menuitem', { name: /add value to column/i })
    await userEvent.click(addValueTrigger)
    const targetItem = await screen.findByRole('menuitem', { name: 'targetCol' })
    await userEvent.click(targetItem)
    expect(onMapToColumn).toHaveBeenCalledWith('targetCol', 'fullValue', 'add')
  })

  it('calls onCopy when Copy Value clicked from context menu in dataset mode', async () => {
    const attributes: SpanAttribute[] = [{ key: 'k', value: 'val' }]
    render(
      <SpanAttributesTable
        attributes={attributes}
        onCopy={onCopy}
        datasetMode={true}
        datasetColumns={['col1']}
        onMapToColumn={jest.fn()}
      />
    )
    const valuePre = screen.getByText('val')
    fireEvent.contextMenu(valuePre)
    const copyValueItem = await screen.findByRole('menuitem', { name: /copy value/i })
    await userEvent.click(copyValueItem)
    expect(onCopy).toHaveBeenCalledWith('val')
  })

  it('does not show Add/Map submenus when datasetColumns is empty', () => {
    const attributes: SpanAttribute[] = [{ key: 'k', value: 'v' }]
    render(
      <SpanAttributesTable
        attributes={attributes}
        onCopy={onCopy}
        datasetMode={true}
        datasetColumns={[]}
        onMapToColumn={jest.fn()}
      />
    )
    const keyCell = screen.getByText('k')
    fireEvent.contextMenu(keyCell)
    expect(screen.queryByRole('menuitem', { name: /add key to column/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /map key to column/i })).not.toBeInTheDocument()
  })
})

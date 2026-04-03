import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatasourceSelector } from '../datasource-selector'

jest.mock('@/lib/error-handling', () => ({
  isForbiddenError: jest.fn(() => false),
}))

describe('DatasourceSelector', () => {
  const onValueChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(jest.requireMock('@/lib/error-handling').isForbiddenError as jest.Mock).mockReturnValue(false)
  })

  it('renders label and select', () => {
    render(
      <DatasourceSelector
        datasources={[]}
        value=""
        onValueChange={onValueChange}
      />
    )
    expect(screen.getByText('Datasource')).toBeInTheDocument()
    expect(screen.getByTestId('select')).toBeInTheDocument()
  })

  it('shows Loading when isLoading', () => {
    render(
      <DatasourceSelector
        datasources={[]}
        value=""
        onValueChange={onValueChange}
        isLoading={true}
      />
    )
    expect(screen.getByPlaceholderText('Loading...')).toBeInTheDocument()
  })

  it('shows No permission placeholder when hasPermissionError', () => {
    ;(jest.requireMock('@/lib/error-handling').isForbiddenError as jest.Mock).mockReturnValue(true)
    const { container } = render(
      <DatasourceSelector
        datasources={[{ id: 'ds-1', name: 'DS1' }]}
        value=""
        onValueChange={onValueChange}
        error={new Error('Forbidden')}
      />
    )
    expect(container.querySelector('[placeholder="No permission"]')).toBeInTheDocument()
  })

  it('renders datasource options when opened', async () => {
    const user = userEvent.setup()
    const datasources = [
      { id: 'ds-1', name: 'Datasource 1' },
      { id: 'ds-2', name: 'Datasource 2' },
    ]
    render(
      <DatasourceSelector
        datasources={datasources}
        value=""
        onValueChange={onValueChange}
      />
    )
    const trigger = screen.getByTestId('select').querySelector('button')
    if (trigger) await user.click(trigger)
    expect(screen.getByText('Datasource 1')).toBeInTheDocument()
    expect(screen.getByText('Datasource 2')).toBeInTheDocument()
  })

  it('shows No datasources available when empty and no error', async () => {
    const user = userEvent.setup()
    render(
      <DatasourceSelector
        datasources={[]}
        value=""
        onValueChange={onValueChange}
      />
    )
    const trigger = screen.getByTestId('select').querySelector('button')
    if (trigger) await user.click(trigger)
    expect(screen.getByText('No datasources available')).toBeInTheDocument()
  })
})

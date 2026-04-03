import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AttributesFilter } from '../attributes-filter'

jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(() => ({ projectId: 'p1', organisationId: 'o1', datasourceId: 'ds1' })),
}))

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: jest.fn(() => 'org-1'),
}))

const mockUseTraceAttributeNames = jest.fn(() => ({ data: [], isLoading: false, error: null }))
const mockUseTraceAttributeValues = jest.fn(() => ({ data: [], isLoading: false, error: null }))
jest.mock('@/hooks/traces/use-trace-attributes', () => ({
  useTraceAttributeNames: (opts: unknown) => mockUseTraceAttributeNames(opts),
  useTraceAttributeValues: (opts: unknown) => mockUseTraceAttributeValues(opts),
}))

const baseConfig = {
  showAttributesFilter: true,
  loadAttributeNames: false,
  loadAttributeValues: false,
}

describe('AttributesFilter', () => {
  const onChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null when showAttributesFilter is false', () => {
    const { container } = render(
      <AttributesFilter
        value=""
        onChange={onChange}
        config={{ ...baseConfig, showAttributesFilter: false }}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders simple input when capabilities are disabled', () => {
    render(
      <AttributesFilter
        value=""
        onChange={onChange}
        config={baseConfig}
      />
    )
    expect(screen.getByLabelText('Attributes')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/service\.name=my-service/)).toBeInTheDocument()
    expect(screen.getByText(/Format: key=value/)).toBeInTheDocument()
  })

  it('calls onChange when typing in simple input', async () => {
    render(
      <AttributesFilter
        value=""
        onChange={onChange}
        config={baseConfig}
      />
    )
    const input = screen.getByPlaceholderText(/service\.name=my-service/)
    await userEvent.type(input, 'service.name=my-svc')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders badges for existing attributes', () => {
    mockUseTraceAttributeNames.mockReturnValue({ data: ['service.name', 'span.kind'], isLoading: false, error: null })
    mockUseTraceAttributeValues.mockReturnValue({ data: [], isLoading: false, error: null })

    render(
      <AttributesFilter
        value="service.name=my-service span.kind=server"
        onChange={onChange}
        config={{ ...baseConfig, loadAttributeNames: true, loadAttributeValues: true }}
      />
    )
    expect(screen.getByText('service.name=my-service')).toBeInTheDocument()
    expect(screen.getByText('span.kind=server')).toBeInTheDocument()
  })

  it('calls onChange when removing attribute badge', async () => {
    mockUseTraceAttributeNames.mockReturnValue({ data: [], isLoading: false, error: null })
    mockUseTraceAttributeValues.mockReturnValue({ data: [], isLoading: false, error: null })

    render(
      <AttributesFilter
        value="service.name=my-service"
        onChange={onChange}
        config={{ ...baseConfig, loadAttributeNames: true, loadAttributeValues: true }}
      />
    )
    const removeBtn = screen.getByLabelText('Remove service.name')
    await userEvent.click(removeBtn)
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('renders enhanced UI with attribute name input when loadAttributeNames is true', () => {
    mockUseTraceAttributeNames.mockReturnValue({ data: ['service.name'], isLoading: false, error: null })
    mockUseTraceAttributeValues.mockReturnValue({ data: [], isLoading: false, error: null })

    render(
      <AttributesFilter
        value=""
        onChange={onChange}
        config={{ ...baseConfig, loadAttributeNames: true, loadAttributeValues: false }}
      />
    )
    expect(screen.getByPlaceholderText('Select attribute name...')).toBeInTheDocument()
  })
})

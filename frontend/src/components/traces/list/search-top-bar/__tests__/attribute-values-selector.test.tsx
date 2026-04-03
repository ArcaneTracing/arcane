import React from 'react'
import { render, screen } from '@testing-library/react'
import { AttributeValuesSelector } from '../attribute-values-selector'

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: jest.fn(() => 'org-1'),
}))

jest.mock('@/lib/error-handling', () => ({
  isForbiddenError: jest.fn(() => false),
}))

const mockUseTraceAttributeValues = jest.fn(() => ({
  data: ['value1', 'value2'],
  isLoading: false,
  error: null,
}))

jest.mock('@/hooks/traces/use-trace-attributes', () => ({
  useTraceAttributeValues: (opts: unknown) => mockUseTraceAttributeValues(opts),
}))

describe('AttributeValuesSelector', () => {
  const onValueSelect = jest.fn()
  const onRemoveValue = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(jest.requireMock('@/lib/error-handling').isForbiddenError as jest.Mock).mockReturnValue(false)
    mockUseTraceAttributeValues.mockReturnValue({
      data: ['value1', 'value2'],
      isLoading: false,
      error: null,
    })
  })

  it('renders placeholder when no values selected', () => {
    render(
      <AttributeValuesSelector
        selectedAttribute="service.name"
        selectedValues={[]}
        onValueSelect={onValueSelect}
        onRemoveValue={onRemoveValue}
      />
    )
    expect(screen.getByPlaceholderText('Select value...')).toBeInTheDocument()
  })

  it('renders selected values as badges', () => {
    render(
      <AttributeValuesSelector
        selectedAttribute="service.name"
        selectedValues={['my-service', 'other-service']}
        onValueSelect={onValueSelect}
        onRemoveValue={onRemoveValue}
      />
    )
    expect(screen.getByText('service.name=my-service')).toBeInTheDocument()
    expect(screen.getByText('service.name=other-service')).toBeInTheDocument()
  })

  it('shows permission error placeholder when hasPermissionError', () => {
    const { isForbiddenError } = jest.requireMock('@/lib/error-handling')
    ;(isForbiddenError as jest.Mock).mockReturnValue(true)

    mockUseTraceAttributeValues.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Forbidden'),
    })

    render(
      <AttributeValuesSelector
        selectedAttribute="service.name"
        selectedValues={[]}
        onValueSelect={onValueSelect}
        onRemoveValue={onRemoveValue}
        organisationId="org-1"
        projectId="proj-1"
        datasourceId="ds-1"
      />
    )
    expect(screen.getByPlaceholderText('No permission to view values')).toBeInTheDocument()
  })

  it('is disabled when selectedAttribute is empty', () => {
    render(
      <AttributeValuesSelector
        selectedAttribute=""
        selectedValues={[]}
        onValueSelect={onValueSelect}
        onRemoveValue={onRemoveValue}
      />
    )
    const input = screen.getByPlaceholderText('Select value...')
    expect(input).toBeDisabled()
  })

  it('is disabled when hasPermissionError', () => {
    const { isForbiddenError } = jest.requireMock('@/lib/error-handling')
    ;(isForbiddenError as jest.Mock).mockReturnValue(true)
    mockUseTraceAttributeValues.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Forbidden'),
    })

    render(
      <AttributeValuesSelector
        selectedAttribute="service.name"
        selectedValues={[]}
        onValueSelect={onValueSelect}
        onRemoveValue={onRemoveValue}
        organisationId="org-1"
        projectId="proj-1"
        datasourceId="ds-1"
      />
    )
    const input = screen.getByPlaceholderText('No permission to view values')
    expect(input).toBeDisabled()
  })

  it('passes organisationId from useOrganisationIdOrNull to useTraceAttributeValues', () => {
    const { useOrganisationIdOrNull } = jest.requireMock('@/hooks/useOrganisation')
    ;(useOrganisationIdOrNull as jest.Mock).mockReturnValueOnce('org-from-route')

    render(
      <AttributeValuesSelector
        selectedAttribute="attr"
        selectedValues={[]}
        onValueSelect={onValueSelect}
        onRemoveValue={onRemoveValue}
        projectId="proj-1"
        datasourceId="ds-1"
      />
    )
    expect(mockUseTraceAttributeValues).toHaveBeenCalledWith(
      expect.objectContaining({
        organisationId: 'org-from-route',
        attributeName: 'attr',
        enabled: true,
      })
    )
  })

  it('disables query when enabled is false', () => {
    render(
      <AttributeValuesSelector
        selectedAttribute="attr"
        selectedValues={[]}
        onValueSelect={onValueSelect}
        onRemoveValue={onRemoveValue}
        organisationId="org-1"
        projectId="proj-1"
        datasourceId="ds-1"
        enabled={false}
      />
    )
    expect(mockUseTraceAttributeValues).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    )
  })
})

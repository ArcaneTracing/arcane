import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatasetMappingDrawer } from '../dataset-mapping-drawer'

const mockUseDatasetQuery = jest.fn()
const mockUpsertMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
}

jest.mock('@/hooks/datasets/use-datasets-query', () => ({
  useDatasetQuery: (projectId: string, datasetId?: string | null) =>
    mockUseDatasetQuery(projectId, datasetId),
  useUpsertDatasetRow: (projectId: string) => mockUpsertMutation,
}))

describe('DatasetMappingDrawer', () => {
  const onOpenChange = jest.fn()
  const onAddToDataset = jest.fn()
  const onRemoveMapping = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDatasetQuery.mockReturnValue({ data: null, isLoading: false })
  })

  it('renders floating button when datasetId and mappings exist', () => {
    const mappings = new Map([['col1', 'val1']])
    render(
      <DatasetMappingDrawer
        projectId="proj-1"
        datasetId="ds-1"
        mappings={mappings}
        isOpen={false}
        onOpenChange={onOpenChange}
        onAddToDataset={onAddToDataset}
        onRemoveMapping={onRemoveMapping}
      />
    )
    const fab = screen.getByRole('button')
    expect(fab).toBeInTheDocument()
  })

  it('does not render floating button when no mappings', () => {
    render(
      <DatasetMappingDrawer
        projectId="proj-1"
        datasetId="ds-1"
        mappings={new Map()}
        isOpen={false}
        onOpenChange={onOpenChange}
        onAddToDataset={onAddToDataset}
        onRemoveMapping={onRemoveMapping}
      />
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('opens drawer and shows Dataset Mappings title', async () => {
    const mappings = new Map([['col1', 'val1']])
    const dataset = {
      id: 'ds-1',
      name: 'Test Dataset',
      header: ['col1'],
      rows: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUseDatasetQuery.mockReturnValue({ data: dataset, isLoading: false })

    render(
      <DatasetMappingDrawer
        projectId="proj-1"
        datasetId="ds-1"
        mappings={mappings}
        isOpen={true}
        onOpenChange={onOpenChange}
        onAddToDataset={onAddToDataset}
        onRemoveMapping={onRemoveMapping}
      />
    )
    expect(screen.getByRole('heading', { name: 'Dataset Mappings' })).toBeInTheDocument()
    expect(screen.getByText(/Review and submit your mapped values/)).toBeInTheDocument()
  })

  it('shows loading state when dataset loading', () => {
    mockUseDatasetQuery.mockReturnValue({ data: null, isLoading: true })

    render(
      <DatasetMappingDrawer
        projectId="proj-1"
        datasetId="ds-1"
        mappings={new Map([['col1', 'val1']])}
        isOpen={true}
        onOpenChange={onOpenChange}
        onAddToDataset={onAddToDataset}
        onRemoveMapping={onRemoveMapping}
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows "No dataset selected" when no dataset', () => {
    mockUseDatasetQuery.mockReturnValue({ data: null, isLoading: false })

    render(
      <DatasetMappingDrawer
        projectId="proj-1"
        datasetId="ds-1"
        mappings={new Map()}
        isOpen={true}
        onOpenChange={onOpenChange}
        onAddToDataset={onAddToDataset}
        onRemoveMapping={onRemoveMapping}
      />
    )
    expect(screen.getByText('No dataset selected')).toBeInTheDocument()
  })

  it('calls onOpenChange when Cancel clicked', async () => {
    const dataset = {
      id: 'ds-1',
      name: 'Test',
      header: ['col1'],
      rows: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUseDatasetQuery.mockReturnValue({ data: dataset, isLoading: false })

    render(
      <DatasetMappingDrawer
        projectId="proj-1"
        datasetId="ds-1"
        mappings={new Map([['col1', 'val1']])}
        isOpen={true}
        onOpenChange={onOpenChange}
        onAddToDataset={onAddToDataset}
        onRemoveMapping={onRemoveMapping}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

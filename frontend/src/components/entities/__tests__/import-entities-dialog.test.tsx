import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportEntitiesDialog } from '../import-entities-dialog'

const mockMutateAsync = jest.fn().mockResolvedValue(undefined)
const mockUseImportEntities = jest.fn(() => ({
  mutateAsync: mockMutateAsync,
  isPending: false,
  error: null,
  reset: jest.fn(),
}))

jest.mock('@/hooks/entities/use-entities-query', () => ({
  useImportEntities: () => mockUseImportEntities(),
}))

const mockUseMutationAction = jest.fn(({ mutation }) => ({
  ...mutation,
  isPending: mutation.isPending,
  errorMessage: mutation.error?.message || null,
  handleError: jest.fn(),
  clear: jest.fn(),
  clearError: jest.fn(),
}))

jest.mock('@/hooks/shared/use-mutation-action', () => ({
  useMutationAction: (options: unknown) => mockUseMutationAction(options),
}))

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn(),
}))

describe('ImportEntitiesDialog', () => {
  const onOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseImportEntities.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      reset: jest.fn(),
    })
  })

  it('renders Import Entities title when open', () => {
    render(
      <ImportEntitiesDialog
        open={true}
        onOpenChange={onOpenChange}
      />
    )
    expect(screen.getByRole('heading', { name: 'Import Entities' })).toBeInTheDocument()
    expect(screen.getByText(/Upload a YAML file to import entity configurations/)).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(
      <ImportEntitiesDialog
        open={false}
        onOpenChange={onOpenChange}
      />
    )
    expect(screen.queryByRole('heading', { name: 'Import Entities' })).not.toBeInTheDocument()
  })

  it('shows drag and drop area for YAML when no file selected', () => {
    render(
      <ImportEntitiesDialog
        open={true}
        onOpenChange={onOpenChange}
      />
    )
    expect(screen.getByText(/Drag and drop your YAML file here/)).toBeInTheDocument()
    expect(screen.getByText('Browse Files')).toBeInTheDocument()
  })

  it('disables Import button when no file selected', () => {
    render(
      <ImportEntitiesDialog
        open={true}
        onOpenChange={onOpenChange}
      />
    )
    expect(screen.getByRole('button', { name: /Import Entities/ })).toBeDisabled()
  })

  it('calls onOpenChange when Cancel clicked', async () => {
    render(
      <ImportEntitiesDialog
        open={true}
        onOpenChange={onOpenChange}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('accepts YAML file via input and shows file info', () => {
    const file = new File(['entities: []'], 'entities.yaml', { type: 'text/yaml' })
    Object.defineProperty(file, 'size', { value: 1024 })

    render(
      <ImportEntitiesDialog
        open={true}
        onOpenChange={onOpenChange}
      />
    )

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    fireEvent.change(fileInput!, { target: { files: [file] } })

    expect(screen.getByText('entities.yaml')).toBeInTheDocument()
  })

  it('shows loading state when importing', () => {
    mockUseImportEntities.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      error: null,
      reset: jest.fn(),
    })
    mockUseMutationAction.mockImplementation(({ mutation }) => ({
      ...mutation,
      isPending: true,
      errorMessage: null,
      handleError: jest.fn(),
      clear: jest.fn(),
      clearError: jest.fn(),
    }))

    render(
      <ImportEntitiesDialog
        open={true}
        onOpenChange={onOpenChange}
      />
    )
    expect(screen.getByText('Importing...')).toBeInTheDocument()
  })
})

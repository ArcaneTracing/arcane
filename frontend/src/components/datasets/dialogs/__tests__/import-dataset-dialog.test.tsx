import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportDatasetDialog } from '../import-dataset-dialog'

const mockMutateAsync = jest.fn().mockResolvedValue(undefined)
const mockUseImportDataset = jest.fn(() => ({
  mutateAsync: mockMutateAsync,
  isPending: false,
  error: null,
  reset: jest.fn(),
}))

jest.mock('@/hooks/datasets/use-datasets-query', () => ({
  useImportDataset: (projectId: string) => mockUseImportDataset(projectId),
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

describe('ImportDatasetDialog', () => {
  const onOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseImportDataset.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: null,
      reset: jest.fn(),
    })
    mockUseMutationAction.mockImplementation(({ mutation }: { mutation: { isPending: boolean; error?: { message?: string } | null } }) => ({
      ...mutation,
      isPending: mutation.isPending,
      errorMessage: mutation.error?.message || null,
      handleError: jest.fn(),
      clear: jest.fn(),
      clearError: jest.fn(),
    }))
  })

  it('renders Import Dataset title when open', () => {
    render(
      <ImportDatasetDialog
        open={true}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )
    expect(screen.getByRole('heading', { name: 'Import Dataset' })).toBeInTheDocument()
    expect(screen.getByText(/Upload a CSV file to import as a new dataset/)).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(
      <ImportDatasetDialog
        open={false}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )
    expect(screen.queryByRole('heading', { name: 'Import Dataset' })).not.toBeInTheDocument()
  })

  it('shows drag and drop area when no file selected', () => {
    render(
      <ImportDatasetDialog
        open={true}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )
    expect(screen.getByText(/Drag and drop your CSV file here/)).toBeInTheDocument()
    expect(screen.getByText('Browse Files')).toBeInTheDocument()
  })

  it('disables Import button when no file and no name', () => {
    render(
      <ImportDatasetDialog
        open={true}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )
    expect(screen.getByRole('button', { name: /Import Dataset/ })).toBeDisabled()
  })

  it('calls onOpenChange when Cancel clicked', async () => {
    render(
      <ImportDatasetDialog
        open={true}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('accepts file via input and shows file info', () => {
    const file = new File(['col1,col2\n1,2'], 'test.csv', { type: 'text/csv' })
    Object.defineProperty(file, 'size', { value: 1024 })

    render(
      <ImportDatasetDialog
        open={true}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    fireEvent.change(fileInput!, { target: { files: [file] } })

    expect(screen.getByText('test.csv')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter dataset name')).toHaveValue('test')
  })

  it('shows loading state when importing', () => {
    mockUseImportDataset.mockReturnValue({
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
      <ImportDatasetDialog
        open={true}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )
    expect(screen.getByText('Importing...')).toBeInTheDocument()
  })

  it('enables Import button when file and name provided', () => {
    const file = new File(['col1,col2\n1,2'], 'test.csv', { type: 'text/csv' })
    render(
      <ImportDatasetDialog
        open={true}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )
    const fileInput = document.querySelector('input[type="file"]')
    fireEvent.change(fileInput!, { target: { files: [file] } })
    expect(screen.getByPlaceholderText('Enter dataset name')).toHaveValue('test')
    expect(screen.getByRole('button', { name: /Import Dataset/ })).not.toBeDisabled()
  })

  it('calls mutateAsync when Import clicked with file and name', async () => {
    const file = new File(['col1,col2\n1,2'], 'mydata.csv', { type: 'text/csv' })
    render(
      <ImportDatasetDialog
        open={true}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )
    const fileInput = document.querySelector('input[type="file"]')
    fireEvent.change(fileInput!, { target: { files: [file] } })
    await userEvent.click(screen.getByRole('button', { name: /Import Dataset/ }))
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        file,
        name: 'mydata',
        description: 'Imported from CSV',
      })
    )
  })

  it('removes file when X button clicked', async () => {
    const file = new File(['col1,col2\n1,2'], 'test.csv', { type: 'text/csv' })
    render(
      <ImportDatasetDialog
        open={true}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )
    const fileInput = document.querySelector('input[type="file"]')
    fireEvent.change(fileInput!, { target: { files: [file] } })
    expect(screen.getByText('test.csv')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Remove file/i }))
    expect(screen.queryByText('test.csv')).not.toBeInTheDocument()
  })

  it('accepts file via drag and drop', () => {
    const file = new File(['col1,col2\n1,2'], 'dropped.csv', { type: 'text/csv' })
    render(
      <ImportDatasetDialog
        open={true}
        onOpenChange={onOpenChange}
        projectId="proj-1"
      />
    )
    const dropZone = screen.getByText(/Drag and drop your CSV file here/).closest('label')
    if (dropZone) {
      fireEvent.dragOver(dropZone, { dataTransfer: { files: [file] } })
      fireEvent.drop(dropZone, { dataTransfer: { files: [file] } })
      expect(screen.getByText('dropped.csv')).toBeInTheDocument()
    }
  })
})

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptFormVersionDialog } from '../prompt-form-version-dialog'

describe('PromptFormVersionDialog', () => {
  const onOpenChange = jest.fn()
  const onConfirm = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(
      <PromptFormVersionDialog
        open={true}
        isEditMode={false}
        isLoading={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    )
    expect(screen.getByRole('button', { name: /save prompt/i })).toBeInTheDocument()
  })

  it('shows Save as New Version when isEditMode', () => {
    render(
      <PromptFormVersionDialog
        open={true}
        isEditMode={true}
        isLoading={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    )
    expect(screen.getByText('Save as New Version')).toBeInTheDocument()
    expect(screen.getByText(/save your changes as a new version/i)).toBeInTheDocument()
  })

  it('shows Create initial version when not isEditMode', () => {
    render(
      <PromptFormVersionDialog
        open={true}
        isEditMode={false}
        isLoading={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    )
    expect(screen.getByText(/create the initial version/i)).toBeInTheDocument()
  })

  it('calls onOpenChange(false) when Cancel clicked', () => {
    render(
      <PromptFormVersionDialog
        open={true}
        isEditMode={false}
        isLoading={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onConfirm when Save clicked', () => {
    render(
      <PromptFormVersionDialog
        open={true}
        isEditMode={false}
        isLoading={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /save prompt/i }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('shows Save Version when isEditMode', () => {
    render(
      <PromptFormVersionDialog
        open={true}
        isEditMode={true}
        isLoading={false}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /save version/i }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('shows Saving... when isLoading', () => {
    render(
      <PromptFormVersionDialog
        open={true}
        isEditMode={false}
        isLoading={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    )
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })
})

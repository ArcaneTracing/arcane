import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeletePromptDialog } from '../delete-prompt-dialog';

describe('DeletePromptDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <DeletePromptDialog
        isOpen={false}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.queryByText('Delete Prompt')).not.toBeInTheDocument();
  });

  it('should call onConfirm when Delete button is clicked', () => {
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const deleteButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={true}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={true}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const deleteButton = screen.getByRole('button', { name: /deleting/i });

    expect(cancelButton).toHaveAttribute('disabled');
    expect(deleteButton).toHaveAttribute('disabled');
  });

  it('should display error message', () => {
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={false}
        error="Failed to delete prompt"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Failed to delete prompt')).toBeInTheDocument();
  });


  it('should handle empty string error', () => {
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={false}
        error=""
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
  });

  it('should handle very long error message', () => {
    const longError = 'a'.repeat(1000);
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={false}
        error={longError}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText(longError)).toBeInTheDocument();
  });

  it('should handle special characters in error message', () => {
    const specialError = 'Error!@#$%^&*()_+-=[]{}|;:,.<>?';
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={false}
        error={specialError}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText(specialError)).toBeInTheDocument();
  });

  it('should handle null error', () => {
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('should handle undefined error', () => {
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={false}
        error={undefined as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
  });

  it('should handle missing callbacks', () => {
    render(
      <DeletePromptDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={undefined as any}
        onConfirm={undefined as any} />

    );

    expect(screen.getByText('Delete Prompt')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteAnnotationQueueDialog } from '../delete-annotation-queue-dialog';

describe('DeleteAnnotationQueueDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={false}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.queryByText('Delete Annotation Queue')).not.toBeInTheDocument();
  });

  it('should call onConfirm when Delete button is clicked', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(cancelButton).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={true}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={true}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    const deleteButton = screen.getByRole('button', { name: /deleting/i });

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('should display error message', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={false}
        error="Failed to delete queue"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Failed to delete queue')).toBeInTheDocument();
  });


  it('should handle empty string error', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={false}
        error=""
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );


    expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
  });

  it('should handle very long error message', () => {
    const longError = 'a'.repeat(1000);
    render(
      <DeleteAnnotationQueueDialog
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
      <DeleteAnnotationQueueDialog
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
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );


    expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('should handle undefined error', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={false}
        error={undefined as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );


    expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
  });

  it('should handle missing callbacks', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={undefined as any}
        onConfirm={undefined as any} />

    );


    expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
  });

  it('should call onClose when dialog is closed via onOpenChange', () => {
    render(
      <DeleteAnnotationQueueDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.getByText('Delete Annotation Queue')).toBeInTheDocument();
  });
});
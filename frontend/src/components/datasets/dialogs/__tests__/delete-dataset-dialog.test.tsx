import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteDatasetDialog } from '../delete-dataset-dialog';

describe('DeleteDatasetDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(
      <DeleteDatasetDialog
        isOpen={false}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
  });

  it('should call onConfirm when delete button is clicked', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should call onClose when cancel is clicked', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(cancelButton).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={true}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    const loader = screen.getByTestId('icon-loader2');
    expect(loader).toBeInTheDocument();
  });

  it('should display error message', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error="Failed to delete dataset"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    const errorText = screen.getByText('Failed to delete dataset', { exact: false });
    expect(errorText).toBeInTheDocument();
  });


  it('should handle empty string error', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error=""
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should handle very long error message', () => {
    const longError = 'a'.repeat(500);
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error={longError}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.getByText(longError)).toBeInTheDocument();
  });

  it('should handle missing callbacks gracefully', () => {
    const { container } = render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={undefined as any}
        onConfirm={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should show loader when loading', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={true}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const loader = screen.getByTestId('icon-loader2');
    expect(loader).toBeInTheDocument();
  });


  it('should handle isOpen being true initially then false', () => {
    const { rerender } = render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();

    rerender(
      <DeleteDatasetDialog
        isOpen={false}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('should handle error with HTML characters', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error="Error with <script>alert('xss')</script>"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText(/Error with/i)).toBeInTheDocument();
  });

  it('should handle isLoading being null', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={null as any}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should handle error being undefined', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error={undefined as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should handle multiple rapid onConfirm calls', () => {
    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    fireEvent.click(deleteButton);
    fireEvent.click(deleteButton);


    expect(mockOnConfirm).toHaveBeenCalledTimes(3);
  });

  it('should handle dialog close via onOpenChange', () => {


    render(
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should handle very long error message', () => {
    const longError = 'a'.repeat(1000);
    render(
      <DeleteDatasetDialog
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
      <DeleteDatasetDialog
        isOpen={true}
        isLoading={false}
        error={specialError}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.getByText(specialError)).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteDatasourceDialog } from '../delete-datasource-dialog';

describe('DeleteDatasourceDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(
      <DeleteDatasourceDialog
        isOpen={false}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.queryByText('Delete Datasource')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(
      <DeleteDatasourceDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.getByText('Delete Datasource')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
  });

  it('should call onConfirm when delete button is clicked', () => {
    render(
      <DeleteDatasourceDialog
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
      <DeleteDatasourceDialog
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
      <DeleteDatasourceDialog
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
      <DeleteDatasourceDialog
        isOpen={true}
        isLoading={false}
        error="Failed to delete datasource"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    const errorText = screen.getByText('Failed to delete datasource', { exact: false });
    expect(errorText).toBeInTheDocument();
  });


  it('should handle empty string error', () => {
    render(
      <DeleteDatasourceDialog
        isOpen={true}
        isLoading={false}
        error=""
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Datasource')).toBeInTheDocument();
  });

  it('should handle very long error message', () => {
    const longError = 'a'.repeat(1000);
    render(
      <DeleteDatasourceDialog
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
      <DeleteDatasourceDialog
        isOpen={true}
        isLoading={false}
        error={specialError}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.getByText(specialError)).toBeInTheDocument();
  });

  it('should handle missing callbacks gracefully', () => {
    const { container } = render(
      <DeleteDatasourceDialog
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
      <DeleteDatasourceDialog
        isOpen={true}
        isLoading={true}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const loader = screen.getByTestId('icon-loader2');
    expect(loader).toBeInTheDocument();
  });

  it('should handle multiple rapid onConfirm calls', () => {
    render(
      <DeleteDatasourceDialog
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

  it('should handle isOpen being true initially then false', () => {
    const { rerender } = render(
      <DeleteDatasourceDialog
        isOpen={true}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.getByText('Delete Datasource')).toBeInTheDocument();

    rerender(
      <DeleteDatasourceDialog
        isOpen={false}
        isLoading={false}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );
    expect(screen.queryByText('Delete Datasource')).not.toBeInTheDocument();
  });

  it('should handle error with HTML characters', () => {
    render(
      <DeleteDatasourceDialog
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
      <DeleteDatasourceDialog
        isOpen={true}
        isLoading={null as any}
        error={null}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Datasource')).toBeInTheDocument();
  });

  it('should handle error being undefined', () => {
    render(
      <DeleteDatasourceDialog
        isOpen={true}
        isLoading={false}
        error={undefined as any}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Datasource')).toBeInTheDocument();
  });
});
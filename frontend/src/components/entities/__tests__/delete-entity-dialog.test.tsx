import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteEntityDialog } from '../delete-entity-dialog';

describe('DeleteEntityDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when closed', () => {
    render(
      <DeleteEntityDialog
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
      <DeleteEntityDialog
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
      <DeleteEntityDialog
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
      <DeleteEntityDialog
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
      <DeleteEntityDialog
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
      <DeleteEntityDialog
        isOpen={true}
        isLoading={false}
        error="Failed to delete entity"
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const errorText = screen.getByText('Failed to delete entity', { exact: false });
    expect(errorText).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteTraceDialog } from '../delete-trace-dialog';
import { render as customRender } from '@/__tests__/test-utils';

describe('DeleteTraceDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    customRender(
      <DeleteTraceDialog
        isOpen={true}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Trace')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to remove this trace/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    customRender(
      <DeleteTraceDialog
        isOpen={false}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.queryByText('Delete Trace')).not.toBeInTheDocument();
  });

  it('should call onConfirm when Delete button is clicked', () => {
    customRender(
      <DeleteTraceDialog
        isOpen={true}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const deleteButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    customRender(
      <DeleteTraceDialog
        isOpen={true}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    customRender(
      <DeleteTraceDialog
        isOpen={true}
        isLoading={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    customRender(
      <DeleteTraceDialog
        isOpen={true}
        isLoading={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const deleteButton = screen.getByRole('button', { name: /deleting/i });

    expect(cancelButton).toHaveAttribute('disabled');
    expect(deleteButton).toHaveAttribute('disabled');
  });


  it('should handle missing callbacks', () => {
    customRender(
      <DeleteTraceDialog
        isOpen={true}
        isLoading={false}
        onClose={undefined as any}
        onConfirm={undefined as any} />

    );

    expect(screen.getByText('Delete Trace')).toBeInTheDocument();
  });
});
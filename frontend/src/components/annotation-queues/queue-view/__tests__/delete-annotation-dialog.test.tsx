import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteAnnotationDialog } from '../delete-annotation-dialog';
import { render as customRender } from '@/__tests__/test-utils';

describe('DeleteAnnotationDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    customRender(
      <DeleteAnnotationDialog
        isOpen={true}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Annotation')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this annotation/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    customRender(
      <DeleteAnnotationDialog
        isOpen={false}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.queryByText('Delete Annotation')).not.toBeInTheDocument();
  });

  it('should call onConfirm when Delete button is clicked', () => {
    customRender(
      <DeleteAnnotationDialog
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
      <DeleteAnnotationDialog
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
      <DeleteAnnotationDialog
        isOpen={true}
        isLoading={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    customRender(
      <DeleteAnnotationDialog
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
      <DeleteAnnotationDialog
        isOpen={true}
        isLoading={false}
        onClose={undefined as any}
        onConfirm={undefined as any} />

    );

    expect(screen.getByText('Delete Annotation')).toBeInTheDocument();
  });
});
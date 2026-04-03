import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConversationDialog } from '../delete-conversation-dialog';
import { render as customRender } from '@/__tests__/test-utils';

describe('DeleteConversationDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    customRender(
      <DeleteConversationDialog
        isOpen={true}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Delete Conversation')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to remove this conversation/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    customRender(
      <DeleteConversationDialog
        isOpen={false}
        isLoading={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.queryByText('Delete Conversation')).not.toBeInTheDocument();
  });

  it('should call onConfirm when Delete button is clicked', () => {
    customRender(
      <DeleteConversationDialog
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
      <DeleteConversationDialog
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
      <DeleteConversationDialog
        isOpen={true}
        isLoading={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm} />

    );

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should disable buttons when loading', () => {
    customRender(
      <DeleteConversationDialog
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
      <DeleteConversationDialog
        isOpen={true}
        isLoading={false}
        onClose={undefined as any}
        onConfirm={undefined as any} />

    );

    expect(screen.getByText('Delete Conversation')).toBeInTheDocument();
  });
});
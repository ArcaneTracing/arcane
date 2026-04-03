import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormFooter } from '../form-footer';

describe('FormFooter', () => {
  const mockOnCancel = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Cancel and Create Queue buttons in create mode', () => {
    render(
      <FormFooter
        isLoading={false}
        isEditMode={false}
        canSubmit={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Queue')).toBeInTheDocument();
  });

  it('should render Cancel and Update Queue buttons in edit mode', () => {
    render(
      <FormFooter
        isLoading={false}
        isEditMode={true}
        canSubmit={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Update Queue')).toBeInTheDocument();
  });

  it('should call onCancel when Cancel button is clicked', () => {
    render(
      <FormFooter
        isLoading={false}
        isEditMode={false}
        canSubmit={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onSubmit when Create Queue button is clicked', () => {
    render(
      <FormFooter
        isLoading={false}
        isEditMode={false}
        canSubmit={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    const submitButton = screen.getByText('Create Queue');
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should call onSubmit when Update Queue button is clicked', () => {
    render(
      <FormFooter
        isLoading={false}
        isEditMode={true}
        canSubmit={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    const submitButton = screen.getByText('Update Queue');
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should disable buttons when loading', () => {
    render(
      <FormFooter
        isLoading={true}
        isEditMode={false}
        canSubmit={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    const cancelButton = screen.getByText('Cancel');
    const submitButton = screen.getByText('Creating...');

    expect(cancelButton).toHaveAttribute('disabled');
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('should display Creating... when loading in create mode', () => {
    render(
      <FormFooter
        isLoading={true}
        isEditMode={false}
        canSubmit={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });

  it('should display Updating... when loading in edit mode', () => {
    render(
      <FormFooter
        isLoading={true}
        isEditMode={true}
        canSubmit={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('should disable submit button when canSubmit is false', () => {
    render(
      <FormFooter
        isLoading={false}
        isEditMode={false}
        canSubmit={false}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    const submitButton = screen.getByText('Create Queue');
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('should enable submit button when canSubmit is true', () => {
    render(
      <FormFooter
        isLoading={false}
        isEditMode={false}
        canSubmit={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    const submitButton = screen.getByText('Create Queue');
    expect(submitButton).not.toHaveAttribute('disabled');
  });


  it('should handle missing callbacks', () => {
    render(
      <FormFooter
        isLoading={false}
        isEditMode={false}
        canSubmit={true}
        onCancel={undefined as any}
        onSubmit={undefined as any} />

    );

    expect(screen.getByText('Create Queue')).toBeInTheDocument();
  });

  it('should handle canSubmit changing from false to true', () => {
    const { rerender } = render(
      <FormFooter
        isLoading={false}
        isEditMode={false}
        canSubmit={false}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    let submitButton = screen.getByText('Create Queue');
    expect(submitButton).toHaveAttribute('disabled');

    rerender(
      <FormFooter
        isLoading={false}
        isEditMode={false}
        canSubmit={true}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit} />

    );

    submitButton = screen.getByText('Create Queue');
    expect(submitButton).not.toHaveAttribute('disabled');
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntityDialogFooter } from '../entity-dialog-footer';

describe('EntityDialogFooter', () => {
  const mockOnPrevious = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render cancel button', () => {
    render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should render Next button on first step', () => {
    render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('should render Previous button on steps after first', () => {
    render(
      <EntityDialogFooter
        currentStep={2}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should call onNext when Next button is clicked', () => {
    render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(mockOnNext).toHaveBeenCalled();
  });

  it('should call onPrevious when Previous button is clicked', () => {
    render(
      <EntityDialogFooter
        currentStep={2}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);
    expect(mockOnPrevious).toHaveBeenCalled();
  });

  it('should render Save button on last step', () => {
    render(
      <EntityDialogFooter
        currentStep={3}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('should disable Next button when canProceed is false', () => {
    render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={3}
        isLoading={false}
        canProceed={false}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should disable Save button when canProceed is false', () => {
    render(
      <EntityDialogFooter
        currentStep={3}
        totalSteps={3}
        isLoading={false}
        canProceed={false}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('should show loading state on Save button', () => {
    render(
      <EntityDialogFooter
        currentStep={3}
        totalSteps={3}
        isLoading={true}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should show updating state when in edit mode', () => {
    render(
      <EntityDialogFooter
        currentStep={3}
        totalSteps={3}
        isLoading={true}
        canProceed={true}
        isEditMode={true}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('should disable all buttons when loading', () => {
    render(
      <EntityDialogFooter
        currentStep={2}
        totalSteps={3}
        isLoading={true}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );
    const previousButton = screen.getByText('Previous');
    const nextButton = screen.getByText('Next');
    const cancelButton = screen.getByText('Cancel');
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });


  it('should handle currentStep being 0', () => {
    render(
      <EntityDialogFooter
        currentStep={0}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );

    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
  });

  it('should handle currentStep being negative', () => {
    render(
      <EntityDialogFooter
        currentStep={-1}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should handle currentStep exceeding totalSteps', () => {
    render(
      <EntityDialogFooter
        currentStep={10}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should handle totalSteps being 0', () => {
    render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={0}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should handle totalSteps being negative', () => {
    render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={-1}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should handle canProceed being null', () => {
    render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={3}
        isLoading={false}
        canProceed={null as any}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should handle canProceed being undefined', () => {
    render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={3}
        isLoading={false}
        canProceed={undefined as any}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should handle missing onPrevious callback', () => {
    const { container } = render(
      <EntityDialogFooter
        currentStep={2}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={undefined as any}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should handle missing onNext callback', () => {
    const { container } = render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={undefined as any}
        onCancel={mockOnCancel} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should handle missing onCancel callback', () => {
    const { container } = render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={3}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should handle single step (totalSteps = 1)', () => {
    render(
      <EntityDialogFooter
        currentStep={1}
        totalSteps={1}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('should handle very large step numbers', () => {
    render(
      <EntityDialogFooter
        currentStep={999}
        totalSteps={1000}
        isLoading={false}
        canProceed={true}
        isEditMode={false}
        onPrevious={mockOnPrevious}
        onNext={mockOnNext}
        onCancel={mockOnCancel} />

    );

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });
});
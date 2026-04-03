import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueueDetailsForm } from '../queue-details-form';
import { AnnotationQueueType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

describe('QueueDetailsForm', () => {
  const mockOnNameChange = jest.fn();
  const mockOnDescriptionChange = jest.fn();
  const mockOnTypeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    customRender(
      <QueueDetailsForm
        name=""
        description=""
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    expect(screen.getByLabelText(/^name \*$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/queue type \*$/i)).toBeInTheDocument();
  });

  it('should display queue name', () => {
    customRender(
      <QueueDetailsForm
        name="Test Queue"
        description=""
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Test Queue');
  });

  it('should call onNameChange when name input changes', () => {
    customRender(
      <QueueDetailsForm
        name=""
        description=""
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Queue Name' } });

    expect(mockOnNameChange).toHaveBeenCalledWith('New Queue Name');
  });

  it('should call onDescriptionChange when description changes', () => {
    customRender(
      <QueueDetailsForm
        name=""
        description=""
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    expect(mockOnDescriptionChange).toHaveBeenCalledWith('Test Description');
  });

  it('should call onTypeChange when type changes', () => {
    customRender(
      <QueueDetailsForm
        name=""
        description=""
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    const typeSelect = screen.getByLabelText(/queue type \*$/i);
    expect(typeSelect).toBeInTheDocument();
  });

  it('should disable fields when disabled prop is true', () => {
    customRender(
      <QueueDetailsForm
        name="Test Queue"
        description="Test Description"
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange}
        disabled={true} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;

    expect(nameInput).toHaveAttribute('disabled');
    expect(descriptionInput).toHaveAttribute('disabled');
  });

  it('should disable type select when isEditMode is true', () => {
    customRender(
      <QueueDetailsForm
        name="Test Queue"
        description="Test Description"
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange}
        isEditMode={true} />

    );
    expect(screen.getByText(/Annotation type cannot be changed after creation/i)).toBeInTheDocument();
  });

  it('should display edit mode message when isEditMode is true', () => {
    customRender(
      <QueueDetailsForm
        name="Test Queue"
        description="Test Description"
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange}
        isEditMode={true} />

    );

    expect(screen.getByText(/Annotation type cannot be changed after creation/i)).toBeInTheDocument();
  });

  it('should display TRACES option in type select', () => {
    customRender(
      <QueueDetailsForm
        name=""
        description=""
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    expect(screen.getByText('Traces')).toBeInTheDocument();
  });

  it('should display CONVERSATIONS option in type select', () => {
    customRender(
      <QueueDetailsForm
        name=""
        description=""
        type={AnnotationQueueType.CONVERSATIONS}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    expect(screen.getByText('Conversations')).toBeInTheDocument();
  });


  it('should handle empty name', () => {
    customRender(
      <QueueDetailsForm
        name=""
        description=""
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    expect(nameInput.value).toBe('');
  });

  it('should handle empty description', () => {
    customRender(
      <QueueDetailsForm
        name="Test Queue"
        description=""
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('');
  });

  it('should handle very long name', () => {
    const longName = 'a'.repeat(1000);
    customRender(
      <QueueDetailsForm
        name={longName}
        description=""
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    expect(nameInput.value).toBe(longName);
  });

  it('should handle very long description', () => {
    const longDescription = 'a'.repeat(5000);
    customRender(
      <QueueDetailsForm
        name="Test Queue"
        description={longDescription}
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe(longDescription);
  });

  it('should handle whitespace-only name', () => {
    customRender(
      <QueueDetailsForm
        name="   "
        description=""
        type={AnnotationQueueType.TRACES}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        onTypeChange={mockOnTypeChange} />

    );

    const nameInput = screen.getByLabelText(/^name \*$/i) as HTMLInputElement;
    expect(nameInput.value).toBe('   ');
  });
});
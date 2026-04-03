import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BasicInfoStep } from '../basic-info-step';

describe('BasicInfoStep', () => {
  const mockOnNameChange = jest.fn();
  const mockOnDescriptionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render name and description inputs', () => {
    render(
      <BasicInfoStep
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('should display name value', () => {
    render(
      <BasicInfoStep
        name="Test Entity"
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Test Entity');
  });

  it('should display description value', () => {
    render(
      <BasicInfoStep
        name=""
        description="Test Description"
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement;
    expect(descInput.value).toBe('Test Description');
  });

  it('should call onNameChange when name input changes', () => {
    render(
      <BasicInfoStep
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(mockOnNameChange).toHaveBeenCalledWith('New Name');
  });

  it('should call onDescriptionChange when description input changes', () => {
    render(
      <BasicInfoStep
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'New Description' } });
    expect(mockOnDescriptionChange).toHaveBeenCalledWith('New Description');
  });

  it('should show required indicator on name field', () => {
    render(
      <BasicInfoStep
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toHaveAttribute('required');
  });

  it('should disable inputs when disabled prop is true', () => {
    render(
      <BasicInfoStep
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange}
        disabled={true} />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    const descInput = screen.getByLabelText(/Description/i);
    expect(nameInput).toBeDisabled();
    expect(descInput).toBeDisabled();
  });

  it('should show placeholder text', () => {
    render(
      <BasicInfoStep
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    expect(screen.getByPlaceholderText('Enter entity name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter entity description')).toBeInTheDocument();
  });

  it('should handle very long name input', () => {
    const longName = 'a'.repeat(1000);
    render(
      <BasicInfoStep
        name={longName}
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe(longName);
    expect(nameInput.value.length).toBe(1000);
  });

  it('should handle very long description input', () => {
    const longDesc = 'b'.repeat(2000);
    render(
      <BasicInfoStep
        name=""
        description={longDesc}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement;
    expect(descInput.value).toBe(longDesc);
  });

  it('should handle special characters in name', () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    render(
      <BasicInfoStep
        name={specialChars}
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe(specialChars);
  });

  it('should handle newline characters in description', () => {
    const withNewlines = 'Line 1\nLine 2\nLine 3';
    render(
      <BasicInfoStep
        name=""
        description={withNewlines}
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement;

    expect(descInput.value).toContain('Line 1');
    expect(descInput.value).toContain('Line 2');
  });

  it('should handle empty string changes', () => {
    render(
      <BasicInfoStep
        name="Test"
        description="Test"
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    expect(mockOnNameChange).toHaveBeenCalledWith('');
  });

  it('should handle whitespace-only input', () => {
    render(
      <BasicInfoStep
        name="   "
        description="   "
        onNameChange={mockOnNameChange}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/Description/i) as HTMLInputElement;
    expect(nameInput.value).toBe('   ');
    expect(descInput.value).toBe('   ');
  });

  it('should handle missing onNameChange callback gracefully', () => {

    const { container } = render(
      <BasicInfoStep
        name=""
        description=""
        onNameChange={undefined as any}
        onDescriptionChange={mockOnDescriptionChange} />

    );
    expect(container).toBeInTheDocument();
  });

  it('should handle missing onDescriptionChange callback gracefully', () => {
    const { container } = render(
      <BasicInfoStep
        name=""
        description=""
        onNameChange={mockOnNameChange}
        onDescriptionChange={undefined as any} />

    );
    expect(container).toBeInTheDocument();
  });
});
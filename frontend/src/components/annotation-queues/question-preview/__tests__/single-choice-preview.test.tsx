import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SingleChoicePreview } from '../single-choice-preview';
import { render as customRender } from '@/__tests__/test-utils';

describe('SingleChoicePreview', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render options when provided', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Option 1', 'Option 2', 'Option 3']}
        onChange={mockOnChange} />

    );

    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
  });

  it('should display empty message when no options', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={[]}
        onChange={mockOnChange} />

    );

    expect(screen.getByText('No options configured')).toBeInTheDocument();
  });

  it('should display custom empty message when provided', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={[]}
        emptyMessage="Custom empty message"
        onChange={mockOnChange} />

    );

    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('should call onChange when option is selected', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Option 1', 'Option 2']}
        onChange={mockOnChange} />

    );

    const option1 = screen.getByLabelText('Option 1');
    fireEvent.click(option1);

    expect(mockOnChange).toHaveBeenCalledWith('Option 1');
  });

  it('should display selected value when value prop is provided', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Option 1', 'Option 2']}
        value="Option 2"
        onChange={mockOnChange} />

    );

    const option2 = screen.getByLabelText('Option 2') as HTMLInputElement;
    expect(option2).toBeChecked();
  });

  it('should be disabled when disabled prop is true', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Option 1', 'Option 2']}
        onChange={mockOnChange}
        disabled={true} />

    );

    const option1 = screen.getByLabelText('Option 1');
    expect(option1).toHaveAttribute('disabled');
  });

  it('should be disabled when onChange is not provided', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Option 1', 'Option 2']} />

    );

    const option1 = screen.getByLabelText('Option 1');
    expect(option1).toHaveAttribute('disabled');
  });

  it('should be enabled when onChange is provided and disabled is false', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Option 1', 'Option 2']}
        onChange={mockOnChange}
        disabled={false} />

    );

    const option1 = screen.getByLabelText('Option 1');
    expect(option1).not.toHaveAttribute('disabled');
  });

  it('should handle switching between options', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Option 1', 'Option 2']}
        value="Option 1"
        onChange={mockOnChange} />

    );

    const option2 = screen.getByLabelText('Option 2');
    fireEvent.click(option2);

    expect(mockOnChange).toHaveBeenCalledWith('Option 2');
  });


  it('should handle empty options array', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={[]}
        onChange={mockOnChange} />

    );

    expect(screen.getByText('No options configured')).toBeInTheDocument();
  });

  it('should handle single option', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Only Option']}
        onChange={mockOnChange} />

    );

    expect(screen.getByLabelText('Only Option')).toBeInTheDocument();
  });

  it('should handle many options', () => {
    const manyOptions = Array.from({ length: 20 }, (_, i) => `Option ${i + 1}`);
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={manyOptions}
        onChange={mockOnChange} />

    );

    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 20')).toBeInTheDocument();
  });

  it('should handle options with special characters', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Option!@#$%', 'Option&*()']}
        onChange={mockOnChange} />

    );

    expect(screen.getByLabelText('Option!@#$%')).toBeInTheDocument();
    expect(screen.getByLabelText('Option&*()')).toBeInTheDocument();
  });

  it('should handle undefined value', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Option 1', 'Option 2']}
        value={undefined}
        onChange={mockOnChange} />

    );

    const option1 = screen.getByLabelText('Option 1') as HTMLInputElement;
    const option2 = screen.getByLabelText('Option 2') as HTMLInputElement;
    expect(option1).not.toBeChecked();
    expect(option2).not.toBeChecked();
  });

  it('should handle empty string value', () => {
    customRender(
      <SingleChoicePreview
        questionId="question-1"
        options={['Option 1', 'Option 2']}
        value=""
        onChange={mockOnChange} />

    );

    const option1 = screen.getByLabelText('Option 1') as HTMLInputElement;
    const option2 = screen.getByLabelText('Option 2') as HTMLInputElement;
    expect(option1).not.toBeChecked();
    expect(option2).not.toBeChecked();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BooleanPreview } from '../boolean-preview';
import { render as customRender } from '@/__tests__/test-utils';

describe('BooleanPreview', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render Yes and No options', () => {
    customRender(
      <BooleanPreview
        questionId="question-1"
        onChange={mockOnChange} />

    );

    expect(screen.getByLabelText('Yes')).toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeInTheDocument();
  });

  it('should call onChange with true when Yes is selected', () => {
    customRender(
      <BooleanPreview
        questionId="question-1"
        onChange={mockOnChange} />

    );

    const yesOption = screen.getByLabelText('Yes');
    fireEvent.click(yesOption);

    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('should call onChange with false when No is selected', () => {
    customRender(
      <BooleanPreview
        questionId="question-1"
        onChange={mockOnChange} />

    );

    const noOption = screen.getByLabelText('No');
    fireEvent.click(noOption);

    expect(mockOnChange).toHaveBeenCalledWith(false);
  });

  it('should display selected value when value prop is provided', () => {
    customRender(
      <BooleanPreview
        questionId="question-1"
        value={true}
        onChange={mockOnChange} />

    );

    const yesOption = screen.getByLabelText('Yes') as HTMLInputElement;
    expect(yesOption).toBeChecked();
  });

  it('should be disabled when disabled prop is true', () => {
    customRender(
      <BooleanPreview
        questionId="question-1"
        onChange={mockOnChange}
        disabled={true} />

    );

    const yesOption = screen.getByLabelText('Yes');
    const noOption = screen.getByLabelText('No');

    expect(yesOption).toHaveAttribute('disabled');
    expect(noOption).toHaveAttribute('disabled');
  });

  it('should be disabled when onChange is not provided', () => {
    customRender(
      <BooleanPreview
        questionId="question-1" />

    );

    const yesOption = screen.getByLabelText('Yes');
    const noOption = screen.getByLabelText('No');

    expect(yesOption).toHaveAttribute('disabled');
    expect(noOption).toHaveAttribute('disabled');
  });

  it('should be enabled when onChange is provided and disabled is false', () => {
    customRender(
      <BooleanPreview
        questionId="question-1"
        onChange={mockOnChange}
        disabled={false} />

    );

    const yesOption = screen.getByLabelText('Yes');
    const noOption = screen.getByLabelText('No');

    expect(yesOption).not.toHaveAttribute('disabled');
    expect(noOption).not.toHaveAttribute('disabled');
  });


  it('should handle undefined value', () => {
    customRender(
      <BooleanPreview
        questionId="question-1"
        value={undefined}
        onChange={mockOnChange} />

    );

    expect(screen.getByLabelText('Yes')).toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeInTheDocument();
  });

  it('should handle null value', () => {
    customRender(
      <BooleanPreview
        questionId="question-1"
        value={null as any}
        onChange={mockOnChange} />

    );

    expect(screen.getByLabelText('Yes')).toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeInTheDocument();
  });

  it('should handle switching from Yes to No', () => {
    customRender(
      <BooleanPreview
        questionId="question-1"
        value={true}
        onChange={mockOnChange} />

    );

    const noOption = screen.getByLabelText('No');
    fireEvent.click(noOption);

    expect(mockOnChange).toHaveBeenCalledWith(false);
  });

  it('should handle switching from No to Yes', () => {
    customRender(
      <BooleanPreview
        questionId="question-1"
        value={false}
        onChange={mockOnChange} />

    );

    const yesOption = screen.getByLabelText('Yes');
    fireEvent.click(yesOption);

    expect(mockOnChange).toHaveBeenCalledWith(true);
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumericPreview } from '../numeric-preview';
import { render as customRender } from '@/__tests__/test-utils';

describe('NumericPreview', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render number input', () => {
    customRender(
      <NumericPreview onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText(/Enter a number/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
  });

  it('should display placeholder text', () => {
    customRender(
      <NumericPreview
        placeholder="Custom placeholder"
        onChange={mockOnChange} />

    );

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('should use default placeholder when not provided', () => {
    customRender(
      <NumericPreview onChange={mockOnChange} />
    );

    expect(screen.getByPlaceholderText('Enter a number')).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    customRender(
      <NumericPreview onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText(/Enter a number/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '42' } });

    expect(mockOnChange).toHaveBeenCalledWith(42);
  });

  it('should call onChange with undefined when input is cleared', () => {
    customRender(
      <NumericPreview
        value={42}
        onChange={mockOnChange} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith(undefined);
  });

  it('should display value when value prop is provided', () => {
    customRender(
      <NumericPreview
        value={42}
        onChange={mockOnChange} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i) as HTMLInputElement;
    expect(input.value).toBe('42');
  });

  it('should set min attribute when min prop is provided', () => {
    customRender(
      <NumericPreview
        min={0}
        onChange={mockOnChange} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i);
    expect(input).toHaveAttribute('min', '0');
  });

  it('should set max attribute when max prop is provided', () => {
    customRender(
      <NumericPreview
        max={100}
        onChange={mockOnChange} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i);
    expect(input).toHaveAttribute('max', '100');
  });

  it('should be disabled when disabled prop is true', () => {
    customRender(
      <NumericPreview
        onChange={mockOnChange}
        disabled={true} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i);
    expect(input).toHaveAttribute('disabled');
  });

  it('should be disabled when onChange is not provided', () => {
    customRender(
      <NumericPreview />
    );

    const input = screen.getByPlaceholderText(/Enter a number/i);
    expect(input).toHaveAttribute('disabled');
  });

  it('should be enabled when onChange is provided and disabled is false', () => {
    customRender(
      <NumericPreview
        onChange={mockOnChange}
        disabled={false} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i);
    expect(input).not.toHaveAttribute('disabled');
  });


  it('should handle undefined value', () => {
    customRender(
      <NumericPreview
        value={undefined}
        onChange={mockOnChange} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should handle zero value', () => {
    customRender(
      <NumericPreview
        value={0}
        onChange={mockOnChange} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i) as HTMLInputElement;


    expect(input.value).toBe('');
  });

  it('should handle negative numbers', () => {
    customRender(
      <NumericPreview
        value={-42}
        onChange={mockOnChange} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i) as HTMLInputElement;
    expect(input.value).toBe('-42');
  });

  it('should handle decimal numbers', () => {
    customRender(
      <NumericPreview
        value={3.14}
        onChange={mockOnChange} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i) as HTMLInputElement;
    expect(input.value).toBe('3.14');
  });

  it('should handle very large numbers', () => {
    const largeNumber = 999999999;
    customRender(
      <NumericPreview
        value={largeNumber}
        onChange={mockOnChange} />

    );

    const input = screen.getByPlaceholderText(/Enter a number/i) as HTMLInputElement;
    expect(input.value).toBe('999999999');
  });

  it('should convert string input to number', () => {
    customRender(
      <NumericPreview onChange={mockOnChange} />
    );

    const input = screen.getByPlaceholderText(/Enter a number/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '123' } });

    expect(mockOnChange).toHaveBeenCalledWith(123);
  });
});
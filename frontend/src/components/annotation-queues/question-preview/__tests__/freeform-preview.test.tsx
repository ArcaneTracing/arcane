import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FreeformPreview } from '../freeform-preview';
import { render as customRender } from '@/__tests__/test-utils';

describe('FreeformPreview', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render textarea', () => {
    customRender(
      <FreeformPreview onChange={mockOnChange} />
    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i);
    expect(textarea).toBeInTheDocument();
  });

  it('should display placeholder text', () => {
    customRender(
      <FreeformPreview
        placeholder="Custom placeholder"
        onChange={mockOnChange} />

    );

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('should use default placeholder when not provided', () => {
    customRender(
      <FreeformPreview onChange={mockOnChange} />
    );

    expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument();
  });

  it('should call onChange when value changes', () => {
    customRender(
      <FreeformPreview onChange={mockOnChange} />
    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Test answer' } });

    expect(mockOnChange).toHaveBeenCalledWith('Test answer');
  });

  it('should display value when value prop is provided', () => {
    customRender(
      <FreeformPreview
        value="Existing answer"
        onChange={mockOnChange} />

    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Existing answer');
  });

  it('should be disabled when disabled prop is true', () => {
    customRender(
      <FreeformPreview
        onChange={mockOnChange}
        disabled={true} />

    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i);
    expect(textarea).toHaveAttribute('disabled');
  });

  it('should be disabled when onChange is not provided', () => {
    customRender(
      <FreeformPreview />
    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i);
    expect(textarea).toHaveAttribute('disabled');
  });

  it('should be enabled when onChange is provided and disabled is false', () => {
    customRender(
      <FreeformPreview
        onChange={mockOnChange}
        disabled={false} />

    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i);
    expect(textarea).not.toHaveAttribute('disabled');
  });


  it('should handle empty value', () => {
    customRender(
      <FreeformPreview
        value=""
        onChange={mockOnChange} />

    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });

  it('should handle undefined value', () => {
    customRender(
      <FreeformPreview
        value={undefined}
        onChange={mockOnChange} />

    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });

  it('should handle very long text', () => {
    const longText = 'a'.repeat(10000);
    customRender(
      <FreeformPreview
        value={longText}
        onChange={mockOnChange} />

    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe(longText);
  });

  it('should handle special characters', () => {
    const specialText = 'Text!@#$%^&*()_+-=[]{}|;:,.<>?';
    customRender(
      <FreeformPreview
        value={specialText}
        onChange={mockOnChange} />

    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe(specialText);
  });

  it('should handle newlines in text', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3';
    customRender(
      <FreeformPreview
        value={multilineText}
        onChange={mockOnChange} />

    );

    const textarea = screen.getByPlaceholderText(/Enter your answer/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe(multilineText);
  });
});
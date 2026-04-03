import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanonicalMessageMatchingStep } from '../canonical-message-matching-step';
import { CanonicalMessageMatchingConfiguration } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

describe('CanonicalMessageMatchingStep', () => {
  const mockOnConfigurationChange = jest.fn();

  const defaultConfiguration: CanonicalMessageMatchingConfiguration = {
    inputAttributeKey: '',
    outputAttributeKey: ''
  };

  const defaultProps = {
    configuration: defaultConfiguration,
    onConfigurationChange: mockOnConfigurationChange,
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render both input fields', () => {
    customRender(<CanonicalMessageMatchingStep {...defaultProps} />);

    expect(screen.getByLabelText(/input attribute key \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/output attribute key \*/i)).toBeInTheDocument();
  });

  it('should display input attribute key value', () => {
    const config: CanonicalMessageMatchingConfiguration = {
      inputAttributeKey: 'llm.input.messages',
      outputAttributeKey: ''
    };

    customRender(<CanonicalMessageMatchingStep {...defaultProps} configuration={config} />);

    const input = screen.getByLabelText(/input attribute key \*/i) as HTMLInputElement;
    expect(input.value).toBe('llm.input.messages');
  });

  it('should display output attribute key value', () => {
    const config: CanonicalMessageMatchingConfiguration = {
      inputAttributeKey: '',
      outputAttributeKey: 'llm.output.messages'
    };

    customRender(<CanonicalMessageMatchingStep {...defaultProps} configuration={config} />);

    const input = screen.getByLabelText(/output attribute key \*/i) as HTMLInputElement;
    expect(input.value).toBe('llm.output.messages');
  });

  it('should call onConfigurationChange when input attribute key changes', () => {
    customRender(<CanonicalMessageMatchingStep {...defaultProps} />);

    const input = screen.getByLabelText(/input attribute key \*/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'llm.input.messages' } });

    expect(mockOnConfigurationChange).toHaveBeenCalledWith({
      inputAttributeKey: 'llm.input.messages',
      outputAttributeKey: ''
    });
  });

  it('should call onConfigurationChange when output attribute key changes', () => {
    customRender(<CanonicalMessageMatchingStep {...defaultProps} />);

    const input = screen.getByLabelText(/output attribute key \*/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'llm.output.messages' } });

    expect(mockOnConfigurationChange).toHaveBeenCalledWith({
      inputAttributeKey: '',
      outputAttributeKey: 'llm.output.messages'
    });
  });

  it('should preserve other fields when updating input attribute key', () => {
    const config: CanonicalMessageMatchingConfiguration = {
      inputAttributeKey: 'old.input',
      outputAttributeKey: 'existing.output'
    };

    customRender(<CanonicalMessageMatchingStep {...defaultProps} configuration={config} />);

    const input = screen.getByLabelText(/input attribute key \*/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new.input' } });

    expect(mockOnConfigurationChange).toHaveBeenCalledWith({
      inputAttributeKey: 'new.input',
      outputAttributeKey: 'existing.output'
    });
  });

  it('should preserve other fields when updating output attribute key', () => {
    const config: CanonicalMessageMatchingConfiguration = {
      inputAttributeKey: 'existing.input',
      outputAttributeKey: 'old.output'
    };

    customRender(<CanonicalMessageMatchingStep {...defaultProps} configuration={config} />);

    const output = screen.getByLabelText(/output attribute key \*/i) as HTMLInputElement;
    fireEvent.change(output, { target: { value: 'new.output' } });

    expect(mockOnConfigurationChange).toHaveBeenCalledWith({
      inputAttributeKey: 'existing.input',
      outputAttributeKey: 'new.output'
    });
  });

  it('should disable inputs when disabled prop is true', () => {
    customRender(<CanonicalMessageMatchingStep {...defaultProps} disabled={true} />);

    const inputKey = screen.getByLabelText(/input attribute key \*/i);
    const outputKey = screen.getByLabelText(/output attribute key \*/i);

    expect(inputKey).toHaveAttribute('disabled');
    expect(outputKey).toHaveAttribute('disabled');
  });

  it('should display placeholder text', () => {
    customRender(<CanonicalMessageMatchingStep {...defaultProps} />);

    const inputKey = screen.getByLabelText(/input attribute key \*/i) as HTMLInputElement;
    const outputKey = screen.getByLabelText(/output attribute key \*/i) as HTMLInputElement;

    expect(inputKey.placeholder).toBe('e.g., llm.input.messages');
    expect(outputKey.placeholder).toBe('e.g., llm.output.messages');
  });

  it('should display help text', () => {
    customRender(<CanonicalMessageMatchingStep {...defaultProps} />);

    expect(screen.getByText(/the span attribute key that contains input messages/i)).toBeInTheDocument();
    expect(screen.getByText(/the span attribute key that contains output messages/i)).toBeInTheDocument();
  });

  it('should mark fields as required', () => {
    customRender(<CanonicalMessageMatchingStep {...defaultProps} />);

    const inputKey = screen.getByLabelText(/input attribute key \*/i);
    const outputKey = screen.getByLabelText(/output attribute key \*/i);

    expect(inputKey).toHaveAttribute('required');
    expect(outputKey).toHaveAttribute('required');
  });

  it('should handle empty values', () => {
    customRender(<CanonicalMessageMatchingStep {...defaultProps} />);

    const inputKey = screen.getByLabelText(/input attribute key \*/i) as HTMLInputElement;
    const outputKey = screen.getByLabelText(/output attribute key \*/i) as HTMLInputElement;

    expect(inputKey.value).toBe('');
    expect(outputKey.value).toBe('');
  });

  it('should handle special characters in attribute keys', () => {
    const config: CanonicalMessageMatchingConfiguration = {
      inputAttributeKey: 'llm.input.messages[0]',
      outputAttributeKey: 'llm.output.messages[0]'
    };

    customRender(<CanonicalMessageMatchingStep {...defaultProps} configuration={config} />);

    const inputKey = screen.getByLabelText(/input attribute key \*/i) as HTMLInputElement;
    const outputKey = screen.getByLabelText(/output attribute key \*/i) as HTMLInputElement;

    expect(inputKey.value).toBe('llm.input.messages[0]');
    expect(outputKey.value).toBe('llm.output.messages[0]');
  });
});
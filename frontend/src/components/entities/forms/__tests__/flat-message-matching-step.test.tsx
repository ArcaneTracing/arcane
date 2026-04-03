import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlatMessageMatchingStep } from '../flat-message-matching-step';
import { FlatMessageMatchingConfiguration } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

describe('FlatMessageMatchingStep', () => {
  const mockOnConfigurationChange = jest.fn();

  const defaultConfiguration: FlatMessageMatchingConfiguration = {
    flatInputMessageMatchingKeys: {
      rolePattern: '',
      contentPattern: '',
      namePattern: '',
      toolMessageCallIdPattern: '',
      toolCallFunctionNamePattern: '',
      toolCallIdPattern: '',
      toolCallFunctionArgumentPattern: ''
    },
    flatOutputMessageMatchingKeys: {
      rolePattern: '',
      contentPattern: '',
      namePattern: '',
      toolMessageCallIdPattern: '',
      toolCallFunctionNamePattern: '',
      toolCallIdPattern: '',
      toolCallFunctionArgumentPattern: ''
    }
  };

  const defaultProps = {
    configuration: defaultConfiguration,
    onConfigurationChange: mockOnConfigurationChange,
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input message matching keys section', () => {
    customRender(<FlatMessageMatchingStep {...defaultProps} />);

    expect(screen.getByText(/input message matching keys/i)).toBeInTheDocument();
  });

  it('should render output message matching keys section', () => {
    customRender(<FlatMessageMatchingStep {...defaultProps} />);

    expect(screen.getByText(/output message matching keys/i)).toBeInTheDocument();
  });

  it('should render all input pattern fields', () => {
    customRender(<FlatMessageMatchingStep {...defaultProps} />);


    expect(screen.getAllByLabelText(/^role pattern$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^content pattern$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^name pattern$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^tool message call pattern$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^tool call function name pattern$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^tool call id pattern$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^tool call function argument pattern$/i).length).toBeGreaterThan(0);
  });

  it('should render all output pattern fields', () => {
    customRender(<FlatMessageMatchingStep {...defaultProps} />);


    const rolePatterns = screen.getAllByLabelText(/^role pattern$/i);
    const contentPatterns = screen.getAllByLabelText(/^content pattern$/i);
    const namePatterns = screen.getAllByLabelText(/^name pattern$/i);
    const toolMessageCallPatterns = screen.getAllByLabelText(/^tool message call pattern$/i);
    const toolCallFunctionNamePatterns = screen.getAllByLabelText(/^tool call function name pattern$/i);
    const toolCallIdPatterns = screen.getAllByLabelText(/^tool call id pattern$/i);
    const toolCallFunctionArgumentPatterns = screen.getAllByLabelText(/^tool call function argument pattern$/i);

    expect(rolePatterns.length).toBe(2);
    expect(contentPatterns.length).toBe(2);
    expect(namePatterns.length).toBe(2);
    expect(toolMessageCallPatterns.length).toBe(2);
    expect(toolCallFunctionNamePatterns.length).toBe(2);
    expect(toolCallIdPatterns.length).toBe(2);
    expect(toolCallFunctionArgumentPatterns.length).toBe(2);
  });

  it('should display input role pattern value', () => {
    const config: FlatMessageMatchingConfiguration = {
      ...defaultConfiguration,
      flatInputMessageMatchingKeys: {
        ...defaultConfiguration.flatInputMessageMatchingKeys,
        rolePattern: 'message.role'
      }
    };

    customRender(<FlatMessageMatchingStep {...defaultProps} configuration={config} />);

    const inputs = screen.getAllByLabelText(/^role pattern$/i) as HTMLInputElement[];

    expect(inputs[0].value).toBe('message.role');
  });

  it('should display output content pattern value', () => {
    const config: FlatMessageMatchingConfiguration = {
      ...defaultConfiguration,
      flatOutputMessageMatchingKeys: {
        ...defaultConfiguration.flatOutputMessageMatchingKeys,
        contentPattern: 'message.content'
      }
    };

    customRender(<FlatMessageMatchingStep {...defaultProps} configuration={config} />);

    const inputs = screen.getAllByLabelText(/^content pattern$/i) as HTMLInputElement[];

    expect(inputs[1].value).toBe('message.content');
  });

  it('should call onConfigurationChange when input role pattern changes', () => {
    customRender(<FlatMessageMatchingStep {...defaultProps} />);


    const inputs = screen.getAllByLabelText(/^role pattern$/i) as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: 'message.role' } });

    expect(mockOnConfigurationChange).toHaveBeenCalledWith({
      ...defaultConfiguration,
      flatInputMessageMatchingKeys: {
        ...defaultConfiguration.flatInputMessageMatchingKeys,
        rolePattern: 'message.role'
      }
    });
  });

  it('should call onConfigurationChange when output content pattern changes', () => {
    customRender(<FlatMessageMatchingStep {...defaultProps} />);

    const inputs = screen.getAllByLabelText(/^content pattern$/i) as HTMLInputElement[];

    fireEvent.change(inputs[1], { target: { value: 'message.content' } });

    expect(mockOnConfigurationChange).toHaveBeenCalledWith({
      ...defaultConfiguration,
      flatOutputMessageMatchingKeys: {
        ...defaultConfiguration.flatOutputMessageMatchingKeys,
        contentPattern: 'message.content'
      }
    });
  });

  it('should preserve other fields when updating a single pattern', () => {
    const config: FlatMessageMatchingConfiguration = {
      ...defaultConfiguration,
      flatInputMessageMatchingKeys: {
        rolePattern: 'existing.role',
        contentPattern: 'existing.content',
        namePattern: 'existing.name',
        toolMessageCallIdPattern: 'existing.toolCall',
        toolCallFunctionNamePattern: 'existing.function',
        toolCallIdPattern: 'existing.id',
        toolCallFunctionArgumentPattern: 'existing.arg'
      }
    };

    customRender(<FlatMessageMatchingStep {...defaultProps} configuration={config} />);


    const inputs = screen.getAllByLabelText(/^role pattern$/i) as HTMLInputElement[];
    fireEvent.change(inputs[0], { target: { value: 'new.role' } });

    expect(mockOnConfigurationChange).toHaveBeenCalledWith({
      ...config,
      flatInputMessageMatchingKeys: {
        ...config.flatInputMessageMatchingKeys,
        rolePattern: 'new.role'
      }
    });
  });

  it('should disable all inputs when disabled prop is true', () => {
    customRender(<FlatMessageMatchingStep {...defaultProps} disabled={true} />);

    const roleInputs = screen.getAllByLabelText(/^role pattern$/i);
    const contentInputs = screen.getAllByLabelText(/^content pattern$/i);

    expect(roleInputs[0]).toHaveAttribute('disabled');
    expect(contentInputs[0]).toHaveAttribute('disabled');
  });

  it('should display placeholder text for all fields', () => {
    customRender(<FlatMessageMatchingStep {...defaultProps} />);

    const roleInputs = screen.getAllByLabelText(/^role pattern$/i) as HTMLInputElement[];
    expect(roleInputs[0].placeholder).toBe('e.g., message.role');
  });

  it('should handle all tool-related patterns', () => {
    const config: FlatMessageMatchingConfiguration = {
      ...defaultConfiguration,
      flatInputMessageMatchingKeys: {
        ...defaultConfiguration.flatInputMessageMatchingKeys,
        toolMessageCallIdPattern: 'tool.message.call',
        toolCallFunctionNamePattern: 'tool.call.function.name',
        toolCallIdPattern: 'tool.call.id',
        toolCallFunctionArgumentPattern: 'tool.call.function.argument'
      }
    };

    customRender(<FlatMessageMatchingStep {...defaultProps} configuration={config} />);

    expect(screen.getAllByLabelText(/^tool message call pattern$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^tool call function name pattern$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^tool call id pattern$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/^tool call function argument pattern$/i).length).toBeGreaterThan(0);
  });

  it('should handle empty values', () => {
    customRender(<FlatMessageMatchingStep {...defaultProps} />);

    const roleInputs = screen.getAllByLabelText(/^role pattern$/i) as HTMLInputElement[];
    expect(roleInputs[0].value).toBe('');
  });

  it('should handle special characters in patterns', () => {
    const config: FlatMessageMatchingConfiguration = {
      ...defaultConfiguration,
      flatInputMessageMatchingKeys: {
        ...defaultConfiguration.flatInputMessageMatchingKeys,
        rolePattern: 'message.role[0].value'
      }
    };

    customRender(<FlatMessageMatchingStep {...defaultProps} configuration={config} />);

    const inputs = screen.getAllByLabelText(/^role pattern$/i) as HTMLInputElement[];

    expect(inputs[0].value).toBe('message.role[0].value');
  });
});
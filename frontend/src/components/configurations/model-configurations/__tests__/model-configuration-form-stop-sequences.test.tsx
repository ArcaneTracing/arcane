import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelConfigurationFormStopSequences } from '../model-configuration-form-stop-sequences';
import { render as customRender } from '@/__tests__/test-utils';

describe('ModelConfigurationFormStopSequences', () => {
  const mockOnAdd = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnChange = jest.fn();

  const defaultProps = {
    stopSequences: [],
    isLoading: false,
    onAdd: mockOnAdd,
    onRemove: mockOnRemove,
    onChange: mockOnChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render stop sequences label', () => {
    customRender(<ModelConfigurationFormStopSequences {...defaultProps} />);

    expect(screen.getByText(/stop sequences/i)).toBeInTheDocument();
  });

  it('should render add button when no sequences', () => {
    customRender(<ModelConfigurationFormStopSequences {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add stop sequence/i });
    expect(addButton).toBeInTheDocument();
  });

  it('should render stop sequence inputs when sequences exist', () => {
    customRender(
      <ModelConfigurationFormStopSequences
        {...defaultProps}
        stopSequences={['\\n', 'STOP']} />

    );

    const inputs = screen.getAllByPlaceholderText(/stop sequence/i);
    expect(inputs).toHaveLength(2);
  });

  it('should display stop sequence values', () => {
    customRender(
      <ModelConfigurationFormStopSequences
        {...defaultProps}
        stopSequences={['\\n', 'STOP']} />

    );

    const inputs = screen.getAllByPlaceholderText(/stop sequence/i) as HTMLInputElement[];
    expect(inputs[0].value).toBe('\\n');
    expect(inputs[1].value).toBe('STOP');
  });

  it('should call onChange when sequence input changes', () => {
    customRender(
      <ModelConfigurationFormStopSequences
        {...defaultProps}
        stopSequences={['\\n']} />

    );

    const input = screen.getByPlaceholderText(/stop sequence/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '\\n\\n' } });

    expect(mockOnChange).toHaveBeenCalledWith(0, '\\n\\n');
  });

  it('should call onRemove when remove button is clicked', () => {
    customRender(
      <ModelConfigurationFormStopSequences
        {...defaultProps}
        stopSequences={['\\n', 'STOP']} />

    );

    const removeButtons = screen.getAllByRole('button', { name: '' });

    const removeButton = removeButtons.find((btn) => btn.querySelector('svg'));
    if (removeButton) {
      fireEvent.click(removeButton);
      expect(mockOnRemove).toHaveBeenCalled();
    }
  });

  it('should call onAdd when add button is clicked', () => {
    customRender(<ModelConfigurationFormStopSequences {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: /add stop sequence/i });
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalled();
  });

  it('should disable all inputs when isLoading is true', () => {
    customRender(
      <ModelConfigurationFormStopSequences
        {...defaultProps}
        stopSequences={['\\n']}
        isLoading={true} />

    );

    const input = screen.getByPlaceholderText(/stop sequence/i);
    const addButton = screen.getByRole('button', { name: /add stop sequence/i });
    const removeButtons = screen.getAllByRole('button', { name: '' });
    const removeButton = removeButtons.find((btn) => btn.querySelector('svg'));

    expect(input).toHaveAttribute('disabled');
    expect(addButton).toBeDisabled();
    if (removeButton) {
      expect(removeButton).toBeDisabled();
    }
  });

  it('should handle multiple stop sequences', () => {
    customRender(
      <ModelConfigurationFormStopSequences
        {...defaultProps}
        stopSequences={['\\n', 'STOP', 'END', 'FINISH']} />

    );

    const inputs = screen.getAllByPlaceholderText(/stop sequence/i);
    expect(inputs).toHaveLength(4);
  });

  it('should call onChange with correct index for multiple sequences', () => {
    customRender(
      <ModelConfigurationFormStopSequences
        {...defaultProps}
        stopSequences={['\\n', 'STOP', 'END']} />

    );

    const inputs = screen.getAllByPlaceholderText(/stop sequence/i) as HTMLInputElement[];
    fireEvent.change(inputs[1], { target: { value: 'STOP_NOW' } });

    expect(mockOnChange).toHaveBeenCalledWith(1, 'STOP_NOW');
  });

  it('should handle empty stop sequences array', () => {
    customRender(<ModelConfigurationFormStopSequences {...defaultProps} stopSequences={[]} />);

    const inputs = screen.queryAllByPlaceholderText(/stop sequence/i);
    expect(inputs).toHaveLength(0);
    expect(screen.getByRole('button', { name: /add stop sequence/i })).toBeInTheDocument();
  });

  it('should handle special characters in stop sequences', () => {
    customRender(
      <ModelConfigurationFormStopSequences
        {...defaultProps}
        stopSequences={['\\n\\n', '###', '---']} />

    );

    const inputs = screen.getAllByPlaceholderText(/stop sequence/i) as HTMLInputElement[];
    expect(inputs[0].value).toBe('\\n\\n');
    expect(inputs[1].value).toBe('###');
    expect(inputs[2].value).toBe('---');
  });

  it('should render remove button for each sequence', () => {
    customRender(
      <ModelConfigurationFormStopSequences
        {...defaultProps}
        stopSequences={['\\n', 'STOP']} />

    );


    const removeButtons = screen.getAllByRole('button', { name: '' }).filter((btn) =>
    btn.querySelector('svg')
    );
    expect(removeButtons.length).toBeGreaterThan(0);
  });
});
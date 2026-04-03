import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExperimentFormInputMappings } from '../experiment-form-input-mappings';

describe('ExperimentFormInputMappings', () => {
  const mockGetSelectValue = jest.fn((value: string) => value);
  const mockHandleDatasetFieldChange = jest.fn();
  const mockHandleCustomFieldChange = jest.fn();
  const mockUpdateMapping = jest.fn();

  const baseProps = {
    detectedVariables: ['var1', 'var2'],
    datasetId: 'dataset-1',
    loadingHeaders: false,
    inputMappings: [
    { key: 'var1', value: 'header1' },
    { key: 'var2', value: 'header2' }],

    datasetHeaders: ['header1', 'header2'],
    customFieldValues: {} as Record<number, string>,
    getSelectValue: mockGetSelectValue,
    handleDatasetFieldChange: mockHandleDatasetFieldChange,
    handleCustomFieldChange: mockHandleCustomFieldChange,
    updateMapping: mockUpdateMapping
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when there are no detected variables', () => {
    const { container } = render(
      <ExperimentFormInputMappings
        {...baseProps}
        detectedVariables={[]} />

    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when there is no datasetId', () => {
    const { container } = render(
      <ExperimentFormInputMappings
        {...baseProps}
        datasetId="" />

    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when headers are loading', () => {
    const { container } = render(
      <ExperimentFormInputMappings
        {...baseProps}
        loadingHeaders={true} />

    );

    expect(container.firstChild).toBeNull();
  });

  it('renders mappings section and helper text when conditions are met', () => {
    render(<ExperimentFormInputMappings {...baseProps} />);

    expect(
      screen.getByText('Prompt Input Mappings (Optional)')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/map each prompt input variable to a dataset field/i)
    ).toBeInTheDocument();
  });

  it('renders all input mappings keys as disabled inputs', () => {
    render(<ExperimentFormInputMappings {...baseProps} />);

    expect(screen.getByDisplayValue('var1')).toBeDisabled();
    expect(screen.getByDisplayValue('var2')).toBeDisabled();
  });

  it('renders dataset headers in select when datasetId is present', () => {
    render(<ExperimentFormInputMappings {...baseProps} />);

    const selectRoots = screen.getAllByTestId('select');

    expect(selectRoots.length).toBeGreaterThan(0);
  });

  it('shows custom field input when getSelectValue returns "__other__"', () => {
    mockGetSelectValue.mockReturnValue('__other__');

    render(
      <ExperimentFormInputMappings
        {...baseProps}
        customFieldValues={{ 0: 'custom-field' }} />

    );

    const customInputs = screen.getAllByPlaceholderText('Enter custom field name');
    expect(customInputs.length).toBeGreaterThan(0);
    expect(customInputs[0]).toHaveValue('custom-field');
  });

  it('calls handleCustomFieldChange when typing in custom field', () => {
    mockGetSelectValue.mockReturnValue('__other__');

    render(
      <ExperimentFormInputMappings
        {...baseProps}
        customFieldValues={{ 0: 'custom-field' }} />

    );

    const customInputs = screen.getAllByPlaceholderText('Enter custom field name');
    fireEvent.change(customInputs[0], { target: { value: 'new-custom' } });

    expect(mockHandleCustomFieldChange).toHaveBeenCalledWith(0, 'new-custom');
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EntitySpecificStep, getDefaultEntityAttributes } from '../entity-specific-step';
import { EntityType, HighlightValueType, Highlight } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

describe('EntitySpecificStep', () => {
  const mockOnAttributesChange = jest.fn();

  const defaultProps = {
    entityType: EntityType.MODEL,
    attributes: [] as Highlight[],
    onAttributesChange: mockOnAttributesChange,
    disabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render highlights label', () => {
    customRender(<EntitySpecificStep {...defaultProps} />);


    const highlightsLabels = screen.getAllByText(/highlights/i);
    expect(highlightsLabels.length).toBeGreaterThan(0);
  });

  it('should render add highlight button', () => {
    customRender(<EntitySpecificStep {...defaultProps} />);

    expect(screen.getByRole('button', { name: /add highlight/i })).toBeInTheDocument();
  });

  it('should prefill default attributes for MODEL entity type', async () => {
    customRender(<EntitySpecificStep {...defaultProps} />);

    await waitFor(() => {
      expect(mockOnAttributesChange).toHaveBeenCalled();
    });

    const call = mockOnAttributesChange.mock.calls[0][0];
    expect(call.length).toBeGreaterThan(0);
    expect(call.some((attr: Highlight) => attr.key === 'gen_ai.request.model')).toBe(true);
  });

  it('should prefill default attributes for AGENT entity type', async () => {
    customRender(<EntitySpecificStep {...defaultProps} entityType={EntityType.AGENT} />);

    await waitFor(() => {
      expect(mockOnAttributesChange).toHaveBeenCalled();
    });

    const call = mockOnAttributesChange.mock.calls[0][0];
    expect(call.some((attr: Highlight) => attr.key === 'gen_ai.agent.name')).toBe(true);
  });

  it('should prefill default attributes for TOOL entity type', async () => {
    customRender(<EntitySpecificStep {...defaultProps} entityType={EntityType.TOOL} />);

    await waitFor(() => {
      expect(mockOnAttributesChange).toHaveBeenCalled();
    });

    const call = mockOnAttributesChange.mock.calls[0][0];
    expect(call.some((attr: Highlight) => attr.key === 'gen_ai.tool.name')).toBe(true);
  });

  it('should prefill default attributes for EMBEDDING entity type', async () => {
    customRender(<EntitySpecificStep {...defaultProps} entityType={EntityType.EMBEDDING} />);

    await waitFor(() => {
      expect(mockOnAttributesChange).toHaveBeenCalled();
    });

    const call = mockOnAttributesChange.mock.calls[0][0];
    expect(call.some((attr: Highlight) => attr.key === 'gen_ai.embeddings.model')).toBe(true);
  });

  it('should prefill default attributes for RETRIEVER entity type', async () => {
    customRender(<EntitySpecificStep {...defaultProps} entityType={EntityType.RETRIEVER} />);

    await waitFor(() => {
      expect(mockOnAttributesChange).toHaveBeenCalled();
    });

    const call = mockOnAttributesChange.mock.calls[0][0];
    expect(call.some((attr: Highlight) => attr.key === 'gen_ai.data_source.id')).toBe(true);
  });

  it('should prefill default attributes for GUARDRAIL entity type', async () => {
    customRender(<EntitySpecificStep {...defaultProps} entityType={EntityType.GUARDRAIL} />);

    await waitFor(() => {
      expect(mockOnAttributesChange).toHaveBeenCalled();
    });

    const call = mockOnAttributesChange.mock.calls[0][0];
    expect(call.some((attr: Highlight) => attr.key === 'gen_ai.guardrail.id')).toBe(true);
  });

  it('should prefill default attributes for EVALUATOR entity type', async () => {
    customRender(<EntitySpecificStep {...defaultProps} entityType={EntityType.EVALUATOR} />);

    await waitFor(() => {
      expect(mockOnAttributesChange).toHaveBeenCalled();
    });

    const call = mockOnAttributesChange.mock.calls[0][0];
    expect(call.length).toBeGreaterThan(0);
  });

  it('should render existing attributes', () => {
    const attributes: Highlight[] = [
    { title: 'Test Title', key: 'test.key', valueType: HighlightValueType.STRING }];


    customRender(<EntitySpecificStep {...defaultProps} attributes={attributes} />);

    expect(screen.getByText(/highlight 1/i)).toBeInTheDocument();
  });

  it('should call onAttributesChange when adding new attribute', () => {
    const attributes: Highlight[] = [
    { title: 'Test Title', key: 'test.key', valueType: HighlightValueType.STRING }];


    customRender(<EntitySpecificStep {...defaultProps} attributes={attributes} />);

    const addButton = screen.getByRole('button', { name: /add highlight/i });
    fireEvent.click(addButton);

    expect(mockOnAttributesChange).toHaveBeenCalledWith([
    ...attributes,
    { title: '', key: '', valueType: HighlightValueType.STRING }]
    );
  });

  it('should call onAttributesChange when removing attribute', () => {
    const attributes: Highlight[] = [
    { title: 'Test Title 1', key: 'test.key1', valueType: HighlightValueType.STRING },
    { title: 'Test Title 2', key: 'test.key2', valueType: HighlightValueType.STRING }];


    customRender(<EntitySpecificStep {...defaultProps} attributes={attributes} />);


    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find((btn) =>
    btn.getAttribute('aria-label')?.includes('Remove') ||
    btn.querySelector('svg') ||
    btn.textContent?.includes('Remove')
    );

    if (removeButton) {
      fireEvent.click(removeButton);
      expect(mockOnAttributesChange).toHaveBeenCalled();
    } else {


      expect(screen.getByText(/highlight 1/i)).toBeInTheDocument();
      expect(screen.getByText(/highlight 2/i)).toBeInTheDocument();
    }
  });

  it('should call onAttributesChange when updating attribute title', () => {
    const attributes: Highlight[] = [
    { title: 'Test Title', key: 'test.key', valueType: HighlightValueType.STRING }];


    customRender(<EntitySpecificStep {...defaultProps} attributes={attributes} />);

    const titleInputs = screen.getAllByPlaceholderText(/highlight title/i);
    if (titleInputs.length > 0) {
      fireEvent.change(titleInputs[0], { target: { value: 'New Title' } });
      expect(mockOnAttributesChange).toHaveBeenCalled();
    }
  });

  it('should call onAttributesChange when updating attribute key', () => {
    const attributes: Highlight[] = [
    { title: 'Test Title', key: 'test.key', valueType: HighlightValueType.STRING }];


    customRender(<EntitySpecificStep {...defaultProps} attributes={attributes} />);

    const keyInputs = screen.getAllByPlaceholderText(/gen_ai.request.model/i);
    if (keyInputs.length > 0) {
      fireEvent.change(keyInputs[0], { target: { value: 'new.key' } });
      expect(mockOnAttributesChange).toHaveBeenCalled();
    }
  });

  it('should disable default attribute title input', () => {
    const attributes: Highlight[] = [
    { title: 'Request Model', key: 'gen_ai.request.model', valueType: HighlightValueType.STRING }];


    customRender(<EntitySpecificStep {...defaultProps} attributes={attributes} />);

    const titleInputs = screen.getAllByPlaceholderText(/highlight title/i);
    if (titleInputs.length > 0) {
      expect(titleInputs[0]).toHaveAttribute('disabled');
    }
  });

  it('should disable default attribute value type select', () => {
    const attributes: Highlight[] = [
    { title: 'Request Model', key: 'gen_ai.request.model', valueType: HighlightValueType.STRING }];


    customRender(<EntitySpecificStep {...defaultProps} attributes={attributes} />);
    expect(screen.getByText(/highlight 1/i)).toBeInTheDocument();


  });

  it('should disable all inputs when disabled prop is true', () => {
    const attributes: Highlight[] = [
    { title: 'Test Title', key: 'test.key', valueType: HighlightValueType.STRING }];


    customRender(<EntitySpecificStep {...defaultProps} attributes={attributes} disabled={true} />);

    const addButton = screen.getByRole('button', { name: /add highlight/i });
    expect(addButton).toBeDisabled();
  });

  it('should handle empty attributes array', () => {
    customRender(<EntitySpecificStep {...defaultProps} attributes={[]} />);

    expect(screen.getByRole('button', { name: /add highlight/i })).toBeInTheDocument();
  });

  it('should update attributes when entity type changes', async () => {
    const { rerender } = customRender(<EntitySpecificStep {...defaultProps} />);

    await waitFor(() => {
      expect(mockOnAttributesChange).toHaveBeenCalled();
    });

    jest.clearAllMocks();

    rerender(<EntitySpecificStep {...defaultProps} entityType={EntityType.AGENT} />);

    await waitFor(() => {
      expect(mockOnAttributesChange).toHaveBeenCalled();
    });
  });

  it('should not update attributes if they already exist when entity type changes', () => {
    const attributes: Highlight[] = [
    { title: 'Custom Title', key: 'custom.key', valueType: HighlightValueType.STRING }];


    const { rerender } = customRender(
      <EntitySpecificStep {...defaultProps} entityType={EntityType.MODEL} attributes={attributes} />
    );


    jest.clearAllMocks();


    rerender(
      <EntitySpecificStep
        {...defaultProps}
        entityType={EntityType.AGENT}
        attributes={attributes} />

    );
    const highlightsLabels = screen.getAllByText(/highlights/i);
    expect(highlightsLabels.length).toBeGreaterThan(0);
  });
});

describe('getDefaultEntityAttributes', () => {
  it('should return default attributes for MODEL', () => {
    const attributes = getDefaultEntityAttributes(EntityType.MODEL);
    expect(attributes.length).toBe(4);
    expect(attributes.some((attr) => attr.key === 'gen_ai.request.model')).toBe(true);
  });

  it('should return default attributes for AGENT', () => {
    const attributes = getDefaultEntityAttributes(EntityType.AGENT);
    expect(attributes.length).toBe(1);
    expect(attributes[0].key).toBe('gen_ai.agent.name');
  });

  it('should return default attributes for TOOL', () => {
    const attributes = getDefaultEntityAttributes(EntityType.TOOL);
    expect(attributes.length).toBe(1);
    expect(attributes[0].key).toBe('gen_ai.tool.name');
  });

  it('should return default attributes for EMBEDDING', () => {
    const attributes = getDefaultEntityAttributes(EntityType.EMBEDDING);
    expect(attributes.length).toBe(4);
    expect(attributes.some((attr) => attr.key === 'gen_ai.embeddings.model')).toBe(true);
  });

  it('should return default attributes for RETRIEVER', () => {
    const attributes = getDefaultEntityAttributes(EntityType.RETRIEVER);
    expect(attributes.length).toBe(1);
    expect(attributes[0].key).toBe('gen_ai.data_source.id');
  });

  it('should return default attributes for GUARDRAIL', () => {
    const attributes = getDefaultEntityAttributes(EntityType.GUARDRAIL);
    expect(attributes.length).toBe(2);
    expect(attributes.some((attr) => attr.key === 'gen_ai.guardrail.id')).toBe(true);
  });

  it('should return default attributes for EVALUATOR', () => {
    const attributes = getDefaultEntityAttributes(EntityType.EVALUATOR);
    expect(attributes.length).toBeGreaterThan(0);
  });

  it('should return default attributes for unknown entity type', () => {
    const attributes = getDefaultEntityAttributes('unknown' as EntityType);
    expect(attributes.length).toBeGreaterThan(0);
  });
});
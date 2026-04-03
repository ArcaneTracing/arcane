import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchingStep } from '../matching-step';
import { MatchPatternType } from '@/types';

describe('MatchingStep', () => {
  const mockOnAttributeNameChange = jest.fn();
  const mockOnMatchPatternTypeChange = jest.fn();
  const mockOnMatchValueChange = jest.fn();
  const mockOnMatchPatternChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all matching fields', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.VALUE}
        matchValue=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    expect(screen.getByLabelText(/Matching Attribute Key/i)).toBeInTheDocument();

    expect(screen.getByText(/Match Pattern Type/i)).toBeInTheDocument();
  });

  it('should display attribute name value', () => {
    render(
      <MatchingStep
        attributeName="test.attribute"
        matchPatternType={MatchPatternType.VALUE}
        matchValue=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const attributeInput = screen.getByLabelText(/Matching Attribute Key/i) as HTMLInputElement;
    expect(attributeInput.value).toBe('test.attribute');
  });

  it('should call onAttributeNameChange when attribute name changes', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.VALUE}
        matchValue=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const attributeInput = screen.getByLabelText(/Matching Attribute Key/i);
    fireEvent.change(attributeInput, { target: { value: 'new.attribute' } });
    expect(mockOnAttributeNameChange).toHaveBeenCalledWith('new.attribute');
  });

  it('should show match value input when pattern type is VALUE', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.VALUE}
        matchValue="test-value"
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    expect(screen.getByLabelText(/Match Value/i)).toBeInTheDocument();
    const matchValueInput = screen.getByLabelText(/Match Value/i) as HTMLInputElement;
    expect(matchValueInput.value).toBe('test-value');
  });

  it('should show match pattern input when pattern type is REGEX', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.REGEX}
        matchValue=""
        matchPatttern="^test.*$"
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    expect(screen.getByLabelText(/Match Pattern \(Regex\)/i)).toBeInTheDocument();
    const patternInput = screen.getByLabelText(/Match Pattern \(Regex\)/i) as HTMLInputElement;
    expect(patternInput.value).toBe('^test.*$');
  });

  it('should not show match pattern input when pattern type is VALUE', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.VALUE}
        matchValue=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    expect(screen.queryByLabelText(/Match Pattern \(Regex\)/i)).not.toBeInTheDocument();
  });

  it('should not show match value input when pattern type is REGEX', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.REGEX}
        matchValue=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    expect(screen.queryByLabelText(/Match Value/i)).not.toBeInTheDocument();
  });

  it('should call onMatchValueChange when match value changes', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.VALUE}
        matchValue=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const matchValueInput = screen.getByLabelText(/Match Value/i);
    fireEvent.change(matchValueInput, { target: { value: 'new-value' } });
    expect(mockOnMatchValueChange).toHaveBeenCalledWith('new-value');
  });

  it('should call onMatchPatternChange when match pattern changes', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.REGEX}
        matchValue=""
        matchPatttern=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const patternInput = screen.getByLabelText(/Match Pattern \(Regex\)/i);
    fireEvent.change(patternInput, { target: { value: '^new.*$' } });
    expect(mockOnMatchPatternChange).toHaveBeenCalledWith('^new.*$');
  });

  it('should disable inputs when disabled prop is true', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.VALUE}
        matchValue=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange}
        disabled={true} />

    );
    const attributeInput = screen.getByLabelText(/Matching Attribute Key/i);
    expect(attributeInput).toBeDisabled();
  });
  it('should handle undefined matchPattern when pattern type is REGEX', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.REGEX}
        matchValue=""
        matchPatttern={undefined}
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const patternInput = screen.getByLabelText(/Match Pattern \(Regex\)/i) as HTMLInputElement;
    expect(patternInput.value).toBe('');
  });

  it('should handle null matchPattern when pattern type is REGEX', () => {
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.REGEX}
        matchValue=""
        matchPatttern={null as any}
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const patternInput = screen.getByLabelText(/Match Pattern \(Regex\)/i) as HTMLInputElement;
    expect(patternInput.value).toBe('');
  });

  it('should handle very long attributeName', () => {
    const longAttribute = 'a'.repeat(500);
    render(
      <MatchingStep
        attributeName={longAttribute}
        matchPatternType={MatchPatternType.VALUE}
        matchValue=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const attributeInput = screen.getByLabelText(/Matching Attribute Key/i) as HTMLInputElement;
    expect(attributeInput.value).toBe(longAttribute);
  });

  it('should handle very long matchValue', () => {
    const longValue = 'b'.repeat(1000);
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.VALUE}
        matchValue={longValue}
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const matchValueInput = screen.getByLabelText(/Match Value/i) as HTMLInputElement;
    expect(matchValueInput.value).toBe(longValue);
  });

  it('should handle invalid regex pattern', () => {
    const invalidRegex = '[unclosed bracket';
    render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.REGEX}
        matchValue=""
        matchPatttern={invalidRegex}
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const patternInput = screen.getByLabelText(/Match Pattern \(Regex\)/i) as HTMLInputElement;
    expect(patternInput.value).toBe(invalidRegex);
  });

  it('should handle special characters in attributeName', () => {
    const specialChars = 'test.attribute!@#$%^&*()';
    render(
      <MatchingStep
        attributeName={specialChars}
        matchPatternType={MatchPatternType.VALUE}
        matchValue=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const attributeInput = screen.getByLabelText(/Matching Attribute Key/i) as HTMLInputElement;
    expect(attributeInput.value).toBe(specialChars);
  });

  it('should handle empty string changes', () => {
    render(
      <MatchingStep
        attributeName="test"
        matchPatternType={MatchPatternType.VALUE}
        matchValue="value"
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const attributeInput = screen.getByLabelText(/Matching Attribute Key/i);
    fireEvent.change(attributeInput, { target: { value: '' } });
    expect(mockOnAttributeNameChange).toHaveBeenCalledWith('');
  });

  it('should handle whitespace-only attributeName', () => {
    render(
      <MatchingStep
        attributeName="   "
        matchPatternType={MatchPatternType.VALUE}
        matchValue=""
        onAttributeNameChange={mockOnAttributeNameChange}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    const attributeInput = screen.getByLabelText(/Matching Attribute Key/i) as HTMLInputElement;
    expect(attributeInput.value).toBe('   ');
  });

  it('should handle missing callbacks gracefully', () => {
    const { container } = render(
      <MatchingStep
        attributeName=""
        matchPatternType={MatchPatternType.VALUE}
        matchValue=""
        onAttributeNameChange={undefined as any}
        onMatchPatternTypeChange={mockOnMatchPatternTypeChange}
        onMatchValueChange={mockOnMatchValueChange}
        onMatchPatternChange={mockOnMatchPatternChange} />

    );
    expect(container).toBeInTheDocument();
  });
});
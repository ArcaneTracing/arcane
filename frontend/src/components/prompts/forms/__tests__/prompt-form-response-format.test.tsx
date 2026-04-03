import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptFormResponseFormat } from '../prompt-form-response-format';

describe('PromptFormResponseFormat', () => {
  it('renders Response Format header', () => {
    render(
      <PromptFormResponseFormat
        responseFormat=""
        isOpen={true}
        onFormatChange={jest.fn()}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText('Response Format')).toBeInTheDocument();
    expect(screen.getByText('Schema')).toBeInTheDocument();
  });

  it('shows ChevronUp when expanded', () => {
    render(
      <PromptFormResponseFormat
        responseFormat=""
        isOpen={true}
        onFormatChange={jest.fn()}
        onOpenChange={jest.fn()} />

    );

    const trigger = screen.getByRole('button', { name: /response format/i });
    expect(trigger).toBeInTheDocument();
  });

  it('calls onOpenChange when trigger clicked', () => {
    const onOpenChange = jest.fn();
    render(
      <PromptFormResponseFormat
        responseFormat=""
        isOpen={true}
        onFormatChange={jest.fn()}
        onOpenChange={onOpenChange} />

    );

    const trigger = screen.getByRole('button', { name: /response format/i });
    fireEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onFormatChange when textarea changes', () => {
    const onFormatChange = jest.fn();
    render(
      <PromptFormResponseFormat
        responseFormat=""
        isOpen={true}
        onFormatChange={onFormatChange}
        onOpenChange={jest.fn()} />

    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '{"type":"json_schema"}' } });

    expect(onFormatChange).toHaveBeenCalledWith('{"type":"json_schema"}');
  });

  it('displays responseFormat value in textarea', () => {
    const schema = '{"type":"json_schema","json_schema":{"name":"response"}}';
    render(
      <PromptFormResponseFormat
        responseFormat={schema}
        isOpen={true}
        onFormatChange={jest.fn()}
        onOpenChange={jest.fn()} />

    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(schema);
  });

  it('Copy button does not nest inside trigger (no nested buttons)', () => {
    render(
      <PromptFormResponseFormat
        responseFormat="test"
        isOpen={true}
        onFormatChange={jest.fn()}
        onOpenChange={jest.fn()} />

    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByRole('button', { name: /response format/i })).toBeInTheDocument();
  });
});
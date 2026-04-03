import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptFormMessages } from '../prompt-form-messages';
import type { MessageBox } from '@/hooks/prompts/use-prompt-form';

describe('PromptFormMessages', () => {
  const onAddMessage = jest.fn();
  const onRemoveMessage = jest.fn();
  const onUpdateMessage = jest.fn();
  const onCopyMessage = jest.fn();

  const messages: MessageBox[] = [
  { id: '1', role: 'system', content: 'line1\nline2' } as MessageBox,
  { id: '2', role: 'user', content: 'user message' } as MessageBox];


  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders section title', () => {
    render(
      <PromptFormMessages
        messages={messages}
        onAddMessage={onAddMessage}
        onRemoveMessage={onRemoveMessage}
        onUpdateMessage={onUpdateMessage}
        onCopyMessage={onCopyMessage} />

    );

    expect(screen.getByText('Prompts')).toBeInTheDocument();
  });

  it('renders line numbers based on content lines', () => {
    render(
      <PromptFormMessages
        messages={messages}
        onAddMessage={onAddMessage}
        onRemoveMessage={onRemoveMessage}
        onUpdateMessage={onUpdateMessage}
        onCopyMessage={onCopyMessage} />

    );


    const ones = screen.getAllByText('1');
    const twos = screen.getAllByText('2');
    expect(ones.length).toBeGreaterThan(0);
    expect(twos.length).toBeGreaterThan(0);
  });

  it('calls onUpdateMessage when content changes', () => {
    render(
      <PromptFormMessages
        messages={messages}
        onAddMessage={onAddMessage}
        onRemoveMessage={onRemoveMessage}
        onUpdateMessage={onUpdateMessage}
        onCopyMessage={onCopyMessage} />

    );

    const textareas = screen.getAllByPlaceholderText(/enter .* message\.\.\./i);
    fireEvent.change(textareas[0], { target: { value: 'updated' } });

    expect(onUpdateMessage).toHaveBeenCalledWith('1', 'content', 'updated');
  });

  it('calls onCopyMessage when copy button clicked', () => {
    const { container } = render(
      <PromptFormMessages
        messages={messages}
        onAddMessage={onAddMessage}
        onRemoveMessage={onRemoveMessage}
        onUpdateMessage={onUpdateMessage}
        onCopyMessage={onCopyMessage} />

    );

    const copyIconButton = container.querySelector('button svg[data-testid="icon-copy"]')?.parentElement;
    expect(copyIconButton).toBeTruthy();
    if (copyIconButton) {
      fireEvent.click(copyIconButton);
    }

    expect(onCopyMessage).toHaveBeenCalled();
  });

  it('shows remove button when more than one message and calls onRemoveMessage', () => {
    render(
      <PromptFormMessages
        messages={messages}
        onAddMessage={onAddMessage}
        onRemoveMessage={onRemoveMessage}
        onUpdateMessage={onUpdateMessage}
        onCopyMessage={onCopyMessage} />

    );


    const buttons = screen.getAllByRole('button');
    const trashButton = buttons.find(
      (btn) => btn.querySelector('[data-testid="icon-trash2"]') !== null
    );

    expect(trashButton).toBeDefined();
    if (trashButton) {
      fireEvent.click(trashButton);
      expect(onRemoveMessage).toHaveBeenCalled();
    }
  });
});
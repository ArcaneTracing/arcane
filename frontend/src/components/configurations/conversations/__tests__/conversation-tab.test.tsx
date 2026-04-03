import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConversationTab } from '../conversation-tab';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('../conversation-table', () => ({
  ConversationTable: ({ searchQuery }: any) =>
  <div data-testid="conversation-table">
      <div>Search Query: {searchQuery}</div>
    </div>

}));

jest.mock('../conversation-dialog', () => {
  const React = require('react');
  return {
    ConversationDialog: ({ open, onOpenChange, trigger }: any) => {
      const [isOpen, setIsOpen] = React.useState(open);

      React.useEffect(() => {
        setIsOpen(open);
      }, [open]);

      const handleTriggerClick = () => {
        setIsOpen(true);
        onOpenChange(true);
      };

      return (
        <div>
          {trigger && React.cloneElement(trigger, { onClick: handleTriggerClick })}
          {isOpen && <div data-testid="conversation-dialog">Dialog Open</div>}
        </div>);

    }
  };
});

jest.mock('@/components/icons/add-icon', () => ({
  AddIcon: () => <div data-testid="add-icon">AddIcon</div>
}));

describe('ConversationTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    customRender(<ConversationTab />);

    const searchInput = screen.getByPlaceholderText('Search');
    expect(searchInput).toBeInTheDocument();
  });

  it('should render New Conversation Configuration button', () => {
    customRender(<ConversationTab />);

    expect(screen.getByText('New Conversation Configuration')).toBeInTheDocument();
  });

  it('should update search query when typing', () => {
    customRender(<ConversationTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(searchInput.value).toBe('test query');
  });

  it('should pass search query to ConversationTable', () => {
    customRender(<ConversationTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(screen.getByText('Search Query: test')).toBeInTheDocument();
  });

  it('should open dialog when trigger button is clicked', async () => {
    customRender(<ConversationTab />);

    const triggerButton = screen.getByText('New Conversation Configuration');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByTestId('conversation-dialog')).toBeInTheDocument();
    });
  });


  it('should handle empty search query', () => {
    customRender(<ConversationTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    expect(searchInput.value).toBe('');
    expect(screen.getByText('Search Query:')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    customRender(<ConversationTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: longQuery } });

    expect(searchInput.value).toBe(longQuery);
  });

  it('should handle special characters in search query', () => {
    const specialQuery = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    customRender(<ConversationTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: specialQuery } });

    expect(searchInput.value).toBe(specialQuery);
  });

  it('should handle whitespace-only search query', () => {
    customRender(<ConversationTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: '   ' } });

    expect(searchInput.value).toBe('   ');
  });
});
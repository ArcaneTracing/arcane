import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelConfigurationsTab } from '../model-configurations-tab';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('../model-configurations-table', () => ({
  ModelConfigurationsTable: ({ searchQuery }: any) =>
  <div data-testid="model-configurations-table">
      <div>Search Query: {searchQuery}</div>
    </div>

}));

jest.mock('../model-configuration-dialog', () => ({
  ModelConfigurationDialog: ({ open, onOpenChange, trigger }: any) => {
    const React = require('react');
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
        {isOpen && <div data-testid="model-configuration-dialog">Dialog Open</div>}
      </div>);

  }
}));

jest.mock('@/components/icons/add-icon', () => ({
  AddIcon: () => <div data-testid="add-icon">AddIcon</div>
}));

describe('ModelConfigurationsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    customRender(<ModelConfigurationsTab />);

    const searchInput = screen.getByPlaceholderText('Search');
    expect(searchInput).toBeInTheDocument();
  });

  it('should render New Model Configuration button', () => {
    customRender(<ModelConfigurationsTab />);

    expect(screen.getByText('New Model Configuration')).toBeInTheDocument();
  });

  it('should update search query when typing', () => {
    customRender(<ModelConfigurationsTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test query' } });

    expect(searchInput.value).toBe('test query');
  });

  it('should pass search query to ModelConfigurationsTable', () => {
    customRender(<ModelConfigurationsTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(screen.getByText('Search Query: test')).toBeInTheDocument();
  });

  it('should open dialog when trigger button is clicked', async () => {
    customRender(<ModelConfigurationsTab />);

    const triggerButton = screen.getByText('New Model Configuration');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByTestId('model-configuration-dialog')).toBeInTheDocument();
    });
  });


  it('should handle empty search query', () => {
    customRender(<ModelConfigurationsTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    expect(searchInput.value).toBe('');
    expect(screen.getByText('Search Query:')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    customRender(<ModelConfigurationsTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: longQuery } });

    expect(searchInput.value).toBe(longQuery);
  });

  it('should handle special characters in search query', () => {
    const specialQuery = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    customRender(<ModelConfigurationsTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: specialQuery } });

    expect(searchInput.value).toBe(specialQuery);
  });

  it('should handle whitespace-only search query', () => {
    customRender(<ModelConfigurationsTab />);

    const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: '   ' } });

    expect(searchInput.value).toBe('   ');
  });
});
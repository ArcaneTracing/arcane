import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConversationTable } from '../conversation-table';
import { ConversationConfigurationResponse } from '@/types/conversation-configuration';
import { render as customRender } from '@/__tests__/test-utils';

const mockDeleteConfiguration = jest.fn().mockResolvedValue(undefined);

const mockDeleteMutation = {
  mutateAsync: mockDeleteConfiguration,
  isPending: false,
  error: null
};

jest.mock('@/hooks/conversation/use-conversation-query', () => ({
  useConversationConfigurationsQuery: jest.fn(),
  useDeleteConversationConfiguration: jest.fn(() => mockDeleteMutation)
}));

jest.mock('../conversation-table-row', () => ({
  ConversationTableRow: ({ configuration, onEdit, onDelete }: any) =>
  <tr data-testid={`table-row-${configuration.id}`}>
      <td>{configuration.name}</td>
      <td>
        <button onClick={() => onEdit(configuration)}>Edit</button>
        <button onClick={() => onDelete(configuration.id)}>Delete</button>
      </td>
    </tr>

}));

jest.mock('../conversation-table-header', () => ({
  ConversationTableHeader: ({ sortConfig, onSort }: any) =>
  <thead>
      <tr>
        <th onClick={() => onSort('name')}>Name</th>
        <th onClick={() => onSort('description')}>Description</th>
        <th onClick={() => onSort('createdAt')}>Created Date</th>
      </tr>
    </thead>

}));

jest.mock('../conversation-dialog', () => ({
  ConversationDialog: ({ open, configuration, onOpenChange }: any) =>
  open ? <div data-testid="edit-dialog">Edit Dialog</div> : null

}));

jest.mock('../delete-conversation-dialog', () => ({
  DeleteConversationDialog: ({ isOpen, onConfirm, onClose }: any) => {
    const handleConfirm = async () => {
      if (onConfirm) {
        await onConfirm();
      }
    };
    return isOpen ?
    <div data-testid="delete-dialog">
        <button onClick={handleConfirm}>Confirm Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div> :
    null;
  }
}));

jest.mock('../conversation-table-pagination', () => ({
  ConversationTablePagination: ({ meta, onPageChange }: any) =>
  <div data-testid="pagination">
      <button onClick={() => onPageChange(meta.page + 1)}>Next</button>
      <button onClick={() => onPageChange(meta.page - 1)}>Previous</button>
    </div>

}));

const mockUseConversationConfigurationsQuery = require('@/hooks/conversation/use-conversation-query').useConversationConfigurationsQuery;
const mockUseDeleteConversationConfiguration = require('@/hooks/conversation/use-conversation-query').useDeleteConversationConfiguration;

describe('ConversationTable', () => {
  const mockConfigurations: ConversationConfigurationResponse[] = [
  {
    id: 'config-1',
    name: 'Config 1',
    description: 'Description 1',
    stitchingAttributesName: ['attr1', 'attr2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'config-2',
    name: 'Config 2',
    description: 'Description 2',
    stitchingAttributesName: ['attr3'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'config-3',
    name: 'Config 3',
    description: 'Description 3',
    stitchingAttributesName: ['attr4', 'attr5', 'attr6'],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }];


  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: mockConfigurations,
      isLoading: false,
      error: null
    });
    mockUseDeleteConversationConfiguration.mockReturnValue(mockDeleteMutation);
  });

  it('should render configurations', () => {
    customRender(<ConversationTable searchQuery="" />);

    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.getByText('Config 3')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null
    });

    customRender(<ConversationTable searchQuery="" />);

    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Failed to fetch configurations'
    });

    customRender(<ConversationTable searchQuery="" />);

    expect(screen.getByText(/Error: Failed to fetch configurations/i)).toBeInTheDocument();
  });

  it('should display empty state', () => {
    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    customRender(<ConversationTable searchQuery="" />);

    expect(screen.getByText(/No conversation configurations found/i)).toBeInTheDocument();
  });

  it('should filter configurations by search query', () => {
    customRender(<ConversationTable searchQuery="Config 1" />);

    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.queryByText('Config 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Config 3')).not.toBeInTheDocument();
  });

  it('should filter configurations by description', () => {
    customRender(<ConversationTable searchQuery="Description 2" />);

    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.queryByText('Config 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Config 3')).not.toBeInTheDocument();
  });

  it('should filter configurations by attribute name', () => {
    customRender(<ConversationTable searchQuery="attr3" />);

    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.queryByText('Config 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Config 3')).not.toBeInTheDocument();
  });

  it('should filter configurations by date range', () => {

    const filteredConfigs: ConversationConfigurationResponse[] = [
    {
      id: 'config-2',
      name: 'Config 2',
      description: 'Description 2',
      stitchingAttributesName: ['attr3'],
      createdAt: new Date('2024-01-02T12:00:00'),
      updatedAt: new Date('2024-01-02T12:00:00')
    }];


    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: filteredConfigs,
      isLoading: false,
      error: null
    });

    customRender(
      <ConversationTable
        searchQuery=""
        startDate="2024-01-02"
        endDate="2024-01-02" />

    );

    expect(screen.getByText('Config 2')).toBeInTheDocument();
  });

  it('should filter configurations by start date only', () => {

    const filteredConfigs: ConversationConfigurationResponse[] = [
    {
      id: 'config-2',
      name: 'Config 2',
      description: 'Description 2',
      stitchingAttributesName: ['attr3'],
      createdAt: new Date('2024-01-02T12:00:00'),
      updatedAt: new Date('2024-01-02T12:00:00')
    },
    {
      id: 'config-3',
      name: 'Config 3',
      description: 'Description 3',
      stitchingAttributesName: ['attr4', 'attr5', 'attr6'],
      createdAt: new Date('2024-01-03T12:00:00'),
      updatedAt: new Date('2024-01-03T12:00:00')
    }];


    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: filteredConfigs,
      isLoading: false,
      error: null
    });

    customRender(
      <ConversationTable
        searchQuery=""
        startDate="2024-01-02" />

    );

    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.getByText('Config 3')).toBeInTheDocument();
  });

  it('should filter configurations by end date only', () => {

    const filteredConfigs: ConversationConfigurationResponse[] = [
    {
      id: 'config-1',
      name: 'Config 1',
      description: 'Description 1',
      stitchingAttributesName: ['attr1', 'attr2'],
      createdAt: new Date('2024-01-01T12:00:00'),
      updatedAt: new Date('2024-01-01T12:00:00')
    },
    {
      id: 'config-2',
      name: 'Config 2',
      description: 'Description 2',
      stitchingAttributesName: ['attr3'],
      createdAt: new Date('2024-01-02T12:00:00'),
      updatedAt: new Date('2024-01-02T12:00:00')
    }];


    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: filteredConfigs,
      isLoading: false,
      error: null
    });

    customRender(
      <ConversationTable
        searchQuery=""
        endDate="2024-01-02" />

    );

    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();
  });

  it('should open edit dialog when Edit button is clicked', async () => {
    customRender(<ConversationTable searchQuery="" />);

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
    });
  });

  it('should open delete dialog when Delete button is clicked', async () => {
    customRender(<ConversationTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });
  });

  it('should call deleteConfiguration when delete is confirmed', async () => {
    customRender(<ConversationTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);
    await waitFor(() => {
      expect(mockDeleteConfiguration).toHaveBeenCalled();
    }, { timeout: 3000 });


    expect(mockDeleteConfiguration).toHaveBeenCalledWith('config-3');
  });

  it('should close delete dialog when Cancel is clicked', async () => {
    customRender(<ConversationTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    });
  });

  it('should display delete error', () => {
    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: mockConfigurations,
      isLoading: false,
      error: null
    });
    mockUseDeleteConversationConfiguration.mockReturnValue({
      ...mockDeleteMutation,
      error: new Error('Failed to delete')
    });

    customRender(<ConversationTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);


    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
  });

  it('should display loading state for delete', () => {
    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: mockConfigurations,
      isLoading: false,
      error: null
    });
    mockUseDeleteConversationConfiguration.mockReturnValue({
      ...mockDeleteMutation,
      isPending: true
    });

    customRender(<ConversationTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);


    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
  });


  it('should handle empty search query', () => {
    customRender(<ConversationTable searchQuery="" />);

    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.getByText('Config 3')).toBeInTheDocument();
  });

  it('should handle case-insensitive search', () => {
    customRender(<ConversationTable searchQuery="CONFIG 1" />);

    expect(screen.getByText('Config 1')).toBeInTheDocument();
  });

  it('should handle partial search matches', () => {
    customRender(<ConversationTable searchQuery="Config" />);

    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.getByText('Config 3')).toBeInTheDocument();
  });

  it('should handle configurations with null description', () => {
    const configWithNullDesc: ConversationConfigurationResponse = {
      id: 'config-4',
      name: 'Config 4',
      description: null as any,
      stitchingAttributesName: ['attr1'],
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04')
    };

    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: [configWithNullDesc],
      isLoading: false,
      error: null
    });

    customRender(<ConversationTable searchQuery="" />);

    expect(screen.getByText('Config 4')).toBeInTheDocument();
  });

  it('should handle configurations with empty stitchingAttributesName', () => {
    const configWithEmptyAttrs: ConversationConfigurationResponse = {
      id: 'config-5',
      name: 'Config 5',
      description: 'Description 5',
      stitchingAttributesName: [],
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05')
    };

    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: [configWithEmptyAttrs],
      isLoading: false,
      error: null
    });

    customRender(<ConversationTable searchQuery="" />);

    expect(screen.getByText('Config 5')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    customRender(<ConversationTable searchQuery={longQuery} />);

    expect(screen.getByText(/No conversation configurations found/i)).toBeInTheDocument();
  });

  it('should handle special characters in search query', () => {
    customRender(<ConversationTable searchQuery="!@#$%^&*()" />);

    expect(screen.getByText(/No conversation configurations found/i)).toBeInTheDocument();
  });

  it('should handle pagination', () => {

    const manyConfigs: ConversationConfigurationResponse[] = Array.from({ length: 25 }, (_, i) => ({
      id: `config-${i}`,
      name: `Config ${i}`,
      description: `Description ${i}`,
      stitchingAttributesName: ['attr1'],
      createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`)
    }));

    mockUseConversationConfigurationsQuery.mockReturnValue({
      data: manyConfigs,
      isLoading: false,
      error: null
    });

    customRender(<ConversationTable searchQuery="" />);

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});
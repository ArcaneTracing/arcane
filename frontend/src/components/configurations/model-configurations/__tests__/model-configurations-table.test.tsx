import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelConfigurationsTable } from '../model-configurations-table';
import { ModelConfigurationResponse } from '@/types/model-configuration';
import { render as customRender } from '@/__tests__/test-utils';

const mockUpdateMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
  error: null
};

jest.mock('@/hooks/model-configurations/use-model-configurations-query', () => ({
  useModelConfigurationsQuery: jest.fn(),
  useUpdateModelConfiguration: jest.fn(() => mockUpdateMutation)
}));

jest.mock('../model-configurations-table-row', () => ({
  ModelConfigurationsTableRow: ({ configuration, onEdit, onDelete }: any) =>
  <tr data-testid={`table-row-${configuration.id}`}>
      <td>{configuration.name}</td>
      <td>
        <button onClick={() => onEdit(configuration)}>Edit</button>
        <button onClick={() => onDelete(configuration.id)}>Delete</button>
      </td>
    </tr>

}));

jest.mock('../model-configurations-table-header', () => ({
  ModelConfigurationsTableHeader: ({ sortConfig, onSort }: any) =>
  <thead>
      <tr>
        <th onClick={() => onSort('name')}>Name</th>
        <th onClick={() => onSort('adapter')}>Adapter</th>
        <th onClick={() => onSort('createdAt')}>Created Date</th>
      </tr>
    </thead>

}));

jest.mock('../model-configuration-dialog', () => ({
  ModelConfigurationDialog: ({ open, configuration, onOpenChange }: any) =>
  open ? <div data-testid="edit-dialog">Edit Dialog</div> : null

}));

jest.mock('../delete-model-configuration-dialog', () => ({
  DeleteModelConfigurationDialog: ({ isOpen, onConfirm, onClose }: any) => {
    const React = require('react');
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

jest.mock('../model-configurations-table-pagination', () => ({
  ModelConfigurationsTablePagination: ({ meta, onPageChange }: any) => {

    if (meta.totalPages <= 1) {
      return null;
    }
    return (
      <div data-testid="pagination">
        <button onClick={() => onPageChange(meta.page + 1)}>Next</button>
        <button onClick={() => onPageChange(meta.page - 1)}>Previous</button>
      </div>);

  }
}));

const mockUseModelConfigurationsQuery = require('@/hooks/model-configurations/use-model-configurations-query').useModelConfigurationsQuery;
const mockUseUpdateModelConfiguration = require('@/hooks/model-configurations/use-model-configurations-query').useUpdateModelConfiguration;

describe('ModelConfigurationsTable', () => {
  const mockConfigurations: ModelConfigurationResponse[] = [
  {
    id: 'config-1',
    name: 'Config 1',
    configuration: {
      adapter: 'openai',
      modelName: 'gpt-4',
      apiKey: 'sk-test',
      inputCostPerToken: 0.00003,
      outputCostPerToken: 0.00006
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'config-2',
    name: 'Config 2',
    configuration: {
      adapter: 'anthropic',
      modelName: 'claude-3',
      apiKey: 'sk-ant-test',
      inputCostPerToken: 0.000015,
      outputCostPerToken: 0.000075
    },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 'config-3',
    name: 'Config 3',
    configuration: {
      adapter: 'azure-openai',
      modelName: 'gpt-3.5-turbo',
      apiKey: 'azure-key',
      inputCostPerToken: 0.0000015,
      outputCostPerToken: 0.000002
    },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }];


  beforeEach(() => {
    jest.clearAllMocks();
    mockUseModelConfigurationsQuery.mockReturnValue({
      data: mockConfigurations,
      isLoading: false,
      error: null
    });
    mockUseUpdateModelConfiguration.mockReturnValue(mockUpdateMutation);
  });

  it('should render configurations', () => {
    customRender(<ModelConfigurationsTable searchQuery="" />);

    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.getByText('Config 3')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    mockUseModelConfigurationsQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null
    });

    customRender(<ModelConfigurationsTable searchQuery="" />);

    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockUseModelConfigurationsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Failed to fetch configurations'
    });

    customRender(<ModelConfigurationsTable searchQuery="" />);

    expect(screen.getByText(/Error: Failed to fetch configurations/i)).toBeInTheDocument();
  });

  it('should display empty state', () => {
    mockUseModelConfigurationsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    customRender(<ModelConfigurationsTable searchQuery="" />);

    expect(screen.getByText(/No model configurations found/i)).toBeInTheDocument();
  });

  it('should filter configurations by search query', () => {
    customRender(<ModelConfigurationsTable searchQuery="Config 1" />);

    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.queryByText('Config 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Config 3')).not.toBeInTheDocument();
  });

  it('should filter configurations by name', () => {
    customRender(<ModelConfigurationsTable searchQuery="Config 2" />);

    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.queryByText('Config 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Config 3')).not.toBeInTheDocument();
  });

  it('should open edit dialog when Edit button is clicked', async () => {
    customRender(<ModelConfigurationsTable searchQuery="" />);

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
    });
  });

  it('should open delete dialog when Delete button is clicked', async () => {
    customRender(<ModelConfigurationsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });
  });

  it('should close delete dialog when delete is confirmed', async () => {
    customRender(<ModelConfigurationsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    });
  });

  it('should close delete dialog when Cancel is clicked', async () => {
    customRender(<ModelConfigurationsTable searchQuery="" />);

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


  it('should handle empty search query', () => {
    customRender(<ModelConfigurationsTable searchQuery="" />);

    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.getByText('Config 3')).toBeInTheDocument();
  });

  it('should handle case-insensitive search', () => {
    customRender(<ModelConfigurationsTable searchQuery="CONFIG 1" />);

    expect(screen.getByText('Config 1')).toBeInTheDocument();
  });

  it('should handle partial search matches', () => {
    customRender(<ModelConfigurationsTable searchQuery="Config" />);

    expect(screen.getByText('Config 1')).toBeInTheDocument();
    expect(screen.getByText('Config 2')).toBeInTheDocument();
    expect(screen.getByText('Config 3')).toBeInTheDocument();
  });

  it('should handle configurations with null name', () => {
    const configWithNullName: ModelConfigurationResponse = {
      id: 'config-4',
      name: null as any,
      configuration: {
        adapter: 'openai',
        modelName: 'gpt-4',
        apiKey: 'sk-test',
        inputCostPerToken: 0.00003,
        outputCostPerToken: 0.00006
      },
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04')
    };

    mockUseModelConfigurationsQuery.mockReturnValue({
      data: [configWithNullName],
      isLoading: false,
      error: null
    });

    customRender(<ModelConfigurationsTable searchQuery="" />);

    const nameCell = screen.getByTestId('table-row-config-4').querySelector('td');
    expect(nameCell).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    customRender(<ModelConfigurationsTable searchQuery={longQuery} />);

    expect(screen.getByText(/No model configurations found/i)).toBeInTheDocument();
  });

  it('should handle special characters in search query', () => {
    customRender(<ModelConfigurationsTable searchQuery="!@#$%^&*()" />);

    expect(screen.getByText(/No model configurations found/i)).toBeInTheDocument();
  });

  it('should handle pagination', () => {

    const manyConfigs: ModelConfigurationResponse[] = Array.from({ length: 25 }, (_, i) => ({
      id: `config-${i}`,
      name: `Config ${i}`,
      configuration: {
        adapter: 'openai',
        modelName: 'gpt-4',
        apiKey: 'sk-test',
        inputCostPerToken: 0.00003,
        outputCostPerToken: 0.00006
      },
      createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`)
    }));

    mockUseModelConfigurationsQuery.mockReturnValue({
      data: manyConfigs,
      isLoading: false,
      error: null
    });

    customRender(<ModelConfigurationsTable searchQuery="" />);

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('should not show pagination when there is only one page', () => {
    mockUseModelConfigurationsQuery.mockReturnValue({
      data: mockConfigurations,
      isLoading: false,
      error: null
    });

    customRender(<ModelConfigurationsTable searchQuery="" />);

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
  });
});
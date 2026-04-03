import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelConfigurationsTableRow } from '../model-configurations-table-row';
import { ModelConfigurationResponse } from '@/types/model-configuration';

describe('ModelConfigurationsTableRow', () => {
  const mockConfiguration: ModelConfigurationResponse = {
    id: 'config-1',
    name: 'Test Configuration',
    configuration: {
      adapter: 'openai',
      modelName: 'gpt-4',
      apiKey: 'sk-test',
      inputCostPerToken: 0.00003,
      outputCostPerToken: 0.00006
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render configuration information', () => {
    render(
      <ModelConfigurationsTableRow
        configuration={mockConfiguration}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Configuration')).toBeInTheDocument();
    expect(screen.getByText('openai')).toBeInTheDocument();
    expect(screen.getByText('gpt-4')).toBeInTheDocument();
  });

  it('should call onEdit when Edit button is clicked', () => {
    render(
      <ModelConfigurationsTableRow
        configuration={mockConfiguration}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockConfiguration);
  });

  it('should call onDelete when Delete button is clicked', () => {
    render(
      <ModelConfigurationsTableRow
        configuration={mockConfiguration}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('config-1');
  });

  it('should display "-" for missing adapter', () => {
    const configWithoutAdapter: ModelConfiguration = {
      ...mockConfiguration,
      configuration: {
        ...mockConfiguration.configuration,
        adapter: undefined as any
      }
    };

    render(
      <ModelConfigurationsTableRow
        configuration={configWithoutAdapter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should display "-" for missing modelName', () => {
    const configWithoutModelName: ModelConfiguration = {
      ...mockConfiguration,
      configuration: {
        ...mockConfiguration.configuration,
        modelName: undefined as any
      }
    };

    render(
      <ModelConfigurationsTableRow
        configuration={configWithoutModelName}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should display created date', () => {
    render(
      <ModelConfigurationsTableRow
        configuration={mockConfiguration}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const dateText = new Date(mockConfiguration.createdAt).toLocaleDateString();
    expect(screen.getByText(dateText)).toBeInTheDocument();
  });


  it('should handle configuration with null adapter', () => {
    const configWithNullAdapter: ModelConfiguration = {
      ...mockConfiguration,
      configuration: {
        ...mockConfiguration.configuration,
        adapter: null as any
      }
    };

    render(
      <ModelConfigurationsTableRow
        configuration={configWithNullAdapter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should handle configuration with null modelName', () => {
    const configWithNullModelName: ModelConfiguration = {
      ...mockConfiguration,
      configuration: {
        ...mockConfiguration.configuration,
        modelName: null as any
      }
    };

    render(
      <ModelConfigurationsTableRow
        configuration={configWithNullModelName}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should handle configuration with empty string adapter', () => {
    const configWithEmptyAdapter: ModelConfiguration = {
      ...mockConfiguration,
      configuration: {
        ...mockConfiguration.configuration,
        adapter: '' as any
      }
    };

    render(
      <ModelConfigurationsTableRow
        configuration={configWithEmptyAdapter}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should handle configuration with empty string modelName', () => {
    const configWithEmptyModelName: ModelConfiguration = {
      ...mockConfiguration,
      configuration: {
        ...mockConfiguration.configuration,
        modelName: ''
      }
    };

    render(
      <ModelConfigurationsTableRow
        configuration={configWithEmptyModelName}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should handle very long configuration name', () => {
    const configWithLongName: ModelConfiguration = {
      ...mockConfiguration,
      name: 'a'.repeat(500)
    };

    render(
      <ModelConfigurationsTableRow
        configuration={configWithLongName}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle different adapter types', () => {
    const adapters = ['openai', 'anthropic', 'azure-openai', 'bedrock', 'vertex-ai', 'google-ai-studio'];

    adapters.forEach((adapter) => {
      const config: ModelConfiguration = {
        ...mockConfiguration,
        id: `config-${adapter}`,
        configuration: {
          ...mockConfiguration.configuration,
          adapter: adapter as any
        }
      };

      const { unmount } = render(
        <ModelConfigurationsTableRow
          configuration={config}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete} />

      );

      expect(screen.getByText(adapter)).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle empty string name', () => {
    const configWithEmptyName: ModelConfiguration = {
      ...mockConfiguration,
      name: ''
    };

    const { container } = render(
      <ModelConfigurationsTableRow
        configuration={configWithEmptyName}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const nameCell = container.querySelector('td');
    expect(nameCell).toBeInTheDocument();
  });

  it('should handle missing callbacks', () => {
    render(
      <ModelConfigurationsTableRow
        configuration={mockConfiguration}
        onEdit={undefined as any}
        onDelete={undefined as any} />

    );

    expect(screen.getByText('Test Configuration')).toBeInTheDocument();
  });
});
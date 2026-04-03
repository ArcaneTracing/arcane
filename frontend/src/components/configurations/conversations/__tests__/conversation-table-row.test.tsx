import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationTableRow } from '../conversation-table-row';
import { ConversationConfigurationResponse } from '@/types/conversation-configuration';

describe('ConversationTableRow', () => {
  const mockConfiguration: ConversationConfigurationResponseResponse = {
    id: 'config-1',
    name: 'Test Configuration',
    description: 'Test Description',
    stitchingAttributesName: ['attr1', 'attr2', 'attr3'],
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
      <ConversationTableRow
        configuration={mockConfiguration}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Configuration')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('attr1')).toBeInTheDocument();
    expect(screen.getByText('attr2')).toBeInTheDocument();
  });

  it('should call onEdit when Edit button is clicked', () => {
    render(
      <ConversationTableRow
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
      <ConversationTableRow
        configuration={mockConfiguration}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('config-1');
  });

  it('should display "-" for missing description', () => {
    const configWithoutDesc: ConversationConfigurationResponseResponse = {
      ...mockConfiguration,
      description: undefined
    };

    render(
      <ConversationTableRow
        configuration={configWithoutDesc}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should display "No attributes" when stitchingAttributesName is empty', () => {
    const configWithoutAttrs: ConversationConfigurationResponseResponse = {
      ...mockConfiguration,
      stitchingAttributesName: []
    };

    render(
      <ConversationTableRow
        configuration={configWithoutAttrs}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('No attributes')).toBeInTheDocument();
  });

  it('should show "+N more" badge when there are more than 2 attributes', () => {
    render(
      <ConversationTableRow
        configuration={mockConfiguration}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('should display created date', () => {
    render(
      <ConversationTableRow
        configuration={mockConfiguration}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const dateText = new Date(mockConfiguration.createdAt).toLocaleDateString();
    expect(screen.getByText(dateText)).toBeInTheDocument();
  });


  it('should handle configuration with null description', () => {
    const configWithNullDesc: ConversationConfigurationResponse = {
      ...mockConfiguration,
      description: null as any
    };

    render(
      <ConversationTableRow
        configuration={configWithNullDesc}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should handle configuration with empty string description', () => {
    const configWithEmptyDesc: ConversationConfigurationResponse = {
      ...mockConfiguration,
      description: ''
    };

    render(
      <ConversationTableRow
        configuration={configWithEmptyDesc}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should handle configuration with single attribute', () => {
    const configWithOneAttr: ConversationConfigurationResponse = {
      ...mockConfiguration,
      stitchingAttributesName: ['attr1']
    };

    render(
      <ConversationTableRow
        configuration={configWithOneAttr}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('attr1')).toBeInTheDocument();
    expect(screen.queryByText(/more/i)).not.toBeInTheDocument();
  });

  it('should handle configuration with exactly 2 attributes', () => {
    const configWithTwoAttrs: ConversationConfigurationResponse = {
      ...mockConfiguration,
      stitchingAttributesName: ['attr1', 'attr2']
    };

    render(
      <ConversationTableRow
        configuration={configWithTwoAttrs}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('attr1')).toBeInTheDocument();
    expect(screen.getByText('attr2')).toBeInTheDocument();
    expect(screen.queryByText(/more/i)).not.toBeInTheDocument();
  });

  it('should handle configuration with many attributes', () => {
    const configWithManyAttrs: ConversationConfigurationResponse = {
      ...mockConfiguration,
      stitchingAttributesName: ['attr1', 'attr2', 'attr3', 'attr4', 'attr5']
    };

    render(
      <ConversationTableRow
        configuration={configWithManyAttrs}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('attr1')).toBeInTheDocument();
    expect(screen.getByText('attr2')).toBeInTheDocument();
    expect(screen.getByText('+3 more')).toBeInTheDocument();
  });

  it('should handle very long configuration name', () => {
    const configWithLongName: ConversationConfigurationResponse = {
      ...mockConfiguration,
      name: 'a'.repeat(500)
    };

    render(
      <ConversationTableRow
        configuration={configWithLongName}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle very long description', () => {
    const configWithLongDesc: ConversationConfigurationResponse = {
      ...mockConfiguration,
      description: 'b'.repeat(1000)
    };

    render(
      <ConversationTableRow
        configuration={configWithLongDesc}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('b'.repeat(1000))).toBeInTheDocument();
  });

  it('should handle very long attribute names', () => {
    const configWithLongAttrs: ConversationConfigurationResponse = {
      ...mockConfiguration,
      stitchingAttributesName: ['a'.repeat(200), 'b'.repeat(200)]
    };

    render(
      <ConversationTableRow
        configuration={configWithLongAttrs}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('a'.repeat(200))).toBeInTheDocument();
    expect(screen.getByText('b'.repeat(200))).toBeInTheDocument();
  });

  it('should handle empty string name', () => {
    const configWithEmptyName: ConversationConfigurationResponse = {
      ...mockConfiguration,
      name: ''
    };

    const { container } = render(
      <ConversationTableRow
        configuration={configWithEmptyName}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );


    const nameCell = container.querySelector('td');
    expect(nameCell).toBeInTheDocument();
  });

  it('should handle missing callbacks', () => {
    render(
      <ConversationTableRow
        configuration={mockConfiguration}
        onEdit={undefined as any}
        onDelete={undefined as any} />

    );

    expect(screen.getByText('Test Configuration')).toBeInTheDocument();
  });
});
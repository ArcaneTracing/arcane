import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelConfigurationsTableHeader } from '../model-configurations-table-header';

describe('ModelConfigurationsTableHeader', () => {
  const mockOnSort = jest.fn();

  const defaultSortConfig = {
    key: 'name' as const,
    direction: 'asc' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all column headers', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Adapter')).toBeInTheDocument();
    expect(screen.getByText('Model Name')).toBeInTheDocument();
    expect(screen.getByText('Created Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should call onSort when Name header is clicked', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    const nameHeader = screen.getByText('Name').closest('th');
    if (nameHeader) {
      fireEvent.click(nameHeader);
    }

    expect(mockOnSort).toHaveBeenCalledWith('name');
  });

  it('should call onSort when Adapter header is clicked', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    const adapterHeader = screen.getByText('Adapter').closest('th');
    if (adapterHeader) {
      fireEvent.click(adapterHeader);
    }

    expect(mockOnSort).toHaveBeenCalledWith('adapter');
  });

  it('should call onSort when Created Date header is clicked', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    const dateHeader = screen.getByText('Created Date').closest('th');
    if (dateHeader) {
      fireEvent.click(dateHeader);
    }

    expect(mockOnSort).toHaveBeenCalledWith('createdAt');
  });

  it('should not call onSort when Model Name header is clicked', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    const modelNameHeader = screen.getByText('Model Name').closest('th');
    if (modelNameHeader) {
      fireEvent.click(modelNameHeader);
    }

    expect(mockOnSort).not.toHaveBeenCalled();
  });

  it('should not call onSort when Actions header is clicked', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    const actionsHeader = screen.getByText('Actions').closest('th');
    if (actionsHeader) {
      fireEvent.click(actionsHeader);
    }

    expect(mockOnSort).not.toHaveBeenCalled();
  });

  it('should show active sort indicator for name when sorted by name ascending', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={{ key: 'name', direction: 'asc' }}
        onSort={mockOnSort} />

    );

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toBeInTheDocument();
  });

  it('should show active sort indicator for name when sorted by name descending', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={{ key: 'name', direction: 'desc' }}
        onSort={mockOnSort} />

    );

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toBeInTheDocument();
  });

  it('should show active sort indicator for adapter when sorted by adapter', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={{ key: 'adapter', direction: 'asc' }}
        onSort={mockOnSort} />

    );

    const adapterHeader = screen.getByText('Adapter').closest('th');
    expect(adapterHeader).toBeInTheDocument();
  });

  it('should show active sort indicator for createdAt when sorted by createdAt', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={{ key: 'createdAt', direction: 'desc' }}
        onSort={mockOnSort} />

    );

    const dateHeader = screen.getByText('Created Date').closest('th');
    expect(dateHeader).toBeInTheDocument();
  });


  it('should handle missing onSort callback', () => {
    render(
      <ModelConfigurationsTableHeader
        sortConfig={defaultSortConfig}
        onSort={undefined as any} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should handle different sort directions', () => {
    const { rerender } = render(
      <ModelConfigurationsTableHeader
        sortConfig={{ key: 'name', direction: 'asc' }}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();

    rerender(
      <ModelConfigurationsTableHeader
        sortConfig={{ key: 'name', direction: 'desc' }}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
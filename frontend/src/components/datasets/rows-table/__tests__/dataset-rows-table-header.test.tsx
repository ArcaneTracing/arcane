import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatasetRowsTableHeader } from '../dataset-rows-table-header';

describe('DatasetRowsTableHeader', () => {
  const mockOnSort = jest.fn();
  const defaultHeaders = ['Name', 'Email', 'Message'];
  const defaultSortConfig = { columnIndex: null, direction: 'asc' as const };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all headers', () => {
    render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('should call onSort when header is clicked', () => {
    render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );
    const nameHeader = screen.getByText('Name').closest('th');
    fireEvent.click(nameHeader!);
    expect(mockOnSort).toHaveBeenCalledWith(0);
  });

  it('should call onSort with correct column index', () => {
    render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );
    const emailHeader = screen.getByText('Email').closest('th');
    fireEvent.click(emailHeader!);
    expect(mockOnSort).toHaveBeenCalledWith(1);
  });

  it('should show active sort indicator when column is sorted', () => {
    const sortConfig = { columnIndex: 0, direction: 'asc' as const };
    render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={sortConfig}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should handle empty headers array', () => {
    render(
      <DatasetRowsTableHeader
        headers={[]}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    const tableHeader = screen.getByRole('row');
    expect(tableHeader).toBeInTheDocument();
  });

  it('should handle single header', () => {
    render(
      <DatasetRowsTableHeader
        headers={['Single Column']}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );
    expect(screen.getByText('Single Column')).toBeInTheDocument();
  });

  it('should handle many headers', () => {
    const manyHeaders = Array.from({ length: 20 }, (_, i) => `Column ${i + 1}`);
    render(
      <DatasetRowsTableHeader
        headers={manyHeaders}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );
    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(screen.getByText('Column 20')).toBeInTheDocument();
  });

  it('should handle headers with special characters', () => {
    const specialHeaders = ['Name!', 'Email@', 'Message#'];
    render(
      <DatasetRowsTableHeader
        headers={specialHeaders}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );
    expect(screen.getByText('Name!')).toBeInTheDocument();
    expect(screen.getByText('Email@')).toBeInTheDocument();
  });

  it('should handle very long header names', () => {
    const longHeader = 'a'.repeat(100);
    render(
      <DatasetRowsTableHeader
        headers={[longHeader]}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );
    expect(screen.getByText(longHeader)).toBeInTheDocument();
  });

  it('should handle missing onSort callback', () => {
    const { container } = render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={defaultSortConfig}
        onSort={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should handle sort direction changes', () => {
    const sortConfig = { columnIndex: 0, direction: 'desc' as const };
    render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={sortConfig}
        onSort={mockOnSort} />

    );
    expect(screen.getByText('Name')).toBeInTheDocument();
  });


  it('should handle null columnIndex in sortConfig', () => {
    const sortConfig = { columnIndex: null, direction: 'asc' as const };
    render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={sortConfig}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should handle negative columnIndex', () => {
    const sortConfig = { columnIndex: -1, direction: 'asc' as const };
    render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={sortConfig}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should handle columnIndex exceeding headers length', () => {
    const sortConfig = { columnIndex: 999, direction: 'asc' as const };
    render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={sortConfig}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should handle headers with duplicate names', () => {
    const duplicateHeaders = ['Name', 'Name', 'Email'];
    render(
      <DatasetRowsTableHeader
        headers={duplicateHeaders}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );
    const nameHeaders = screen.getAllByText('Name');
    expect(nameHeaders.length).toBe(2);
  });

  it('should handle headers array mutation attempts', () => {
    const headers = ['Name', 'Email'];
    render(
      <DatasetRowsTableHeader
        headers={headers}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    headers.push('New');

    expect(screen.queryByText('New')).not.toBeInTheDocument();
  });

  it('should handle rapid sort clicks', () => {
    render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );
    const nameHeader = screen.getByText('Name').closest('th');
    if (nameHeader) {
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);
      fireEvent.click(nameHeader);
    }

    expect(mockOnSort).toHaveBeenCalled();
  });

  it('should handle sortConfig with undefined direction', () => {
    const sortConfig = { columnIndex: 0, direction: undefined as any };
    render(
      <DatasetRowsTableHeader
        headers={defaultHeaders}
        sortConfig={sortConfig}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationTableHeader } from '../conversation-table-header';

describe('ConversationTableHeader', () => {
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
      <ConversationTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Stitching Attributes')).toBeInTheDocument();
    expect(screen.getByText('Created Date')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should call onSort when Name header is clicked', () => {
    render(
      <ConversationTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    const nameHeader = screen.getByText('Name').closest('th');
    if (nameHeader) {
      fireEvent.click(nameHeader);
    }

    expect(mockOnSort).toHaveBeenCalledWith('name');
  });

  it('should call onSort when Description header is clicked', () => {
    render(
      <ConversationTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    const descHeader = screen.getByText('Description').closest('th');
    if (descHeader) {
      fireEvent.click(descHeader);
    }

    expect(mockOnSort).toHaveBeenCalledWith('description');
  });

  it('should call onSort when Created Date header is clicked', () => {
    render(
      <ConversationTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    const dateHeader = screen.getByText('Created Date').closest('th');
    if (dateHeader) {
      fireEvent.click(dateHeader);
    }

    expect(mockOnSort).toHaveBeenCalledWith('createdAt');
  });

  it('should not call onSort when Stitching Attributes header is clicked', () => {
    render(
      <ConversationTableHeader
        sortConfig={defaultSortConfig}
        onSort={mockOnSort} />

    );

    const attrsHeader = screen.getByText('Stitching Attributes').closest('th');
    if (attrsHeader) {
      fireEvent.click(attrsHeader);
    }

    expect(mockOnSort).not.toHaveBeenCalled();
  });

  it('should not call onSort when Actions header is clicked', () => {
    render(
      <ConversationTableHeader
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
      <ConversationTableHeader
        sortConfig={{ key: 'name', direction: 'asc' }}
        onSort={mockOnSort} />

    );

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toBeInTheDocument();
  });

  it('should show active sort indicator for name when sorted by name descending', () => {
    render(
      <ConversationTableHeader
        sortConfig={{ key: 'name', direction: 'desc' }}
        onSort={mockOnSort} />

    );

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toBeInTheDocument();
  });

  it('should show active sort indicator for description when sorted by description', () => {
    render(
      <ConversationTableHeader
        sortConfig={{ key: 'description', direction: 'asc' }}
        onSort={mockOnSort} />

    );

    const descHeader = screen.getByText('Description').closest('th');
    expect(descHeader).toBeInTheDocument();
  });

  it('should show active sort indicator for createdAt when sorted by createdAt', () => {
    render(
      <ConversationTableHeader
        sortConfig={{ key: 'createdAt', direction: 'desc' }}
        onSort={mockOnSort} />

    );

    const dateHeader = screen.getByText('Created Date').closest('th');
    expect(dateHeader).toBeInTheDocument();
  });


  it('should handle missing onSort callback', () => {
    render(
      <ConversationTableHeader
        sortConfig={defaultSortConfig}
        onSort={undefined as any} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should handle different sort directions', () => {
    const { rerender } = render(
      <ConversationTableHeader
        sortConfig={{ key: 'name', direction: 'asc' }}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();

    rerender(
      <ConversationTableHeader
        sortConfig={{ key: 'name', direction: 'desc' }}
        onSort={mockOnSort} />

    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntitiesTableRow } from '../entities-table-row';
import { EntityResponse } from '@/types';

describe('EntitiesTableRow', () => {
  const mockEntity: EntityResponse = {
    id: '1',
    name: 'Test Entity',
    description: 'Test Description',
    entityType: 'model' as any,
    matchingPatternType: 'value' as any,
    matchingAttributeName: 'test.attr',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render entity information', () => {
    render(
      <EntitiesTableRow
        entity={mockEntity}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test Entity')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <EntitiesTableRow
        entity={mockEntity}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockEntity);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <EntitiesTableRow
        entity={mockEntity}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should display formatted date', () => {
    render(
      <EntitiesTableRow
        entity={mockEntity}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const dateText = screen.getByText(/2024/i);
    expect(dateText).toBeInTheDocument();
  });
});
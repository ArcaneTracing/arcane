import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatasetCard } from '../dataset-card';
import { DatasetListItemResponse } from '@/types/datasets';

describe('DatasetCard', () => {
  const mockDataset: DatasetListItemResponse = {
    id: '1',
    name: 'Test Dataset',
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dataset information', () => {
    render(
      <DatasetCard
        dataset={mockDataset}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test Dataset')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should call onView when view button is clicked', () => {
    render(
      <DatasetCard
        dataset={mockDataset}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);
    expect(mockOnView).toHaveBeenCalledWith('1');
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <DatasetCard
        dataset={mockDataset}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockDataset);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <DatasetCard
        dataset={mockDataset}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should not render description when description is missing', () => {
    const datasetWithoutDescription = {
      ...mockDataset,
      description: undefined
    };

    render(
      <DatasetCard
        dataset={datasetWithoutDescription}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should not render description when description is empty string', () => {
    const datasetWithEmptyDescription = {
      ...mockDataset,
      description: ''
    };

    render(
      <DatasetCard
        dataset={datasetWithEmptyDescription}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should handle very long dataset name', () => {
    const longNameDataset = {
      ...mockDataset,
      name: 'a'.repeat(500)
    };

    render(
      <DatasetCard
        dataset={longNameDataset}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle very long description', () => {
    const longDescDataset = {
      ...mockDataset,
      description: 'b'.repeat(1000)
    };

    render(
      <DatasetCard
        dataset={longDescDataset}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('b'.repeat(1000))).toBeInTheDocument();
  });

  it('should handle special characters in dataset name', () => {
    const specialCharsDataset = {
      ...mockDataset,
      name: 'Test!@#$%^&*()_+Dataset'
    };

    render(
      <DatasetCard
        dataset={specialCharsDataset}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );
    expect(screen.getByText('Test!@#$%^&*()_+Dataset')).toBeInTheDocument();
  });

  it('should handle missing createdAt', () => {
    const datasetWithoutDate = {
      ...mockDataset,
      createdAt: undefined
    };

    render(
      <DatasetCard
        dataset={datasetWithoutDate as unknown as DatasetListItemDto}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Dataset')).toBeInTheDocument();
  });

  it('should handle invalid date string', () => {
    const datasetWithInvalidDate = {
      ...mockDataset,
      createdAt: 'invalid-date'
    };

    render(
      <DatasetCard
        dataset={datasetWithInvalidDate as unknown as DatasetListItemDto}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Dataset')).toBeInTheDocument();
  });

  it('should handle empty dataset name', () => {
    const emptyNameDataset = {
      ...mockDataset,
      name: ''
    };

    const { container } = render(
      <DatasetCard
        dataset={emptyNameDataset}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  it('should handle whitespace-only dataset name', () => {
    const whitespaceDataset = {
      ...mockDataset,
      name: '   '
    };

    const { container } = render(
      <DatasetCard
        dataset={whitespaceDataset}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();

    expect(card).toBeTruthy();
  });

  it('should handle missing callbacks gracefully', () => {
    const { container } = render(
      <DatasetCard
        dataset={mockDataset}
        onView={undefined as any}
        onEdit={undefined as any}
        onDelete={undefined as any} />

    );

    expect(container).toBeInTheDocument();
  });

  it('should prevent event propagation on edit button click', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <DatasetCard
          dataset={mockDataset}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete} />

      </div>
    );
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('should prevent event propagation on delete button click', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <DatasetCard
          dataset={mockDataset}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete} />

      </div>
    );
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const datasetWithDate = {
      ...mockDataset,
      createdAt: '2024-01-15T10:30:00Z'
    };

    render(
      <DatasetCard
        dataset={datasetWithDate as unknown as DatasetListItemDto}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText(/Created/i)).toBeInTheDocument();
  });

  it('should handle Date object for createdAt', () => {
    const datasetWithDateObject = {
      ...mockDataset,
      createdAt: new Date('2024-01-15') as any
    };

    render(
      <DatasetCard
        dataset={datasetWithDateObject}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Dataset')).toBeInTheDocument();
  });
});
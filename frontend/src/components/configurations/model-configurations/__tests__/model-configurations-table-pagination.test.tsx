import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelConfigurationsTablePagination } from '../model-configurations-table-pagination';
import { Meta } from '@/types/shared';

describe('ModelConfigurationsTablePagination', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when totalPages is 1', () => {
    const meta: Meta = {
      page: 1,
      limit: 10,
      total: 5,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    };

    const { container } = render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when totalPages is 0', () => {
    const meta: Meta = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    };

    const { container } = render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render pagination when totalPages is greater than 1', () => {
    const meta: Meta = {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/Showing/i)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should display correct page information', () => {
    const meta: Meta = {
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('should display correct item range', () => {
    const meta: Meta = {
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/Showing 11 to 20 of 25/i)).toBeInTheDocument();
  });

  it('should display correct item range for first page', () => {
    const meta: Meta = {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/Showing 1 to 10 of 25/i)).toBeInTheDocument();
  });

  it('should display correct item range for last page', () => {
    const meta: Meta = {
      page: 3,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: false,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/Showing 21 to 25 of 25/i)).toBeInTheDocument();
  });

  it('should disable Previous button on first page', () => {
    const meta: Meta = {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toHaveAttribute('disabled');
  });

  it('should disable Next button on last page', () => {
    const meta: Meta = {
      page: 3,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: false,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toHaveAttribute('disabled');
  });

  it('should enable Previous button when hasPreviousPage is true', () => {
    const meta: Meta = {
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).not.toHaveAttribute('disabled');
  });

  it('should enable Next button when hasNextPage is true', () => {
    const meta: Meta = {
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toHaveAttribute('disabled');
  });

  it('should call onPageChange with previous page when Previous button is clicked', () => {
    const meta: Meta = {
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const previousButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(previousButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('should call onPageChange with next page when Next button is clicked', () => {
    const meta: Meta = {
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });


  it('should handle single item on last page', () => {
    const meta: Meta = {
      page: 3,
      limit: 10,
      total: 21,
      totalPages: 3,
      hasNextPage: false,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/Showing 21 to 21 of 21/i)).toBeInTheDocument();
  });

  it('should handle different limit values', () => {
    const meta: Meta = {
      page: 2,
      limit: 5,
      total: 15,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/Showing 6 to 10 of 15/i)).toBeInTheDocument();
  });

  it('should handle large total values', () => {
    const meta: Meta = {
      page: 10,
      limit: 10,
      total: 1000,
      totalPages: 100,
      hasNextPage: true,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/Showing 91 to 100 of 1000/i)).toBeInTheDocument();
    expect(screen.getByText('Page 10 of 100')).toBeInTheDocument();
  });

  it('should handle page 1 with hasPreviousPage false', () => {
    const meta: Meta = {
      page: 1,
      limit: 10,
      total: 15,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toHaveAttribute('disabled');
  });

  it('should handle last page with hasNextPage false', () => {
    const meta: Meta = {
      page: 2,
      limit: 10,
      total: 15,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true
    };

    render(
      <ModelConfigurationsTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toHaveAttribute('disabled');
  });
});
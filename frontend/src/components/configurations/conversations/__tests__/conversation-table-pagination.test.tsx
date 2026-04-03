import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationTablePagination } from '../conversation-table-pagination';
import { Meta } from '@/types/shared';
import { render as customRender } from '@/__tests__/test-utils';

describe('ConversationTablePagination', () => {
  const mockOnPageChange = jest.fn();

  const createMeta = (overrides: Partial<Meta> = {}): Meta => ({
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNextPage: true,
    hasPreviousPage: false,
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pagination controls', () => {
    const meta = createMeta();
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/showing/i)).toBeInTheDocument();
  });

  it('should display correct range for first page', () => {
    const meta = createMeta({ page: 1, limit: 10, total: 100 });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/showing 1-10 of 100/i)).toBeInTheDocument();
  });

  it('should display correct range for middle page', () => {
    const meta = createMeta({ page: 5, limit: 10, total: 100 });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/showing 41-50 of 100/i)).toBeInTheDocument();
  });

  it('should display correct range for last page', () => {
    const meta = createMeta({ page: 10, limit: 10, total: 100 });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/showing 91-100 of 100/i)).toBeInTheDocument();
  });

  it('should display correct range when total is less than limit', () => {
    const meta = createMeta({ page: 1, limit: 10, total: 5 });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/showing 1-5 of 5/i)).toBeInTheDocument();
  });

  it('should call onPageChange with 1 when first page button is clicked', () => {
    const meta = createMeta({ page: 5 });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const firstPageButton = screen.getAllByRole('button')[0];
    fireEvent.click(firstPageButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('should call onPageChange with previous page when previous button is clicked', () => {
    const meta = createMeta({ page: 5, hasPreviousPage: true });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const previousButton = screen.getAllByRole('button')[1];

    expect(previousButton).not.toBeDisabled();
    fireEvent.click(previousButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it('should call onPageChange with next page when next button is clicked', () => {
    const meta = createMeta({ page: 5 });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const nextButton = screen.getAllByRole('button')[2];
    fireEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(6);
  });

  it('should call onPageChange with last page when last page button is clicked', () => {
    const meta = createMeta({ page: 5, totalPages: 10 });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const lastPageButton = screen.getAllByRole('button')[3];
    fireEvent.click(lastPageButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(10);
  });

  it('should disable first page button when on first page', () => {
    const meta = createMeta({ page: 1 });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const firstPageButton = screen.getAllByRole('button')[0];
    expect(firstPageButton).toBeDisabled();
  });

  it('should disable previous button when hasPreviousPage is false', () => {
    const meta = createMeta({ page: 1, hasPreviousPage: false });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const previousButton = screen.getAllByRole('button')[1];
    expect(previousButton).toBeDisabled();
  });

  it('should disable next button when hasNextPage is false', () => {
    const meta = createMeta({ page: 10, hasNextPage: false, totalPages: 10 });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const nextButton = screen.getAllByRole('button')[2];
    expect(nextButton).toBeDisabled();
  });

  it('should disable last page button when on last page', () => {
    const meta = createMeta({ page: 10, totalPages: 10 });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    const lastPageButton = screen.getAllByRole('button')[3];
    expect(lastPageButton).toBeDisabled();
  });

  it('should handle edge case with single page', () => {
    const meta = createMeta({ page: 1, total: 5, limit: 10, totalPages: 1, hasNextPage: false });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/showing 1-5 of 5/i)).toBeInTheDocument();
    const firstPageButton = screen.getAllByRole('button')[0];
    const previousButton = screen.getAllByRole('button')[1];
    const nextButton = screen.getAllByRole('button')[2];
    const lastPageButton = screen.getAllByRole('button')[3];

    expect(firstPageButton).toBeDisabled();
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
    expect(lastPageButton).toBeDisabled();
  });

  it('should handle empty results', () => {
    const meta = createMeta({ page: 1, total: 0, totalPages: 0, hasNextPage: false });
    customRender(
      <ConversationTablePagination meta={meta} onPageChange={mockOnPageChange} />
    );

    expect(screen.getByText(/showing 1-0 of 0/i)).toBeInTheDocument();
  });
});
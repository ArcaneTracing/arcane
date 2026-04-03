import React from 'react';
import { render, screen } from '@testing-library/react';
import { TableContainer } from '../table-container';

describe('TableContainer', () => {
  it('should render children when not loading, no error, and not empty', () => {
    render(
      <TableContainer>
        <div>Test Content</div>
      </TableContainer>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render loading state when isLoading is true', () => {
    render(
      <TableContainer isLoading={true}>
        <div>Test Content</div>
      </TableContainer>
    );


    const loader = screen.getByTestId('icon-loader2');
    expect(loader).toBeInTheDocument();
  });

  it('should render error state when error is provided', () => {
    render(
      <TableContainer error="Something went wrong">
        <div>Test Content</div>
      </TableContainer>
    );

    expect(screen.getByText(/Error: Something went wrong/i)).toBeInTheDocument();
  });

  it('should render error state when Error object is provided', () => {
    const error = new Error('Test error message');
    render(
      <TableContainer error={error}>
        <div>Test Content</div>
      </TableContainer>
    );

    expect(screen.getByText(/Error: Test error message/i)).toBeInTheDocument();
  });

  it('should render empty state when isEmpty is true', () => {
    render(
      <TableContainer isEmpty={true} emptyMessage="No data available">
        <div>Test Content</div>
      </TableContainer>
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should use default empty message when isEmpty is true and no emptyMessage provided', () => {
    render(
      <TableContainer isEmpty={true}>
        <div>Test Content</div>
      </TableContainer>
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should prioritize loading over error', () => {
    render(
      <TableContainer isLoading={true} error="Error message">
        <div>Test Content</div>
      </TableContainer>
    );


    const loader = screen.getByTestId('icon-loader2');
    expect(loader).toBeInTheDocument();
    expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
  });

  it('should prioritize loading over empty', () => {
    render(
      <TableContainer isLoading={true} isEmpty={true}>
        <div>Test Content</div>
      </TableContainer>
    );


    const loader = screen.getByTestId('icon-loader2');
    expect(loader).toBeInTheDocument();
    expect(screen.queryByText('No items found')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TableContainer className="custom-class">
        <div>Test Content</div>
      </TableContainer>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TableEmptyState } from '../table-empty-state';
import { Search } from 'lucide-react';

describe('TableEmptyState', () => {
  it('should render default message', () => {
    render(<TableEmptyState />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render custom message', () => {
    render(<TableEmptyState message="No data available" />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    render(<TableEmptyState icon={Search} />);
    const icon = document.querySelector('svg[data-testid="icon-search"]');
    expect(icon).toBeInTheDocument();
  });

  it('should not render icon when not provided', () => {
    render(<TableEmptyState />);

    const svg = document.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TableEmptyState className="custom-class" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});
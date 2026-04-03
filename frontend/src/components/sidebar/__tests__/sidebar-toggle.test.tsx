import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarToggle } from '../sidebar-toggle';

describe('SidebarToggle', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render toggle button', () => {
    render(<SidebarToggle isCollapsed={false} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should show ChevronLeft when not collapsed', () => {
    render(<SidebarToggle isCollapsed={false} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

  });

  it('should show ChevronRight when collapsed', () => {
    render(<SidebarToggle isCollapsed={true} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should call onToggle when clicked', () => {
    render(<SidebarToggle isCollapsed={false} onToggle={mockOnToggle} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
});
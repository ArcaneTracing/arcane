import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ForbiddenPage from '../../forbidden/page';


const mockBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate
}));

describe('ForbiddenPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).history;
    (window as any).history = {
      back: mockBack,
      length: 2
    };
    Object.defineProperty(document, 'referrer', {
      writable: true,
      value: 'http://example.com/previous'
    });
  });

  it('should render 403 error message', () => {
    render(<ForbiddenPage />);

    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('Access Forbidden')).toBeInTheDocument();
    expect(screen.getByText(/You don't have permission to access this resource/)).toBeInTheDocument();
  });

  it('should have a back button', () => {
    render(<ForbiddenPage />);

    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should call window.history.back() when back button is clicked and history exists', () => {
    render(<ForbiddenPage />);

    const backButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('should navigate to /projects when back button is clicked and no history', () => {
    (window as any).history.length = 1;
    Object.defineProperty(document, 'referrer', {
      writable: true,
      value: ''
    });

    render(<ForbiddenPage />);

    const backButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/projects',
      replace: undefined
    });
  });

  it('should navigate to /projects when back button is clicked and no referrer', () => {
    (window as any).history.length = 2;
    Object.defineProperty(document, 'referrer', {
      writable: true,
      value: ''
    });

    render(<ForbiddenPage />);

    const backButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/projects',
      replace: undefined
    });
  });
});
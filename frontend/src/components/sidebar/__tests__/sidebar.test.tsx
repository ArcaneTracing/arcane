import React from 'react';
import { screen } from '@testing-library/react';
import { Sidebar } from '../sidebar';
import { useProjectsQuery } from '@/hooks/projects/use-projects-query';
import { useAuthProfile } from '@/store/authStore';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/hooks/projects/use-projects-query');
jest.mock('@/store/authStore');
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    data: { user: { id: '1', email: 'test@example.com' } },
    isLoading: false
  }))
}));
jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: jest.fn(() => 'org-1')
}));
jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
  useParams: jest.fn(() => ({ organisationId: 'org-1', projectId: 'project-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

const mockUseProjectsQuery = useProjectsQuery as jest.MockedFunction<typeof useProjectsQuery>;
const mockUseAuthProfile = useAuthProfile as jest.MockedFunction<typeof useAuthProfile>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

describe('Sidebar', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLocation.mockReturnValue({ pathname: '/' } as any);
    mockUseProjectsQuery.mockReturnValue({
      data: [
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' }] as
      any,
      isLoading: false,
      error: null
    } as any);
  });

  it('should not render on login page', () => {
    mockUseLocation.mockReturnValue({ pathname: '/login' } as any);
    mockUseAuthProfile.mockReturnValue(null);

    const { container } = customRender(<Sidebar />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when not authenticated and not loading', () => {
    mockUseAuthProfile.mockReturnValue(null);

    const { container } = customRender(<Sidebar />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when authenticated', () => {
    mockUseAuthProfile.mockReturnValue({ email: 'test@example.com', name: 'Test User' } as any);

    customRender(<Sidebar />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('should render sidebar logo', () => {
    mockUseAuthProfile.mockReturnValue({ email: 'test@example.com', name: 'Test User' } as any);

    customRender(<Sidebar />);
    expect(screen.getByAltText('Arcane Logo')).toBeInTheDocument();
  });

  it('should render sidebar navigation when project is selected', () => {
    mockUseAuthProfile.mockReturnValue({ email: 'test@example.com', name: 'Test User' } as any);

    customRender(<Sidebar />);
    expect(screen.getByText('Traces')).toBeInTheDocument();
  });

  it('should handle project change', () => {
    mockUseAuthProfile.mockReturnValue({ email: 'test@example.com', name: 'Test User' } as any);
    mockUseLocation.mockReturnValue({ pathname: '/projects/1/traces' } as any);

    customRender(<Sidebar />);

    expect(mockUseProjectsQuery).toHaveBeenCalled();
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useLocation } from '@tanstack/react-router';


jest.mock('@/lib/navigation', () => ({
  createNavigationPath: (path: string) => path
}));

jest.mock('@tanstack/react-router', () => {
  const React = require('react');
  return {
    useLocation: jest.fn(() => ({ pathname: '/' })),
    useNavigate: jest.fn(() => jest.fn()),
    useParams: jest.fn(() => ({ organisationId: 'org-1', projectId: 'project-1' })),
    useSearch: jest.fn(() => ({})),
    Link: ({ children, to, params, ...props }: any) => {

      let href = to;
      if (params && typeof to === 'string') {
        Object.keys(params).forEach((key) => {
          href = href.replace(`$${key}`, params[key]);
        });
      }
      return React.createElement('a', { href, ...props }, children);
    }
  };
});

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: jest.fn(() => 'org-1')
}));

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: jest.fn(() => ({
    hasPermission: jest.fn(() => true)
  }))
}));


import { SidebarNavigation } from '../sidebar-navigation';

const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

describe('SidebarNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/' } as any);
  });

  it('should not render when no project is selected', () => {
    const { container } = render(
      <SidebarNavigation isCollapsed={false} selectedProjectId={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render navigation items when project is selected', () => {
    mockUseLocation.mockReturnValue({ pathname: '/projects/1/traces' } as any);
    render(
      <SidebarNavigation isCollapsed={false} selectedProjectId="1" />
    );

    expect(screen.getByText('Traces')).toBeInTheDocument();
    expect(screen.getByText('Conversations')).toBeInTheDocument();
    expect(screen.getByText('Annotation Queues')).toBeInTheDocument();
    expect(screen.getByText('Datasets')).toBeInTheDocument();
    expect(screen.getByText('Prompts')).toBeInTheDocument();
    expect(screen.getByText('Scores')).toBeInTheDocument();
    expect(screen.getByText('Experiments')).toBeInTheDocument();
    expect(screen.getByText('Evaluations')).toBeInTheDocument();
  });

  it('should hide text when collapsed', () => {
    mockUseLocation.mockReturnValue({ pathname: '/projects/1/traces' } as any);
    render(
      <SidebarNavigation isCollapsed={true} selectedProjectId="1" />
    );

    expect(screen.queryByText('Traces')).not.toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should highlight active navigation item', () => {
    mockUseLocation.mockReturnValue({ pathname: '/projects/1/traces' } as any);
    const { container } = render(
      <SidebarNavigation isCollapsed={false} selectedProjectId="1" />
    );

    const tracesLink = screen.getByText('Traces').closest('a');
    expect(tracesLink).toHaveClass('before:absolute');
  });

  it('should generate correct hrefs with project ID', () => {
    mockUseLocation.mockReturnValue({ pathname: '/projects/1/traces' } as any);
    render(
      <SidebarNavigation isCollapsed={false} selectedProjectId="1" />
    );

    const tracesLink = screen.getByText('Traces').closest('a');
    expect(tracesLink).toHaveAttribute('href', '/organisations/org-1/projects/1/traces');
  });
});
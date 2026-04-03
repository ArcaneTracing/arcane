import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { SidebarProfile } from '../sidebar-profile';
import { useLogout } from '@/store/authStore';
import { useLocation } from '@tanstack/react-router';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/store/authStore');
jest.mock('@/store/organisationStore', () => ({
  useClearOrganisation: jest.fn(() => jest.fn())
}));
jest.mock('@/lib/better-auth', () => ({
  authClient: {
    signOut: jest.fn().mockResolvedValue(undefined)
  }
}));
jest.mock('@/api/permissions', () => ({
  clearPermissionsCache: jest.fn()
}));
jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(() => jest.fn()),
  useLocation: jest.fn(),
  useParams: jest.fn(() => ({ organisationId: 'org-1', projectId: 'project-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

const mockUseLogout = useLogout as jest.MockedFunction<typeof useLogout>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;

describe('SidebarProfile', () => {
  const mockProfile = {
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/avatar.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLogout.mockReturnValue(jest.fn());
    mockUseLocation.mockReturnValue({ pathname: '/' } as any);

    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('should render loading state', () => {
    customRender(
      <SidebarProfile
        isCollapsed={false}
        profile={null}
        profileLoading={true}
        onSettingsClick={jest.fn()} />

    );


    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should not render when profile is null and not loading', () => {
    const { container } = customRender(
      <SidebarProfile
        isCollapsed={false}
        profile={null}
        profileLoading={false}
        onSettingsClick={jest.fn()} />

    );

    expect(container.firstChild).toBeNull();
  });

  it('should render profile information when expanded', () => {
    customRender(
      <SidebarProfile
        isCollapsed={false}
        profile={mockProfile as any}
        profileLoading={false}
        onSettingsClick={jest.fn()} />

    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should render collapsed profile', () => {
    customRender(
      <SidebarProfile
        isCollapsed={true}
        profile={mockProfile as any}
        profileLoading={false}
        onSettingsClick={jest.fn()} />

    );

    expect(screen.queryByText('Test User')).not.toBeInTheDocument();

    const avatar = screen.getByAltText('Test User');
    expect(avatar).toBeInTheDocument();
  });

  it('should call onSettingsClick when settings is clicked', () => {
    const onSettingsClick = jest.fn();
    customRender(
      <SidebarProfile
        isCollapsed={false}
        profile={mockProfile as any}
        profileLoading={false}
        onSettingsClick={onSettingsClick} />

    );

    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    expect(onSettingsClick).toHaveBeenCalled();
  });

  it('should call logout when logout is clicked', () => {
    customRender(
      <SidebarProfile
        isCollapsed={false}
        profile={mockProfile as any}
        profileLoading={false}
        onSettingsClick={jest.fn()} />

    );

    const logoutButton = screen.getByText('Log out');
    fireEvent.click(logoutButton);
    expect(mockUseLogout).toHaveBeenCalled();
  });

  it('should display profile initial when no image', () => {
    const profileWithoutImage = {
      name: 'Test User',
      email: 'test@example.com'
    };

    customRender(
      <SidebarProfile
        isCollapsed={false}
        profile={profileWithoutImage as any}
        profileLoading={false}
        onSettingsClick={jest.fn()} />

    );

    expect(screen.getByText('T')).toBeInTheDocument();
  });
});
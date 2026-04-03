import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AuthGuard from '../AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useSetAuthProfile } from '@/store/authStore';

jest.mock('@/hooks/useAuth');
jest.mock('@/store/authStore', () => ({
  useSetAuthProfile: jest.fn()
}));

let mockLocationPathname = '/';
jest.mock('@tanstack/react-router', () => ({
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: mockLocationPathname })
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockSetProfile = jest.fn();

const mockUseSetAuthProfile = useSetAuthProfile as jest.MockedFunction<typeof useSetAuthProfile>;

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSetAuthProfile.mockReturnValue(mockSetProfile);
    mockLocationPathname = '/';
    delete (window as any).location;
    (window as any).location = { pathname: '/test', href: '' };
  });

  it('should render children when authenticated', () => {
    mockUseAuth.mockReturnValue({
      data: { loggedIn: true, profile: { name: 'Test', email: 'test@test.com' } },
      isLoading: false,
      error: null
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show loading state when loading', () => {
    mockUseAuth.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show custom fallback when loading', () => {
    mockUseAuth.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    } as any);

    render(
      <AuthGuard fallback={<div>Custom Loading</div>}>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
  });

  it('should show auth UI when not authenticated (with or without error)', () => {
    mockUseAuth.mockReturnValue({
      data: { loggedIn: false, profile: null },
      isLoading: false,
      error: new Error('Auth error')
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('Please log in to continue.')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show auth UI when not authenticated and no error (e.g. fresh session, no cookies)', () => {
    mockUseAuth.mockReturnValue({
      data: { loggedIn: false, profile: null },
      isLoading: false,
      error: null
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to login/i })).toHaveAttribute('href', expect.stringContaining('/login'));
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should allow children on login page even when not authenticated', () => {
    mockLocationPathname = '/login';
    mockUseAuth.mockReturnValue({
      data: { loggedIn: false, profile: null },
      isLoading: false,
      error: null
    } as any);

    render(
      <AuthGuard>
        <div>Login Page</div>
      </AuthGuard>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should allow children on register page even when not authenticated', () => {
    mockLocationPathname = '/register';
    mockUseAuth.mockReturnValue({
      data: { loggedIn: false, profile: null },
      isLoading: false,
      error: null
    } as any);

    render(
      <AuthGuard>
        <div>Register Page</div>
      </AuthGuard>
    );

    expect(screen.getByText('Register Page')).toBeInTheDocument();
  });

  it('should sync profile to store when authenticated', async () => {
    const profile = { name: 'Test User', email: 'test@test.com' };
    mockUseAuth.mockReturnValue({
      data: { loggedIn: true, profile },
      isLoading: false,
      error: null
    } as any);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockSetProfile).toHaveBeenCalledWith(profile);
    });
  });

  it('should not require auth when requireAuth is false', () => {
    mockUseAuth.mockReturnValue({
      data: { loggedIn: false, profile: null },
      isLoading: false,
      error: null
    } as any);

    render(
      <AuthGuard requireAuth={false}>
        <div>Public Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('should redirect to custom redirectTo path', () => {
    (window as any).location.pathname = '/protected';
    (window as any).location.href = '';
    mockUseAuth.mockReturnValue({
      data: { loggedIn: false, profile: null },
      isLoading: false,
      error: new Error('Auth error')
    } as any);

    render(
      <AuthGuard redirectTo="/custom-login">
        <div>Protected Content</div>
      </AuthGuard>
    );    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
  });
});
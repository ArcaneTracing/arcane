import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ProjectGuard } from '../ProjectGuard';
import { useProjectQuery } from '@/hooks/projects/use-projects-query';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';
import { authClient } from '@/lib/better-auth';
import { isForbiddenError } from '@/lib/error-handling';
import ForbiddenPage from '@/pages/forbidden/page';

jest.mock('@/hooks/projects/use-projects-query');
jest.mock('@/hooks/useOrganisation');
jest.mock('@/lib/better-auth', () => ({
  authClient: {
    useSession: jest.fn()
  }
}));
jest.mock('@/lib/error-handling');
jest.mock('@/pages/forbidden/page', () => ({
  __esModule: true,
  default: () => <div>Forbidden Page</div>
}));
jest.mock('@tanstack/react-router', () => ({
  useParams: () => ({ projectId: 'project-1' }),
  useNavigate: () => jest.fn()
}));
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
    removeQueries: jest.fn()
  })
}));

const mockUseProjectQuery = useProjectQuery as jest.MockedFunction<typeof useProjectQuery>;
const mockUseOrganisationIdOrNull = useOrganisationIdOrNull as jest.MockedFunction<typeof useOrganisationIdOrNull>;
const mockAuthClient = authClient as jest.Mocked<typeof authClient>;
const mockIsForbiddenError = isForbiddenError as jest.MockedFunction<typeof isForbiddenError>;

describe('ProjectGuard', () => {
  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    organisationId: 'org-1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrganisationIdOrNull.mockReturnValue('org-1');
    mockAuthClient.useSession = jest.fn().mockReturnValue({
      data: { user: { id: 'user-1' } }
    });
    mockIsForbiddenError.mockReturnValue(false);
    sessionStorage.clear();
  });

  it('should render children when project is loaded', () => {
    mockUseProjectQuery.mockReturnValue({
      data: mockProject,
      isLoading: false,
      isError: false,
      error: null
    } as any);

    render(
      <ProjectGuard>
        <div>Protected Content</div>
      </ProjectGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show loading state when project is loading', () => {
    mockUseProjectQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    } as any);

    render(
      <ProjectGuard>
        <div>Protected Content</div>
      </ProjectGuard>
    );

    expect(screen.getByText('Loading project...')).toBeInTheDocument();
  });

  it('should show custom fallback when loading', () => {
    mockUseProjectQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null
    } as any);

    render(
      <ProjectGuard fallback={<div>Custom Loading</div>}>
        <div>Protected Content</div>
      </ProjectGuard>
    );

    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
  });

  it('should show forbidden page on 403 error', () => {
    const error = { response: { status: 403 } };
    mockUseProjectQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: error as any
    } as any);
    mockIsForbiddenError.mockReturnValue(true);

    render(
      <ProjectGuard>
        <div>Protected Content</div>
      </ProjectGuard>
    );

    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
  });

  it('should show error message on 404 error', () => {
    const error = { response: { status: 404 } };
    mockUseProjectQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: error as any
    } as any);

    render(
      <ProjectGuard>
        <div>Protected Content</div>
      </ProjectGuard>
    );

    expect(screen.getByText('Project not found.')).toBeInTheDocument();
  });

  it('should not require project when requireProject is false', () => {
    mockUseProjectQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null
    } as any);

    render(
      <ProjectGuard requireProject={false}>
        <div>Public Content</div>
      </ProjectGuard>
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('should not redirect on 404 if no session', () => {
    mockAuthClient.useSession = jest.fn().mockReturnValue({
      data: null
    });
    const error = { response: { status: 404 } };
    mockUseProjectQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: error as any
    } as any);

    render(
      <ProjectGuard>
        <div>Protected Content</div>
      </ProjectGuard>
    );


    expect(screen.getByText('Project not found.')).toBeInTheDocument();
  });
});
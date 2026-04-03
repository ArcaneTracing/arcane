import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { OrganisationGuard } from '../OrganisationGuard';
import { useSetOrganisations, useSetCurrentOrganisation, useOrganisations, useCurrentOrganisation } from '@/store/organisationStore';
import { organisationsApi } from '@/api/organisations';
import { isForbiddenError } from '@/lib/error-handling';
import ForbiddenPage from '@/pages/forbidden/page';

jest.mock('@/store/organisationStore', () => ({
  useSetOrganisations: jest.fn(),
  useSetCurrentOrganisation: jest.fn(),
  useOrganisations: jest.fn(),
  useCurrentOrganisation: jest.fn(),
}));
jest.mock('@/api/organisations');
jest.mock('@/lib/error-handling');
jest.mock('@/pages/forbidden/page', () => ({
  __esModule: true,
  default: () => <div>Forbidden Page</div>,
}));
jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => ({ organisationId: 'org-1' }),
  useNavigate: () => jest.fn(),
}));
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    removeQueries: jest.fn(),
  }),
}));

const mockSetOrganisations = jest.fn();
const mockSetCurrentOrganisation = jest.fn();

const mockUseSetOrganisations = useSetOrganisations as jest.MockedFunction<typeof useSetOrganisations>;
const mockUseSetCurrentOrganisation = useSetCurrentOrganisation as jest.MockedFunction<typeof useSetCurrentOrganisation>;
const mockUseOrganisations = useOrganisations as jest.MockedFunction<typeof useOrganisations>;
const mockUseCurrentOrganisation = useCurrentOrganisation as jest.MockedFunction<typeof useCurrentOrganisation>;
const mockOrganisationsApi = organisationsApi as jest.Mocked<typeof organisationsApi>;
const mockIsForbiddenError = isForbiddenError as jest.MockedFunction<typeof isForbiddenError>;

describe('OrganisationGuard', () => {
  const mockOrganisations = [
    { id: 'org-1', name: 'Organisation 1' },
    { id: 'org-2', name: 'Organisation 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSetOrganisations.mockReturnValue(mockSetOrganisations);
    mockUseSetCurrentOrganisation.mockReturnValue(mockSetCurrentOrganisation);
    mockUseOrganisations.mockReturnValue([]);
    mockUseCurrentOrganisation.mockReturnValue(null);
    mockIsForbiddenError.mockReturnValue(false);
    delete (window as any).location;
    (window as any).location = { pathname: '/organisations/org-1/projects' };
  });

  it('should render children when organisations are loaded', async () => {
    mockUseOrganisations.mockReturnValue(mockOrganisations);
    mockUseCurrentOrganisation.mockReturnValue(mockOrganisations[0]);
    mockOrganisationsApi.getAll.mockResolvedValue(mockOrganisations);

    render(
      <OrganisationGuard>
        <div>Protected Content</div>
      </OrganisationGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should show loading state when organisations are being fetched', () => {
    mockUseOrganisations.mockReturnValue([]);
    mockOrganisationsApi.getAll.mockResolvedValue(mockOrganisations);

    render(
      <OrganisationGuard>
        <div>Protected Content</div>
      </OrganisationGuard>
    );

    expect(screen.getByText('Loading organisations...')).toBeInTheDocument();
  });

  it('should show custom fallback when loading', () => {
    mockUseOrganisations.mockReturnValue([]);
    mockOrganisationsApi.getAll.mockResolvedValue(mockOrganisations);

    render(
      <OrganisationGuard fallback={<div>Custom Loading</div>}>
        <div>Protected Content</div>
      </OrganisationGuard>
    );

    expect(screen.getByText('Custom Loading')).toBeInTheDocument();
  });

  it('should fetch organisations when not loaded', async () => {
    mockOrganisationsApi.getAll.mockResolvedValue(mockOrganisations);

    render(
      <OrganisationGuard>
        <div>Protected Content</div>
      </OrganisationGuard>
    );

    await waitFor(() => {
      expect(mockOrganisationsApi.getAll).toHaveBeenCalled();
      expect(mockSetOrganisations).toHaveBeenCalledWith(mockOrganisations);
    });
  });

  it('should set current organisation from URL when it exists', async () => {
    mockOrganisationsApi.getAll.mockResolvedValue(mockOrganisations);

    render(
      <OrganisationGuard>
        <div>Protected Content</div>
      </OrganisationGuard>
    );

    await waitFor(() => {
      expect(mockSetCurrentOrganisation).toHaveBeenCalledWith(mockOrganisations[0]);
    });
  });

  it('should show forbidden page on 403 error', async () => {
    const error = new Error('Forbidden');
    (error as any).response = { status: 403 };
    mockOrganisationsApi.getAll.mockRejectedValue(error);
    mockIsForbiddenError.mockReturnValue(true);

    render(
      <OrganisationGuard>
        <div>Protected Content</div>
      </OrganisationGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
    });
  });

  it('should set first organisation when URL has no organisationId', async () => {
    jest.spyOn(require('@tanstack/react-router'), 'useParams').mockReturnValue({});
    mockOrganisationsApi.getAll.mockResolvedValue(mockOrganisations);

    render(
      <OrganisationGuard>
        <div>Protected Content</div>
      </OrganisationGuard>
    );

    await waitFor(() => {
      expect(mockSetCurrentOrganisation).toHaveBeenCalledWith(mockOrganisations[0]);
    });
  });

  it('should not require organisation when requireOrganisation is false', () => {
    mockUseOrganisations.mockReturnValue([]);

    render(
      <OrganisationGuard requireOrganisation={false}>
        <div>Public Content</div>
      </OrganisationGuard>
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });
});

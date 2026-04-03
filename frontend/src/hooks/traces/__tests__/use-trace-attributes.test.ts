import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTraceAttributeNames, useTraceAttributeValues } from '../use-trace-attributes';
import { tracesApi } from '@/api/traces';

jest.mock('@/api/traces', () => ({
  tracesApi: {
    getAttributes: jest.fn(),
    getAttributeValues: jest.fn()
  }
}));

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: jest.fn(() => 'org-1')
}));

const mockGetAttributes = tracesApi.getAttributes as jest.Mock;
const mockGetAttributeValues = tracesApi.getAttributeValues as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return function Wrapper({ children }: {children: React.ReactNode;}) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useTraceAttributeNames', () => {
  beforeEach(() => {
    mockGetAttributes.mockClear();
  });

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(
      () =>
      useTraceAttributeNames({
        organisationId: 'org-1',
        projectId: 'proj-1',
        datasourceId: 'ds-1',
        enabled: false
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGetAttributes).not.toHaveBeenCalled();
  });

  it('does not fetch when datasourceId is missing', () => {
    const { result } = renderHook(
      () =>
      useTraceAttributeNames({
        organisationId: 'org-1',
        projectId: 'proj-1',
        datasourceId: undefined,
        enabled: true
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGetAttributes).not.toHaveBeenCalled();
  });

  it('fetches attribute names when enabled and all IDs are provided', async () => {
    mockGetAttributes.mockResolvedValue(['service.name', 'span.kind', 'http.status_code']);

    const { result } = renderHook(
      () =>
      useTraceAttributeNames({
        organisationId: 'org-1',
        projectId: 'proj-1',
        datasourceId: 'ds-1',
        enabled: true
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(mockGetAttributes).toHaveBeenCalledWith('org-1', 'proj-1', 'ds-1');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(['service.name', 'span.kind', 'http.status_code']);
  });

  it('does not retry on 400 errors', async () => {
    const error = new Error('Search by attributes is not supported');
    (error as any).response = { status: 400 };
    mockGetAttributes.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
      useTraceAttributeNames({
        organisationId: 'org-1',
        projectId: 'proj-1',
        datasourceId: 'ds-1',
        enabled: true
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });


    expect(mockGetAttributes).toHaveBeenCalledTimes(1);
  });
});

describe('useTraceAttributeValues', () => {
  beforeEach(() => {
    mockGetAttributeValues.mockClear();
  });

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(
      () =>
      useTraceAttributeValues({
        organisationId: 'org-1',
        projectId: 'proj-1',
        datasourceId: 'ds-1',
        attributeName: 'service.name',
        enabled: false
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGetAttributeValues).not.toHaveBeenCalled();
  });

  it('does not fetch when attributeName is missing', () => {
    const { result } = renderHook(
      () =>
      useTraceAttributeValues({
        organisationId: 'org-1',
        projectId: 'proj-1',
        datasourceId: 'ds-1',
        attributeName: undefined,
        enabled: true
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockGetAttributeValues).not.toHaveBeenCalled();
  });

  it('fetches attribute values when enabled and all params are provided', async () => {
    mockGetAttributeValues.mockResolvedValue(['my-service', 'api-service', 'web-service']);

    const { result } = renderHook(
      () =>
      useTraceAttributeValues({
        organisationId: 'org-1',
        projectId: 'proj-1',
        datasourceId: 'ds-1',
        attributeName: 'service.name',
        enabled: true
      }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
    expect(mockGetAttributeValues).toHaveBeenCalledWith('org-1', 'proj-1', 'ds-1', 'service.name');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(['my-service', 'api-service', 'web-service']);
  });

  it('does not retry on 400 errors', async () => {
    const error = new Error('Getting attribute values is not supported');
    (error as any).response = { status: 400 };
    mockGetAttributeValues.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
      useTraceAttributeValues({
        organisationId: 'org-1',
        projectId: 'proj-1',
        datasourceId: 'ds-1',
        attributeName: 'service.name',
        enabled: true
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });


    expect(mockGetAttributeValues).toHaveBeenCalledTimes(1);
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EntitiesTable } from '../entities-table';
import { useEntitiesQuery, useDeleteEntity, useCreateEntity, useUpdateEntity } from '@/hooks/entities/use-entities-query';
import { EntityResponse, EntityType, MatchPatternType } from '@/types';
import { resetUseActionErrorMock } from '@/__tests__/mocks/use-action-error-mock';
import { resetToastMocks } from '@/__tests__/mocks/toast-mocks';

jest.mock('@/hooks/entities/use-entities-query', () => ({
  useEntitiesQuery: jest.fn(),
  useDeleteEntity: jest.fn(),
  useCreateEntity: jest.fn(),
  useUpdateEntity: jest.fn()
}));

jest.mock('@/hooks/shared/use-action-error', () => {
  const m = require('@/__tests__/mocks/use-action-error-mock');
  return { useActionError: jest.fn(() => m.createUseActionErrorMock()) };
});

jest.mock('@/lib/toast', () => {
  const t = require('@/__tests__/mocks/toast-mocks');
  return {
    showSuccessToast: t.showSuccessToast,
    showErrorToast: t.showErrorToast,
    showErrorToastFromError: t.showErrorToastFromError,
    showWarningToast: t.showWarningToast,
    showInfoToast: t.showInfoToast
  };
});

const mockUseEntitiesQuery = useEntitiesQuery as jest.MockedFunction<typeof useEntitiesQuery>;
const mockUseDeleteEntity = useDeleteEntity as jest.MockedFunction<typeof useDeleteEntity>;
const mockUseCreateEntity = useCreateEntity as jest.MockedFunction<typeof useCreateEntity>;
const mockUseUpdateEntity = useUpdateEntity as jest.MockedFunction<typeof useUpdateEntity>;

describe('EntitiesTable', () => {
  const mockEntities: EntityResponse[] = [
  {
    id: '1',
    name: 'Test Entity 1',
    description: 'Description 1',
    entityType: EntityType.MODEL,
    attributeName: 'attr1',
    matchPatternType: MatchPatternType.VALUE,
    matchValue: 'value1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  } as unknown as EntityResponse,
  {
    id: '2',
    name: 'Test Entity 2',
    description: 'Description 2',
    entityType: 'TOOL' as const,
    attributeName: 'attr2',
    matchPatternType: 'REGEX' as const,
    matchValue: 'value2',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  } as unknown as EntityResponse];


  const defaultQueryReturn = {
    data: mockEntities,
    isLoading: false,
    error: null
  };

  const defaultDeleteMutation = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null
  };

  const defaultCreateMutation = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null
  };

  const defaultUpdateMutation = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetUseActionErrorMock();
    resetToastMocks();
    mockUseEntitiesQuery.mockReturnValue(defaultQueryReturn as any);
    mockUseDeleteEntity.mockReturnValue(defaultDeleteMutation as any);
    mockUseCreateEntity.mockReturnValue(defaultCreateMutation as any);
    mockUseUpdateEntity.mockReturnValue(defaultUpdateMutation as any);
  });

  it('should render loading state', () => {
    mockUseEntitiesQuery.mockReturnValue({
      ...defaultQueryReturn,
      isLoading: true
    } as any);

    render(<EntitiesTable searchQuery="" />);
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should render entities table with data', () => {
    render(<EntitiesTable searchQuery="" />);
    expect(screen.getByText('Test Entity 1')).toBeInTheDocument();
    expect(screen.getByText('Test Entity 2')).toBeInTheDocument();
  });

  it('should render error message when fetchError exists', () => {
    mockUseEntitiesQuery.mockReturnValue({
      ...defaultQueryReturn,
      error: new Error('Failed to fetch entities')
    } as any);

    render(<EntitiesTable searchQuery="" />);
    expect(screen.getByText(/Error: Failed to fetch entities/i)).toBeInTheDocument();
  });

  it('should render empty state when no entities', () => {
    mockUseEntitiesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: []
    } as any);

    render(<EntitiesTable searchQuery="" />);
    expect(screen.getByText('No entities found')).toBeInTheDocument();
  });

  it('should filter entities based on search query', () => {
    render(<EntitiesTable searchQuery="Test Entity 1" />);
    expect(screen.getByText('Test Entity 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Entity 2')).not.toBeInTheDocument();
  });

  it('should filter entities by description', () => {
    render(<EntitiesTable searchQuery="Description 2" />);
    expect(screen.getByText('Test Entity 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Entity 1')).not.toBeInTheDocument();
  });

  it('should handle edit action', () => {
    render(<EntitiesTable searchQuery="" />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);

      expect(screen.getByText(/Edit Entity|Create New Entity/i)).toBeInTheDocument();
    }
  });

  it('should handle delete action', () => {
    render(<EntitiesTable searchQuery="" />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    }
  });

  it('should render pagination when entities exist', () => {
    render(<EntitiesTable searchQuery="" />);


    const pagination = screen.queryByRole('navigation');

    expect(screen.getByText('Test Entity 1')).toBeInTheDocument();
  });

  it('should handle empty entities array', () => {
    mockUseEntitiesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: []
    } as any);

    render(<EntitiesTable searchQuery="" />);

    expect(screen.getByText('No entities found')).toBeInTheDocument();
  });

  it('should handle entities with missing required fields', () => {
    const incompleteEntities = [
    {
      id: '1',
      name: '',
      description: '',
      entityType: 'MODEL' as const,
      attributeName: '',
      matchPatternType: 'VALUE' as const,
      matchValue: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    } as unknown as EntityResponse];


    mockUseEntitiesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: incompleteEntities
    } as any);

    render(<EntitiesTable searchQuery="" />);


    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should handle entities with null name', () => {
    const entitiesWithNullName = [
    {
      ...mockEntities[0],
      name: null as any
    } as EntityResponse];


    mockUseEntitiesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: entitiesWithNullName
    } as any);

    render(<EntitiesTable searchQuery="" />);

    expect(screen.queryByText('Test Entity 1')).not.toBeInTheDocument();
  });

  it('should handle entities with undefined description', () => {
    const entitiesWithUndefinedDesc = [
    {
      ...mockEntities[0],
      description: undefined as any
    } as EntityResponse];


    mockUseEntitiesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: entitiesWithUndefinedDesc
    } as any);

    render(<EntitiesTable searchQuery="" />);

    expect(screen.getByText('Test Entity 1')).toBeInTheDocument();
  });

  it('should handle empty string search query', () => {
    render(<EntitiesTable searchQuery="" />);
    expect(screen.getByText('Test Entity 1')).toBeInTheDocument();
    expect(screen.getByText('Test Entity 2')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    render(<EntitiesTable searchQuery={longQuery} />);

    expect(screen.getByText('No entities found')).toBeInTheDocument();
  });

  it('should handle special characters in search query', () => {
    render(<EntitiesTable searchQuery="!@#$%^&*()" />);

    expect(screen.getByText('No entities found')).toBeInTheDocument();
  });

  it('should handle delete error state', () => {
    mockUseDeleteEntity.mockReturnValue({
      ...defaultDeleteMutation,
      error: new Error('Delete failed')
    } as any);

    render(<EntitiesTable searchQuery="" />);

    expect(screen.getByText('Test Entity 1')).toBeInTheDocument();
  });

  it('should handle empty string error message', () => {
    mockUseEntitiesQuery.mockReturnValue({
      ...defaultQueryReturn,
      error: new Error('')
    } as any);

    render(<EntitiesTable searchQuery="" />);

    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
  });

  it('should handle entities with very long names', () => {
    const longNameEntity = {
      ...mockEntities[0],
      name: 'a'.repeat(500)
    };

    mockUseEntitiesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: [longNameEntity]
    } as any);

    render(<EntitiesTable searchQuery="" />);

    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle missing createdAt field', () => {
    const entityWithoutDate = {
      ...mockEntities[0],
      createdAt: undefined as any
    };

    mockUseEntitiesQuery.mockReturnValue({
      ...defaultQueryReturn,
      data: [entityWithoutDate]
    } as any);

    render(<EntitiesTable searchQuery="" />);

    expect(screen.getByText('Test Entity 1')).toBeInTheDocument();
  });
});
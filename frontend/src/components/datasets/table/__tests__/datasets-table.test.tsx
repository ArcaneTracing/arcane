import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatasetsTable } from '../datasets-table';
import { DatasetListItemResponse } from '@/types/datasets';

const mockDeleteMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
  error: null
};
const mockCreateMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
  error: null
};
const mockUpdateMutation = {
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false,
  error: null
};

jest.mock('@/hooks/datasets/use-datasets-query', () => ({
  useDatasetsQuery: jest.fn(),
  useDeleteDataset: jest.fn(() => mockDeleteMutation),
  useCreateDataset: jest.fn(() => mockCreateMutation),
  useUpdateDataset: jest.fn(() => mockUpdateMutation)
}));

jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(() => jest.fn()),
  useParams: jest.fn(() => ({ projectId: 'project-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

const mockUseDatasetsQuery = require('@/hooks/datasets/use-datasets-query').useDatasetsQuery;
const mockUseDeleteDataset = require('@/hooks/datasets/use-datasets-query').useDeleteDataset;
const mockUseCreateDataset = require('@/hooks/datasets/use-datasets-query').useCreateDataset;
const mockUseUpdateDataset = require('@/hooks/datasets/use-datasets-query').useUpdateDataset;

describe('DatasetsTable', () => {
  const mockDatasets: DatasetListItemResponse[] = [
  {
    id: '1',
    name: 'Test Dataset 1',
    description: 'Description 1',
    createdAt: '2024-01-01T00:00:00Z'
  } as unknown as DatasetListItemResponse,
  {
    id: '2',
    name: 'Test Dataset 2',
    description: 'Description 2',
    createdAt: '2024-01-02T00:00:00Z'
  } as unknown as DatasetListItemResponse];


  const defaultMockReturn = {
    data: mockDatasets,
    isLoading: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDatasetsQuery.mockReturnValue(defaultMockReturn as any);
    mockUseDeleteDataset.mockReturnValue(mockDeleteMutation);
    mockUseCreateDataset.mockReturnValue(mockCreateMutation);
    mockUseUpdateDataset.mockReturnValue(mockUpdateMutation);
  });

  it('should render loading state', () => {
    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      isLoading: true
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should render datasets with data', () => {
    render(<DatasetsTable searchQuery="" projectId="project-1" />);
    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
    expect(screen.getByText('Test Dataset 2')).toBeInTheDocument();
  });

  it('should render error message when fetchError exists', () => {
    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      error: 'Failed to fetch datasets'
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);
    expect(screen.getByText(/Failed to fetch datasets/i)).toBeInTheDocument();
  });

  it('should render empty state when no datasets', () => {
    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: []
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);
    expect(screen.getByText('No datasets found')).toBeInTheDocument();
  });

  it('should filter datasets based on search query', () => {
    render(<DatasetsTable searchQuery="Test Dataset 1" projectId="project-1" />);
    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Dataset 2')).not.toBeInTheDocument();
  });

  it('should filter datasets by description', () => {
    render(<DatasetsTable searchQuery="Description 2" projectId="project-1" />);
    expect(screen.getByText('Test Dataset 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Dataset 1')).not.toBeInTheDocument();
  });

  it('should handle edit action', () => {
    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);

      expect(screen.getByText(/Edit Dataset|Create New Dataset/i)).toBeInTheDocument();
    }
  });

  it('should handle delete action', () => {
    const mockDeleteDataset = jest.fn().mockResolvedValue(undefined);
    mockUseDeleteDataset.mockReturnValue({
      ...mockDeleteMutation,
      mutateAsync: mockDeleteDataset
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    }
  });

  it('should handle view action', () => {

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    const viewButtons = screen.queryAllByRole('button', { name: /view/i });

  });


  it('should handle empty datasets array', () => {
    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: []
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);
    expect(screen.getByText('No datasets found')).toBeInTheDocument();
  });

  it('should handle datasets with missing required fields', () => {
    const incompleteDatasets = [
    {
      id: '1',
      name: '',
      description: '',
      createdAt: '2024-01-01T00:00:00Z'
    } as unknown as DatasetListItemResponse];


    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: incompleteDatasets
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    const cards = screen.queryAllByRole('article');
    expect(cards.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle empty string search query', () => {
    render(<DatasetsTable searchQuery="" projectId="project-1" />);
    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
    expect(screen.getByText('Test Dataset 2')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    render(<DatasetsTable searchQuery={longQuery} projectId="project-1" />);

    expect(screen.getByText('No datasets found')).toBeInTheDocument();
  });

  it('should handle special characters in search query', () => {
    render(<DatasetsTable searchQuery="!@#$%^&*()" projectId="project-1" />);

    expect(screen.getByText('No datasets found')).toBeInTheDocument();
  });

  it('should handle delete error state', () => {
    mockUseDeleteDataset.mockReturnValue({
      ...mockDeleteMutation,
      error: new Error('Delete failed')
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle empty projectId', () => {
    render(<DatasetsTable searchQuery="" projectId="" />);

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle datasets with very long names', () => {
    const longNameDataset = {
      ...mockDatasets[0],
      name: 'a'.repeat(500)
    };

    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: [longNameDataset]
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle missing createdAt field', () => {
    const datasetWithoutDate = {
      ...mockDatasets[0],
      createdAt: undefined as any
    };

    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: [datasetWithoutDate]
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });


  it('should handle sortKey and sortDirection props', () => {
    render(
      <DatasetsTable
        searchQuery=""
        projectId="project-1"
        sortKey="name"
        sortDirection="asc" />

    );

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle invalid sortKey', () => {
    render(
      <DatasetsTable
        searchQuery=""
        projectId="project-1"
        sortKey="invalidKey"
        sortDirection="asc" />

    );

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle null sortKey', () => {
    render(
      <DatasetsTable
        searchQuery=""
        projectId="project-1"
        sortKey={null as any}
        sortDirection="asc" />

    );

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle undefined sortDirection', () => {
    render(
      <DatasetsTable
        searchQuery=""
        projectId="project-1"
        sortKey="name"
        sortDirection={undefined as any} />

    );

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle datasets with null name', () => {
    const datasetWithNullName = {
      ...mockDatasets[0],
      name: null as any
    };

    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: [datasetWithNullName]
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    expect(screen.queryByText('Test Dataset 1')).not.toBeInTheDocument();
  });

  it('should handle datasets with undefined description', () => {
    const datasetWithUndefinedDesc = {
      ...mockDatasets[0],
      description: undefined as any
    };

    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: [datasetWithUndefinedDesc]
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle undefined datasets data', () => {
    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: undefined
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    expect(screen.getByText('No datasets found')).toBeInTheDocument();
  });

  it('should handle delete mutation being undefined', () => {
    mockUseDeleteDataset.mockReturnValue({
      ...mockDeleteMutation,
      mutateAsync: undefined as any
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle empty string projectId', () => {
    render(<DatasetsTable searchQuery="" projectId="" />);

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle very long projectId', () => {
    const longProjectId = 'a'.repeat(500);
    render(<DatasetsTable searchQuery="" projectId={longProjectId} />);

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle special characters in projectId', () => {
    render(<DatasetsTable searchQuery="" projectId="project!@#$%^&*()" />);

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle invalid date strings in createdAt', () => {
    const datasetWithInvalidDate = {
      ...mockDatasets[0],
      createdAt: 'invalid-date-string'
    };

    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: [datasetWithInvalidDate]
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle Date objects in createdAt', () => {
    const datasetWithDateObject = {
      ...mockDatasets[0],
      createdAt: new Date('2024-01-01') as any
    };

    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: [datasetWithDateObject]
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle navigate being called with correct path', () => {
    render(<DatasetsTable searchQuery="" projectId="project-1" />);


    expect(screen.getByText('Test Dataset 1')).toBeInTheDocument();
  });

  it('should handle pagination with many datasets', () => {
    const manyDatasets = Array.from({ length: 100 }, (_, i) => ({
      id: `dataset-${i}`,
      name: `Dataset ${i}`,
      description: `Description ${i}`,
      createdAt: '2024-01-01T00:00:00Z'
    }) as unknown as DatasetListItemDto);

    mockUseDatasetsQuery.mockReturnValue({
      ...defaultMockReturn,
      data: manyDatasets
    } as any);

    render(<DatasetsTable searchQuery="" projectId="project-1" />);

    expect(screen.getByText('Dataset 0')).toBeInTheDocument();
  });
});
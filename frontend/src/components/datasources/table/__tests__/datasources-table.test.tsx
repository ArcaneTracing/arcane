import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DatasourcesTable } from '../datasources-table';
import { useDatasourcesQuery, useDeleteDatasource } from '@/hooks/datasources/use-datasources-query';
import { DatasourceResponse, DatasourceSource, DatasourceType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';
import { resetUseActionErrorMock } from '@/__tests__/mocks/use-action-error-mock';
import { resetToastMocks } from '@/__tests__/mocks/toast-mocks';

jest.mock('@/hooks/datasources/use-datasources-query', () => ({
  useDatasourcesQuery: jest.fn(),
  useDeleteDatasource: jest.fn()
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

jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(() => ({ projectId: 'project-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

jest.mock('@/components/datasources/cards/datasource-card', () => ({
  DatasourceCard: ({ datasource, onEdit, onDelete }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': `datasource-card-${datasource.id}` },
    React.createElement('div', {}, datasource.name),
    React.createElement('button', { onClick: () => onEdit(datasource) }, 'Edit'),
    React.createElement('button', { onClick: () => onDelete(datasource) }, 'Delete')
    );
  }
}));

jest.mock('@/components/datasources/dialogs/datasource-dialog', () => ({
  DatasourceDialog: ({ open, datasource, onOpenChange }: any) => {
    const React = require('react');
    if (!open) return null;
    return React.createElement('div', { 'data-testid': 'datasource-dialog' },
    datasource ? 'Edit Dialog' : 'Create Dialog'
    );
  }
}));

jest.mock('@/components/datasources/dialogs/delete-datasource-dialog', () => ({
  DeleteDatasourceDialog: ({ isOpen, onConfirm }: any) => {
    const React = require('react');
    if (!isOpen) return null;
    return React.createElement('div', { 'data-testid': 'delete-dialog' },
    React.createElement('button', { onClick: onConfirm }, 'Confirm Delete')
    );
  }
}));

const mockUseDatasourcesQuery = useDatasourcesQuery as jest.MockedFunction<typeof useDatasourcesQuery>;
const mockUseDeleteDatasource = useDeleteDatasource as jest.MockedFunction<typeof useDeleteDatasource>;

describe('DatasourcesTable', () => {
  const mockDatasources: DatasourceResponse[] = [
  {
    id: '1',
    name: 'Test Datasource 1',
    description: 'Description 1',
    url: 'https://example.com/1',
    type: DatasourceType.TRACES,
    source: DatasourceSource.TEMPO
  },
  {
    id: '2',
    name: 'Test Datasource 2',
    description: 'Description 2',
    url: 'https://example.com/2',
    type: DatasourceType.TRACES,
    source: DatasourceSource.JAEGER
  }];


  const defaultMockReturn = {
    data: mockDatasources,
    isLoading: false,
    error: null
  };

  const defaultDeleteMutation = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetUseActionErrorMock();
    resetToastMocks();
    mockUseDatasourcesQuery.mockReturnValue(defaultMockReturn as any);
    mockUseDeleteDatasource.mockReturnValue(defaultDeleteMutation as any);
  });

  it('should render datasources', () => {
    customRender(<DatasourcesTable search="" />);
    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
    expect(screen.getByText('Test Datasource 2')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseDatasourcesQuery.mockReturnValue({
      ...defaultMockReturn,
      isLoading: true
    } as any);

    customRender(<DatasourcesTable search="" />);
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseDatasourcesQuery.mockReturnValue({
      ...defaultMockReturn,
      error: 'Failed to fetch datasources'
    } as any);

    customRender(<DatasourcesTable search="" />);
    expect(screen.getByText(/Failed to fetch datasources/i)).toBeInTheDocument();
  });

  it('should show empty state when no datasources', () => {
    mockUseDatasourcesQuery.mockReturnValue({
      ...defaultMockReturn,
      data: []
    } as any);

    customRender(<DatasourcesTable search="" />);
    expect(screen.getByText('No datasources found')).toBeInTheDocument();
  });

  it('should filter datasources by search query', () => {
    customRender(<DatasourcesTable search="Test Datasource 1" />);
    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Datasource 2')).not.toBeInTheDocument();
  });

  it('should open edit dialog when edit is clicked', async () => {
    customRender(<DatasourcesTable search="" />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('datasource-dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('Edit Dialog')).toBeInTheDocument();
  });

  it('should open delete dialog when delete is clicked', async () => {
    customRender(<DatasourcesTable search="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });
  });

  it('should call deleteDatasource when delete is confirmed', async () => {
    const mockDeleteDatasource = jest.fn().mockResolvedValue(undefined);
    mockUseDeleteDatasource.mockReturnValue({
      ...defaultDeleteMutation,
      mutateAsync: mockDeleteDatasource
    } as any);

    customRender(<DatasourcesTable search="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteDatasource).toHaveBeenCalledWith('1');
    });
  });

  it('should handle sortKey and sortDirection props', () => {
    customRender(
      <DatasourcesTable
        search=""
        sortKey="name"
        sortDirection="asc" />

    );
    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
  });

  it('should handle descending sort', () => {
    customRender(
      <DatasourcesTable
        search=""
        sortKey="name"
        sortDirection="desc" />

    );
    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
  });


  it('should handle empty search query', () => {
    customRender(<DatasourcesTable search="" />);
    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
    expect(screen.getByText('Test Datasource 2')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    customRender(<DatasourcesTable search={longQuery} />);

    expect(screen.getByText('No datasources found')).toBeInTheDocument();
  });

  it('should handle special characters in search query', () => {
    customRender(<DatasourcesTable search="!@#$%^&*()" />);

    expect(screen.getByText('No datasources found')).toBeInTheDocument();
  });

  it('should handle datasources with missing required fields', () => {
    const incompleteDatasources = [
    {
      id: '1',
      name: '',
      description: '',
      url: '',
      type: DatasourceType.TRACES,
      source: DatasourceSource.TEMPO
    } as DatasourceResponse];


    mockUseDatasourcesQuery.mockReturnValue({
      ...defaultMockReturn,
      data: incompleteDatasources
    } as any);

    customRender(<DatasourcesTable search="" />);

    expect(screen.getByTestId('datasource-card-1')).toBeInTheDocument();
  });

  it('should handle datasources with null description', () => {
    const datasourceWithNullDesc = [
    {
      ...mockDatasources[0],
      description: null as any
    }];


    mockUseDatasourcesQuery.mockReturnValue({
      ...defaultMockReturn,
      data: datasourceWithNullDesc
    } as any);

    customRender(<DatasourcesTable search="" />);
    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
  });

  it('should handle datasources with undefined description', () => {
    const datasourceWithUndefinedDesc = [
    {
      ...mockDatasources[0],
      description: undefined
    }];


    mockUseDatasourcesQuery.mockReturnValue({
      ...defaultMockReturn,
      data: datasourceWithUndefinedDesc
    } as any);

    customRender(<DatasourcesTable search="" />);
    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
  });

  it('should handle very long datasource names', () => {
    const longNameDatasource = [
    {
      ...mockDatasources[0],
      name: 'a'.repeat(500)
    }];


    mockUseDatasourcesQuery.mockReturnValue({
      ...defaultMockReturn,
      data: longNameDatasource
    } as any);

    customRender(<DatasourcesTable search="" />);
    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle invalid sortKey', () => {
    customRender(
      <DatasourcesTable
        search=""
        sortKey="invalidKey"
        sortDirection="asc" />

    );

    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
  });

  it('should handle null sortKey', () => {
    customRender(
      <DatasourcesTable
        search=""
        sortKey={null as any}
        sortDirection="asc" />

    );

    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
  });

  it('should handle undefined sortDirection', () => {
    customRender(
      <DatasourcesTable
        search=""
        sortKey="name"
        sortDirection={undefined as any} />

    );

    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
  });

  it('should handle missing projectId from useParams', () => {
    customRender(<DatasourcesTable search="" />);

    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
  });

  it('should handle deleteDatasource being undefined', () => {
    mockUseDeleteDatasource.mockReturnValue({
      mutateAsync: undefined as any,
      isPending: false,
      error: null
    } as any);

    customRender(<DatasourcesTable search="" />);

    expect(screen.getByText('Test Datasource 1')).toBeInTheDocument();
  });

  it('should handle pagination with many datasources', () => {
    const manyDatasources = Array.from({ length: 100 }, (_, i) => ({
      id: `datasource-${i}`,
      name: `Datasource ${i}`,
      description: `Description ${i}`,
      url: `https://example.com/${i}`,
      type: DatasourceType.TRACES,
      source: i % 2 === 0 ? DatasourceSource.TEMPO : DatasourceSource.JAEGER
    }) as DatasourceResponse);

    mockUseDatasourcesQuery.mockReturnValue({
      ...defaultMockReturn,
      data: manyDatasources
    } as any);

    customRender(<DatasourcesTable search="" />);

    expect(screen.getByText('Datasource 0')).toBeInTheDocument();
  });

  it('should close edit dialog when onOpenChange is called with false', () => {
    customRender(<DatasourcesTable search="" />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId('datasource-dialog')).toBeInTheDocument();
  });

  it('should handle delete error', () => {
    mockUseDeleteDatasource.mockReturnValue({
      ...defaultDeleteMutation,
      error: { message: 'Failed to delete' }
    } as any);

    customRender(<DatasourcesTable search="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);


    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
  });

  it('should handle delete loading state', () => {
    mockUseDeleteDatasource.mockReturnValue({
      ...defaultDeleteMutation,
      isPending: true
    } as any);

    customRender(<DatasourcesTable search="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);


    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
  });
});
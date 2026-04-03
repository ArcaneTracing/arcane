import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptsTable } from '../prompts-table';
import { PromptResponse } from '@/types/prompts';
import { render as customRender } from '@/__tests__/test-utils';
import { useNavigate, useParams } from '@tanstack/react-router';
import { usePromptsQuery, useDeletePrompt, useUpdatePrompt } from '@/hooks/prompts/use-prompts-query';

jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(() => jest.fn()),
  useParams: jest.fn(),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

const mockDeletePrompt = jest.fn().mockResolvedValue(undefined);
const mockUpdatePrompt = jest.fn().mockResolvedValue(undefined);

jest.mock('@/hooks/prompts/use-prompts-query', () => ({
  usePromptsQuery: jest.fn(),
  useDeletePrompt: jest.fn(),
  useUpdatePrompt: jest.fn()
}));

jest.mock('../../cards/prompt-card', () => ({
  PromptCard: ({ prompt, onView, onEdit, onDelete }: any) =>
  <div data-testid={`prompt-card-${prompt.id}`}>
      <div>{prompt.name}</div>
      <button onClick={() => onView(prompt.id)}>View</button>
      <button onClick={() => onEdit(prompt)}>Edit</button>
      <button onClick={() => onDelete(prompt.id)}>Delete</button>
    </div>

}));

jest.mock('../../dialogs/delete-prompt-dialog', () => ({
  DeletePromptDialog: ({ isOpen, onConfirm, onClose }: any) => {
    const React = require('react');
    const handleConfirm = async () => {
      if (onConfirm) {
        await onConfirm();
      }
    };
    return isOpen ?
    <div data-testid="delete-dialog">
        <button onClick={handleConfirm}>Confirm Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div> :
    null;
  }
}));

jest.mock('@/components/shared/table', () => ({
  TableContainer: ({ children, isLoading, error, isEmpty, emptyMessage }: any) => {
    if (isLoading) return <div data-testid="loading">Loading...</div>;
    if (error) return <div data-testid="error">Error: {error}</div>;
    if (isEmpty) return <div data-testid="empty">{emptyMessage}</div>;
    return <div>{children}</div>;
  },
  TablePagination: ({ meta, onPageChange }: any) =>
  <div data-testid="pagination">
      <button onClick={() => onPageChange(meta.page + 1)}>Next</button>
      <button onClick={() => onPageChange(meta.page - 1)}>Previous</button>
    </div>

}));

const mockUsePromptsQuery = usePromptsQuery as jest.MockedFunction<typeof usePromptsQuery>;
const mockUseDeletePrompt = useDeletePrompt as jest.MockedFunction<typeof useDeletePrompt>;
const mockUseUpdatePrompt = useUpdatePrompt as jest.MockedFunction<typeof useUpdatePrompt>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

describe('PromptsTable', () => {
  const mockNavigate = jest.fn();

  const mockPrompts: PromptResponse[] = [
  {
    id: 'prompt-1',
    name: 'Prompt 1',
    description: 'Description 1',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'prompt-2',
    name: 'Prompt 2',
    description: 'Description 2',
    createdAt: new Date('2024-01-02').toISOString(),
    updatedAt: new Date('2024-01-02').toISOString()
  },
  {
    id: 'prompt-3',
    name: 'Prompt 3',
    description: 'Description 3',
    createdAt: new Date('2024-01-03').toISOString(),
    updatedAt: new Date('2024-01-03').toISOString()
  }];


  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseParams.mockReturnValue({ organisationId: 'org-1', projectId: 'project-1' } as any);
    mockUsePromptsQuery.mockReturnValue({
      data: mockPrompts,
      isLoading: false,
      error: null
    });
    mockUseDeletePrompt.mockReturnValue({
      mutateAsync: mockDeletePrompt,
      isPending: false,
      error: null
    } as any);
    mockUseUpdatePrompt.mockReturnValue({
      mutateAsync: mockUpdatePrompt,
      isPending: false,
      error: null
    } as any);
  });

  it('should render prompts', () => {
    customRender(<PromptsTable searchQuery="" />);

    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Prompt 2')).toBeInTheDocument();
    expect(screen.getByText('Prompt 3')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    mockUsePromptsQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null
    });

    customRender(<PromptsTable searchQuery="" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockUsePromptsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Failed to fetch prompts'
    });

    customRender(<PromptsTable searchQuery="" />);

    expect(screen.getByText(/Error: Failed to fetch prompts/i)).toBeInTheDocument();
  });

  it('should display empty state', () => {
    mockUsePromptsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    customRender(<PromptsTable searchQuery="" />);

    expect(screen.getByText('No prompts found')).toBeInTheDocument();
  });

  it('should filter prompts by search query', () => {
    customRender(<PromptsTable searchQuery="Prompt 1" />);

    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
    expect(screen.queryByText('Prompt 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Prompt 3')).not.toBeInTheDocument();
  });

  it('should filter prompts by description', () => {
    customRender(<PromptsTable searchQuery="Description 2" />);

    expect(screen.getByText('Prompt 2')).toBeInTheDocument();
    expect(screen.queryByText('Prompt 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Prompt 3')).not.toBeInTheDocument();
  });

  it('should call router.push when View button is clicked', () => {
    customRender(<PromptsTable searchQuery="" />);

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/organisations/$organisationId/projects/$projectId/prompts/$promptId',
      params: { organisationId: 'org-1', projectId: 'project-1', promptId: 'prompt-3' }
    });
  });

  it('should open edit modal when Edit button is clicked', () => {
    customRender(<PromptsTable searchQuery="" />);

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit prompt')).toBeInTheDocument();
  });

  it('should open delete dialog when Delete button is clicked', async () => {
    customRender(<PromptsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });
  });

  it('should call deletePrompt when delete is confirmed', async () => {
    customRender(<PromptsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeletePrompt).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should close delete dialog when Cancel is clicked', async () => {
    customRender(<PromptsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    });
  });

  it('should handle delete error', async () => {
    mockDeletePrompt.mockRejectedValueOnce(new Error('Failed to delete'));

    customRender(<PromptsTable searchQuery="" />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);


    await waitFor(() => {
      expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
    });
  });

  it('should handle pagination', () => {

    const manyPrompts: PromptResponse[] = Array.from({ length: 25 }, (_, i) => ({
      id: `prompt-${i}`,
      name: `Prompt ${i}`,
      description: `Description ${i}`,
      createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`).toISOString(),
      updatedAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`).toISOString()
    }));

    mockUsePromptsQuery.mockReturnValue({
      data: manyPrompts,
      isLoading: false,
      error: null
    });

    customRender(<PromptsTable searchQuery="" />);

    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('should handle custom sort key and direction', () => {
    customRender(
      <PromptsTable
        searchQuery=""
        sortKey="name"
        sortDirection="asc" />

    );

    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
  });


  it('should handle empty search query', () => {
    customRender(<PromptsTable searchQuery="" />);

    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Prompt 2')).toBeInTheDocument();
    expect(screen.getByText('Prompt 3')).toBeInTheDocument();
  });

  it('should handle case-insensitive search', () => {
    customRender(<PromptsTable searchQuery="PROMPT 1" />);

    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
  });

  it('should handle partial search matches', () => {
    customRender(<PromptsTable searchQuery="Prompt" />);

    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Prompt 2')).toBeInTheDocument();
    expect(screen.getByText('Prompt 3')).toBeInTheDocument();
  });

  it('should handle prompts with null description', () => {
    const promptWithNullDesc: PromptResponse = {
      id: 'prompt-4',
      name: 'Prompt 4',
      description: null as any,
      createdAt: new Date('2024-01-04').toISOString(),
      updatedAt: new Date('2024-01-04').toISOString()
    };

    mockUsePromptsQuery.mockReturnValue({
      data: [promptWithNullDesc],
      isLoading: false,
      error: null
    });

    customRender(<PromptsTable searchQuery="" />);

    expect(screen.getByText('Prompt 4')).toBeInTheDocument();
  });

  it('should handle prompts with empty description', () => {
    const promptWithEmptyDesc: PromptResponse = {
      id: 'prompt-5',
      name: 'Prompt 5',
      description: '',
      createdAt: new Date('2024-01-05').toISOString(),
      updatedAt: new Date('2024-01-05').toISOString()
    };

    mockUsePromptsQuery.mockReturnValue({
      data: [promptWithEmptyDesc],
      isLoading: false,
      error: null
    });

    customRender(<PromptsTable searchQuery="" />);

    expect(screen.getByText('Prompt 5')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    customRender(<PromptsTable searchQuery={longQuery} />);

    expect(screen.getByText('No prompts found')).toBeInTheDocument();
  });

  it('should handle special characters in search query', () => {
    customRender(<PromptsTable searchQuery="!@#$%^&*()" />);

    expect(screen.getByText('No prompts found')).toBeInTheDocument();
  });

  it('should handle missing projectId in params', () => {
    mockUseParams.mockReturnValue({} as any);

    customRender(<PromptsTable searchQuery="" />);

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);


    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle View when projectId is missing', () => {
    mockUseParams.mockReturnValue({} as any);

    customRender(<PromptsTable searchQuery="" />);

    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);


    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
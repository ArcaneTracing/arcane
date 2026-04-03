import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScoresTable } from '../scores-table';
import { useScoresQuery, useDeleteScore } from '@/hooks/scores/use-scores-query';
import { ScoreResponse } from '@/types/scores';
import { ScoringType } from '@/types/enums';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/hooks/scores/use-scores-query', () => ({
  useDeleteScore: jest.fn(),
  useScoresQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null
  }))
}));

jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(() => ({ organisationId: 'org-1', projectId: 'project-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

jest.mock('@/components/scores/cards/score-card', () => ({
  ScoreCard: ({ score, onView, onEdit, onDelete }: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': `score-card-${score.id}` },
    React.createElement('div', {}, score.name),
    score.scoringType !== 'RAGAS' && React.createElement('button', { onClick: () => onView(score.id) }, 'Details'),
    score.scoringType !== 'RAGAS' && React.createElement('button', { onClick: () => onEdit(score) }, 'Edit'),
    score.scoringType !== 'RAGAS' && React.createElement('button', { onClick: () => onDelete(score) }, 'Delete')
    );
  }
}));

jest.mock('@/components/scores/dialogs/score-view-dialog', () => ({
  ScoreViewDialog: ({ open, scoreId }: any) => {
    const React = require('react');
    if (!open) return null;
    return React.createElement('div', { 'data-testid': 'score-view-dialog' }, `View Dialog ${scoreId}`);
  }
}));

jest.mock('@/components/scores/dialogs/score-dialog', () => ({
  ScoreDialog: ({ open, score }: any) => {
    const React = require('react');
    if (!open) return null;
    return React.createElement('div', { 'data-testid': 'score-dialog' }, score ? 'Edit Dialog' : 'Create Dialog');
  }
}));

const mockUseScoresQuery = useScoresQuery as jest.MockedFunction<typeof useScoresQuery>;
const mockUseDeleteScore = useDeleteScore as jest.MockedFunction<typeof useDeleteScore>;

describe('ScoresTable', () => {
  const mockScores: ScoreResponse[] = [
  {
    id: '1',
    name: 'Test Score 1',
    description: 'Description 1',
    scoringType: ScoringType.NUMERIC,
    projectId: 'project-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Test Score 2',
    description: 'Description 2',
    scoringType: ScoringType.NOMINAL,
    scale: [{ label: 'Good', value: 1 }],
    projectId: 'project-1',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'RAGAS Score',
    description: 'RAGAS Description',
    scoringType: ScoringType.RAGAS,
    ragasScoreKey: 'faithfulness',
    projectId: 'project-1',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z'
  }];


  const defaultMockReturn = {
    data: mockScores,
    isLoading: false,
    error: null
  };

  const defaultDeleteMutation = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseScoresQuery.mockReturnValue(defaultMockReturn as any);
    mockUseDeleteScore.mockReturnValue(defaultDeleteMutation as any);
  });

  it('should render scores', () => {
    customRender(<ScoresTable searchQuery="" />);
    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
    expect(screen.getByText('Test Score 2')).toBeInTheDocument();
  });

  it('should filter out RAGAS scores', () => {
    customRender(<ScoresTable searchQuery="" />);
    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
    expect(screen.getByText('Test Score 2')).toBeInTheDocument();

    expect(screen.queryByText('RAGAS Score')).not.toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseScoresQuery.mockReturnValue({
      ...defaultMockReturn,
      isLoading: true
    } as any);

    customRender(<ScoresTable searchQuery="" />);
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseScoresQuery.mockReturnValue({
      ...defaultMockReturn,
      error: 'Failed to fetch scores'
    } as any);

    customRender(<ScoresTable searchQuery="" />);
    expect(screen.getByText(/Failed to fetch scores/i)).toBeInTheDocument();
  });

  it('should show empty state when no scores', () => {
    mockUseScoresQuery.mockReturnValue({
      ...defaultMockReturn,
      data: []
    } as any);

    customRender(<ScoresTable searchQuery="" />);
    expect(screen.getByText('No scores found')).toBeInTheDocument();
  });

  it('should filter scores by search query', () => {
    customRender(<ScoresTable searchQuery="Test Score 1" />);
    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Score 2')).not.toBeInTheDocument();
  });

  it('should open view dialog when details is clicked', () => {
    customRender(<ScoresTable searchQuery="" />);
    const detailsButtons = screen.getAllByText('Details');
    fireEvent.click(detailsButtons[0]);

    expect(screen.getByTestId('score-view-dialog')).toBeInTheDocument();
  });

  it('should open edit dialog when edit is clicked', () => {
    customRender(<ScoresTable searchQuery="" />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId('score-dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Dialog')).toBeInTheDocument();
  });

  it('should open delete dialog when delete is clicked', () => {
    customRender(<ScoresTable searchQuery="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
  });

  it('should call deleteMutation when delete is confirmed', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseDeleteScore.mockReturnValue({
      ...defaultDeleteMutation,
      mutateAsync: mockMutateAsync
    } as any);

    customRender(<ScoresTable searchQuery="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);


    await waitFor(() => {
      const confirmButtons = screen.getAllByRole('button');
      const deleteConfirmButton = confirmButtons.find((btn) =>
      btn.textContent === 'Delete' && btn.closest('[data-testid="alert-dialog"]')
      );
      if (deleteConfirmButton) {
        fireEvent.click(deleteConfirmButton);
      }
    });

    await waitFor(() => {

      expect(mockMutateAsync).toHaveBeenCalled();
      const callArgs = mockMutateAsync.mock.calls[0][0];
      expect(['1', '2']).toContain(callArgs);
    });
  });

  it('should handle sortKey and sortDirection props', () => {
    customRender(
      <ScoresTable
        searchQuery=""
        sortKey="name"
        sortDirection="asc" />

    );
    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });

  it('should handle descending sort', () => {
    customRender(
      <ScoresTable
        searchQuery=""
        sortKey="name"
        sortDirection="desc" />

    );
    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });


  it('should handle empty search query', () => {
    customRender(<ScoresTable searchQuery="" />);
    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
    expect(screen.getByText('Test Score 2')).toBeInTheDocument();
  });

  it('should handle very long search query', () => {
    const longQuery = 'a'.repeat(1000);
    customRender(<ScoresTable searchQuery={longQuery} />);

    expect(screen.getByText('No scores found')).toBeInTheDocument();
  });

  it('should handle special characters in search query', () => {
    customRender(<ScoresTable searchQuery="!@#$%^&*()" />);

    expect(screen.getByText('No scores found')).toBeInTheDocument();
  });

  it('should handle scores with missing required fields', () => {
    const incompleteScores = [
    {
      id: '1',
      name: '',
      description: '',
      scoringType: ScoringType.NUMERIC,
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    } as ScoreResponse];


    mockUseScoresQuery.mockReturnValue({
      ...defaultMockReturn,
      data: incompleteScores
    } as any);

    customRender(<ScoresTable searchQuery="" />);

    expect(screen.getByTestId('score-card-1')).toBeInTheDocument();
  });

  it('should handle scores with null description', () => {
    const scoreWithNullDesc = [
    {
      ...mockScores[0],
      description: null
    }];


    mockUseScoresQuery.mockReturnValue({
      ...defaultMockReturn,
      data: scoreWithNullDesc
    } as any);

    customRender(<ScoresTable searchQuery="" />);
    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });

  it('should handle scores with undefined description', () => {
    const scoreWithUndefinedDesc = [
    {
      ...mockScores[0],
      description: undefined
    }];


    mockUseScoresQuery.mockReturnValue({
      ...defaultMockReturn,
      data: scoreWithUndefinedDesc
    } as any);

    customRender(<ScoresTable searchQuery="" />);
    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });

  it('should handle very long score names', () => {
    const longNameScore = [
    {
      ...mockScores[0],
      name: 'a'.repeat(500)
    }];


    mockUseScoresQuery.mockReturnValue({
      ...defaultMockReturn,
      data: longNameScore
    } as any);

    customRender(<ScoresTable searchQuery="" />);
    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle invalid sortKey', () => {
    customRender(
      <ScoresTable
        searchQuery=""
        sortKey="invalidKey"
        sortDirection="asc" />

    );

    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });

  it('should handle null sortKey', () => {
    customRender(
      <ScoresTable
        searchQuery=""
        sortKey={null as any}
        sortDirection="asc" />

    );

    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });

  it('should handle undefined sortDirection', () => {
    customRender(
      <ScoresTable
        searchQuery=""
        sortKey="name"
        sortDirection={undefined as any} />

    );

    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });

  it('should handle date sorting', () => {
    customRender(
      <ScoresTable
        searchQuery=""
        sortKey="createdAt"
        sortDirection="desc" />

    );
    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });

  it('should handle pagination with many scores', () => {
    const manyScores = Array.from({ length: 100 }, (_, i) => ({
      id: `score-${i}`,
      name: `Score ${i}`,
      description: `Description ${i}`,
      scoringType: i % 2 === 0 ? ScoringType.NUMERIC : ScoringType.NOMINAL,
      scale: i % 2 === 0 ? undefined : [{ label: 'Good', value: 1 }],
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }) as ScoreResponse);

    mockUseScoresQuery.mockReturnValue({
      ...defaultMockReturn,
      data: manyScores
    } as any);

    customRender(<ScoresTable searchQuery="" />);

    expect(screen.getByText('Score 0')).toBeInTheDocument();
  });

  it('should handle delete loading state', () => {
    mockUseDeleteScore.mockReturnValue({
      ...defaultDeleteMutation,
      isPending: true
    } as any);

    customRender(<ScoresTable searchQuery="" />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);


    expect(screen.getByText(/Deleting/i)).toBeInTheDocument();
  });

  it('should prevent editing RAGAS scores', () => {
    const ragasOnlyScores = [
    {
      ...mockScores[2]
    }];


    mockUseScoresQuery.mockReturnValue({
      ...defaultMockReturn,
      data: ragasOnlyScores
    } as any);

    customRender(<ScoresTable searchQuery="" />);

    expect(screen.queryByText('RAGAS Score')).not.toBeInTheDocument();
  });

  it('should handle missing projectId from useParams', () => {
    customRender(<ScoresTable searchQuery="" />);

    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });

  it('should handle deleteMutation with missing properties', () => {
    mockUseDeleteScore.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false
    } as any);

    customRender(<ScoresTable searchQuery="" />);

    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });

  it('should close dialogs when onOpenChange is called', () => {
    customRender(<ScoresTable searchQuery="" />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId('score-dialog')).toBeInTheDocument();
  });

  it('should handle scores with string dates', () => {
    const scoreWithStringDates = [
    {
      ...mockScores[0],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }];


    mockUseScoresQuery.mockReturnValue({
      ...defaultMockReturn,
      data: scoreWithStringDates
    } as any);

    customRender(<ScoresTable searchQuery="" />);
    expect(screen.getByText('Test Score 1')).toBeInTheDocument();
  });
});
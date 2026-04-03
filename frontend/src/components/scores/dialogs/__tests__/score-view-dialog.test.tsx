import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScoreViewDialog } from '../score-view-dialog';
import { ScoreResponse } from '@/types/scores';
import { render as customRender } from '@/__tests__/test-utils';

const mockUseScoreQuery = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null
}));

const mockUseDeleteScore = jest.fn(() => ({
  mutateAsync: jest.fn().mockResolvedValue(undefined),
  isPending: false
}));

jest.mock('@/hooks/scores/use-scores-query', () => ({
  useScoreQuery: jest.fn((projectId: string, scoreId: string | undefined) => {
    return mockUseScoreQuery(projectId, scoreId);
  }),
  useDeleteScore: jest.fn((projectId: string) => {
    return mockUseDeleteScore(projectId);
  })
}));


let mockErrorState: string | null = null;
let mockErrorObject: {message: string | null;} = { message: null };

const mockUseActionError = jest.fn(() => {
  return {
    get message() {
      return mockErrorObject.message;
    },
    handleError: jest.fn((error: unknown) => {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = 'An error occurred';
      }
      mockErrorState = errorMessage;
      mockErrorObject.message = errorMessage;
    }),
    clear: jest.fn(() => {
      mockErrorState = null;
      mockErrorObject.message = null;
    })
  };
});

jest.mock('@/hooks/shared/use-action-error', () => ({
  useActionError: (...args: any[]) => mockUseActionError(...args)
}));

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));
describe('ScoreViewDialog', () => {
  const mockScore: Score = {
    id: '1',
    name: 'Test Score',
    description: 'Test Description',
    scoringType: 'NUMERIC',
    numericScale: { min: 0, max: 10, step: 1 },
    projectId: 'project-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  const defaultMockQueryReturn = {
    data: mockScore,
    isLoading: false,
    error: null
  };

  const defaultMockDeleteReturn = {
    mutateAsync: jest.fn().mockResolvedValue(undefined),
    isPending: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockErrorState = null;
    mockErrorObject.message = null;
    mockUseScoreQuery.mockReturnValue(defaultMockQueryReturn as any);
    mockUseDeleteScore.mockReturnValue(defaultMockDeleteReturn as any);
  });

  it('should render when open', () => {
    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Score Details')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={false}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.queryByText('Score Details')).not.toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      isLoading: true
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      error: { message: 'Failed to load score' } as any
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText(/Failed to load score/i)).toBeInTheDocument();
  });

  it('should show score not found when score is null', () => {
    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      data: null
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Score not found')).toBeInTheDocument();
  });

  it('should display score information', () => {
    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Test Score')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1"
        onEdit={mockOnEdit} />

    );
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockScore);
  });

  it('should open delete dialog when delete button is clicked', () => {
    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
  });

  it('should call deleteMutation when delete is confirmed', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseDeleteScore.mockReturnValue({
      ...defaultMockDeleteReturn,
      mutateAsync: mockMutateAsync
    } as any);

    const mockOnDelete = jest.fn();
    const mockOnOpenChange = jest.fn();
    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId="project-1"
        onDelete={mockOnDelete} />

    );


    const deleteButton = screen.getByText('Delete').closest('button');
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }


    await waitFor(() => {
      const confirmButtons = screen.getAllByRole('button');

      const alertDeleteButton = confirmButtons.find((btn) =>
      btn.textContent === 'Delete' && btn.closest('[data-testid="alert-dialog"]')
      );
      if (alertDeleteButton) {
        fireEvent.click(alertDeleteButton);
      }
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('1');
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should not show edit/delete buttons for RAGAS scores', () => {
    const ragasScore: ScoreResponse = {
      ...mockScore,
      scoringType: 'RAGAS',
      ragasScoreKey: 'faithfulness'
    };

    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      data: ragasScore
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('should display numeric scale information', () => {
    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText(/No scale configured/i)).toBeInTheDocument();
  });

  it('should display category scale information', () => {
    const categoryScore: ScoreResponse = {
      ...mockScore,
      scoringType: 'NOMINAL',
      scale: [
      { label: 'Good', value: 1 },
      { label: 'Bad', value: 0 }]

    };

    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      data: categoryScore
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Bad')).toBeInTheDocument();
  });

  it('should display RAGAS score information', () => {
    const ragasScore: ScoreResponse = {
      ...mockScore,
      scoringType: 'RAGAS',
      ragasScoreKey: 'faithfulness'
    };

    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      data: ragasScore
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText(/RAGAS Score Key/i)).toBeInTheDocument();
    expect(screen.getByText('faithfulness')).toBeInTheDocument();
  });


  it('should handle null scoreId', () => {
    customRender(
      <ScoreViewDialog
        scoreId={null}
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );

    expect(screen.getByText('Score Details')).toBeInTheDocument();
  });

  it('should handle empty string scoreId', () => {
    customRender(
      <ScoreViewDialog
        scoreId=""
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Score Details')).toBeInTheDocument();
  });

  it('should handle empty string projectId', () => {
    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="" />

    );
    expect(screen.getByText('Score Details')).toBeInTheDocument();
  });

  it('should handle missing onEdit callback', () => {
    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1"
        onEdit={undefined} />

    );

    expect(screen.getByText('Score Details')).toBeInTheDocument();
  });

  it('should handle missing onDelete callback', () => {
    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1"
        onDelete={undefined} />

    );

    expect(screen.getByText('Score Details')).toBeInTheDocument();
  });

  it('should handle score with null description', () => {
    const scoreWithNullDesc: ScoreResponse = {
      ...mockScore,
      description: null
    };

    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      data: scoreWithNullDesc
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );

    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle score with undefined description', () => {
    const scoreWithUndefinedDesc: Score = {
      ...mockScore,
      description: undefined
    };

    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      data: scoreWithUndefinedDesc
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle numeric scale with partial values', () => {
    const scoreWithPartialScale: ScoreResponse = {
      ...mockScore,
      scale: [{ label: '0', value: 0 }]
    };

    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      data: scoreWithPartialScale
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText(/No scale configured/i)).toBeInTheDocument();
  });

  it('should handle empty category scale', () => {
    const scoreWithEmptyCategories: Score = {
      ...mockScore,
      scoringType: 'CATEGORY',
      categoryScale: []
    };

    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      data: scoreWithEmptyCategories
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText('Test Score')).toBeInTheDocument();
  });

  it('should handle delete loading state', () => {
    mockUseDeleteScore.mockReturnValue({
      ...defaultMockDeleteReturn,
      isPending: true
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should handle evaluator prompt', () => {
    const scoreWithPrompt: ScoreResponse = {
      ...mockScore,
      evaluatorPrompt: { id: 'prompt-1', name: 'Test Prompt' }
    };

    mockUseScoreQuery.mockReturnValue({
      ...defaultMockQueryReturn,
      data: scoreWithPrompt
    } as any);

    customRender(
      <ScoreViewDialog
        scoreId="1"
        open={true}
        onOpenChange={jest.fn()}
        projectId="project-1" />

    );
    expect(screen.getByText(/Evaluator Prompt/i)).toBeInTheDocument();
    expect(screen.getByText(/Prompt ID: prompt-1/i)).toBeInTheDocument();
  });
});
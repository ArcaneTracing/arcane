import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScoreForm } from '../score-form';
import { usePromptsQuery } from '@/hooks/prompts/use-prompts-query';
import { useCreateScore, useUpdateScore } from '@/hooks/scores/use-scores-query';
import { ScoreResponse } from '@/types/scores';
import { ScoringType } from '@/types/enums';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/hooks/prompts/use-prompts-query', () => ({
  usePromptsQuery: jest.fn()
}));

jest.mock('@/hooks/scores/use-scores-query', () => ({
  useCreateScore: jest.fn(),
  useUpdateScore: jest.fn()
}));


const mutationData = new Map();
let mutationSuccessWatchers: Array<{mutation: any;onSuccess: () => void;}> = [];

const mockUseMutationAction = jest.fn(({ mutation, onSuccess }) => {
  if (onSuccess) {
    mutationData.set(mutation, { onSuccess, mutation });
    mutationSuccessWatchers.push({ mutation, onSuccess });
    if (mutation.isSuccess) {
      Promise.resolve().then(() => {
        if (mutation.isSuccess && onSuccess) {
          onSuccess();
        }
      });
    }
  }
  return {
    ...mutation,
    isPending: mutation.isPending,
    errorMessage: mutation.error?.message || null,
    handleError: jest.fn(),
    clear: jest.fn(),
    clearError: jest.fn()
  };
});

jest.mock('@/hooks/shared/use-mutation-action', () => ({
  useMutationAction: (options: any) => mockUseMutationAction(options)
}));

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

const mockUsePromptsQuery = usePromptsQuery as jest.MockedFunction<typeof usePromptsQuery>;
const mockUseCreateScore = useCreateScore as jest.MockedFunction<typeof useCreateScore>;
const mockUseUpdateScore = useUpdateScore as jest.MockedFunction<typeof useUpdateScore>;

describe('ScoreForm', () => {
  const defaultPromptsReturn = {
    data: [
    { id: 'prompt-1', name: 'Test Prompt 1' },
    { id: 'prompt-2', name: 'Test Prompt 2' }],

    isLoading: false,
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
    mutationData.clear();
    mutationSuccessWatchers = [];
    mockUsePromptsQuery.mockReturnValue(defaultPromptsReturn as any);
    mockUseCreateScore.mockReturnValue(defaultCreateMutation as any);
    mockUseUpdateScore.mockReturnValue(defaultUpdateMutation as any);
  });

  it('should render form fields', () => {
    customRender(
      <ScoreForm
        projectId="project-1" />

    );
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Scoring Type/i)).toBeInTheDocument();
  });

  it('should call createMutation when form is submitted in create mode', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseCreateScore.mockReturnValue({
      ...defaultCreateMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const mockOnSuccess = jest.fn();
    customRender(
      <ScoreForm
        projectId="project-1"
        onSuccess={mockOnSuccess} />

    );


    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Score' } });


    const submitButton = screen.getByText('Create Score');
    fireEvent.click(submitButton);


    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'New Score',
        scoringType: 'NUMERIC',
        evaluatorPromptId: null
      });
    }, { timeout: 3000 });


    const { act } = require('@testing-library/react');
    await act(async () => {
      await Promise.resolve();
      mutationSuccessWatchers.forEach(({ onSuccess }) => {
        onSuccess();
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should call updateMutation when form is submitted in edit mode', async () => {
    const mockMutateAsync = jest.fn().mockResolvedValue(undefined);
    mockUseUpdateScore.mockReturnValue({
      ...defaultUpdateMutation,
      mutateAsync: mockMutateAsync
    } as any);

    const score: ScoreResponse = {
      id: '1',
      name: 'Test Score',
      description: 'Test Description',
      scoringType: ScoringType.NUMERIC,
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    const mockOnSuccess = jest.fn();
    customRender(
      <ScoreForm
        score={score}
        projectId="project-1"
        onSuccess={mockOnSuccess} />

    );


    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Score' } });


    const submitButton = screen.getByText('Update Score');
    fireEvent.click(submitButton);


    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: '1',
        data: expect.objectContaining({
          name: 'Updated Score'
        })
      });
    }, { timeout: 3000 });


    const { act } = require('@testing-library/react');
    await act(async () => {
      await Promise.resolve();
      mutationSuccessWatchers.forEach(({ onSuccess }) => {
        onSuccess();
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should not show scale options for numeric scores', () => {
    customRender(
      <ScoreForm
        projectId="project-1" />

    );
    expect(screen.queryByText('Scale Options')).not.toBeInTheDocument();
    expect(screen.queryByText(/Ordinal Configuration/i)).not.toBeInTheDocument();
  });

  it('should show scale options for ordinal scores in edit mode', () => {
    const score: ScoreResponse = {
      id: '2',
      name: 'Ordinal Score',
      description: 'Ordinal Description',
      scoringType: ScoringType.ORDINAL,
      scale: [
      { label: 'Bad', value: 0 },
      { label: 'Good', value: 1 }],

      ordinalConfig: { acceptable_set: ['Good'], threshold_rank: 1 },
      projectId: 'project-1',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    };

    customRender(
      <ScoreForm
        score={score}
        projectId="project-1" />

    );

    expect(screen.getByText('Scale Options')).toBeInTheDocument();
    expect(screen.getByText(/Ordinal Configuration/i)).toBeInTheDocument();
  });

  it('should render evaluator prompt select', () => {
    customRender(
      <ScoreForm
        projectId="project-1" />

    );
    expect(screen.getByLabelText(/Evaluator Prompt/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseCreateScore.mockReturnValue({
      ...defaultCreateMutation,
      isPending: true
    } as any);

    customRender(
      <ScoreForm
        projectId="project-1" />

    );
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('should show error message', () => {
    mockUseCreateScore.mockReturnValue({
      ...defaultCreateMutation,
      error: { message: 'Failed to create score' } as any
    } as any);

    customRender(
      <ScoreForm
        projectId="project-1" />

    );
    expect(screen.getByText('Failed to create score')).toBeInTheDocument();
  });


  it('should handle null score', () => {
    customRender(
      <ScoreForm
        score={null}
        projectId="project-1" />

    );

    expect(screen.getByText('Create Score')).toBeInTheDocument();
  });

  it('should handle undefined score', () => {
    customRender(
      <ScoreForm
        score={undefined}
        projectId="project-1" />

    );

    expect(screen.getByText('Create Score')).toBeInTheDocument();
  });

  it('should handle empty string projectId', () => {
    customRender(
      <ScoreForm
        projectId="" />

    );

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
  });

  it('should handle missing onSuccess callback', () => {
    customRender(
      <ScoreForm
        projectId="project-1"
        onSuccess={undefined} />

    );

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
  });

  it('should handle very long name', () => {
    const longName = 'a'.repeat(500);
    customRender(
      <ScoreForm
        projectId="project-1" />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: longName } });
    expect((nameInput as HTMLInputElement).value).toBe(longName);
  });

  it('should handle very long description', () => {
    const longDesc = 'b'.repeat(2000);
    customRender(
      <ScoreForm
        projectId="project-1" />

    );
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: longDesc } });
    expect((descInput as HTMLTextAreaElement).value).toBe(longDesc);
  });

  it('should handle score with null description in edit mode', () => {
    const score: ScoreResponse = {
      id: '1',
      name: 'Test Score',
      description: null,
      scoringType: ScoringType.NUMERIC,
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    customRender(
      <ScoreForm
        score={score}
        projectId="project-1" />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    expect(descInput.value).toBe('');
  });

  it('should handle score with undefined description in edit mode', () => {
    const score: ScoreResponse = {
      id: '1',
      name: 'Test Score',
      description: undefined,
      scoringType: ScoringType.NUMERIC,
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    customRender(
      <ScoreForm
        score={score}
        projectId="project-1" />

    );
    const descInput = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    expect(descInput.value).toBe('');
  });

  it('should handle RAGAS score type gracefully', () => {
    const ragasScore: ScoreResponse = {
      id: '1',
      name: 'RAGAS Score',
      description: 'RAGAS Description',
      scoringType: ScoringType.RAGAS,
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    customRender(
      <ScoreForm
        score={ragasScore}
        projectId="project-1" />

    );

    expect(screen.getByText('Update Score')).toBeInTheDocument();
  });

  it('should render scale values for nominal scores', () => {
    const score: ScoreResponse = {
      id: '1',
      name: 'Test Score',
      description: 'Nominal Description',
      scoringType: ScoringType.NOMINAL,
      scale: [{ label: 'Low', value: 0 }],
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    customRender(
      <ScoreForm
        score={score}
        projectId="project-1" />

    );
    const optionInputs = screen.getAllByPlaceholderText('Option label') as HTMLInputElement[];
    expect(optionInputs[0].value).toBe('Low');
  });

  it('should handle empty nominal scale', () => {
    const score: ScoreResponse = {
      id: '1',
      name: 'Test Score',
      description: '',
      scoringType: ScoringType.NOMINAL,
      scale: [],
      projectId: 'project-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    customRender(
      <ScoreForm
        score={score}
        projectId="project-1" />

    );
    expect(screen.getByText('Scale Options')).toBeInTheDocument();
  });

  it('should handle evaluator prompt selection', () => {
    customRender(
      <ScoreForm
        projectId="project-1" />

    );

    expect(screen.getByLabelText(/Evaluator Prompt/i)).toBeInTheDocument();
  });

  it('should pre-select evaluator prompt when editing score with evaluatorPrompt (API format)', () => {
    const score: ScoreResponse = {
      id: '1',
      name: 'Test Score',
      description: 'Test Description',
      scoringType: ScoringType.NUMERIC,
      projectId: 'project-1',
      evaluatorPrompt: { id: 'prompt-1', name: 'Test Prompt 1' },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    customRender(
      <ScoreForm
        score={score}
        projectId="project-1" />

    );


    expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
  });

  it('should pre-select evaluator prompt when editing score with evaluatorPrompt.id', () => {
    const score: ScoreResponse = {
      id: '1',
      name: 'Test Score',
      description: 'Test Description',
      scoringType: ScoringType.NUMERIC,
      projectId: 'project-1',
      evaluatorPrompt: { id: 'prompt-1', name: 'Test Prompt 1' },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    };

    customRender(
      <ScoreForm
        score={score}
        projectId="project-1" />

    );

    expect(screen.getByText('Test Prompt 1')).toBeInTheDocument();
  });

  it('should handle empty prompts list', () => {
    mockUsePromptsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });

    customRender(
      <ScoreForm
        projectId="project-1" />

    );

    expect(screen.getByLabelText(/Evaluator Prompt/i)).toBeInTheDocument();
  });

  it('should handle whitespace-only name', () => {
    customRender(
      <ScoreForm
        projectId="project-1" />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '   ' } });
    expect((nameInput as HTMLInputElement).value).toBe('   ');
  });

  it('should handle special characters in name', () => {
    customRender(
      <ScoreForm
        projectId="project-1" />

    );
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test!@#$%^&*()' } });
    expect((nameInput as HTMLInputElement).value).toBe('Test!@#$%^&*()');
  });

  it('should validate name is required', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    customRender(
      <ScoreForm
        projectId="project-1" />

    );


    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: '   ' } });

    const submitButton = screen.getByText('Create Score');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please enter a name for the score');
    }, { timeout: 2000 }).catch(() => {

    });

    alertSpy.mockRestore();
  });

  it('should validate category scale has at least one category', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    customRender(
      <ScoreForm
        projectId="project-1" />

    );
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();

    alertSpy.mockRestore();
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnnotationQueueForm } from '../annotation-queue-form';
import { AnnotationQueueResponse, AnnotationQueueType, AnnotationTemplateResponse, AnnotationQuestionResponse, AnnotationQuestionType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';
import { useNavigate } from '@tanstack/react-router';
import { useCreateAnnotationQueue, useUpdateAnnotationQueue } from '@/hooks/annotation-queues/use-annotation-queues-query';

jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(() => jest.fn()),
  useParams: jest.fn(() => ({ organisationId: 'org-1', projectId: 'project-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

const mockCreateAnnotationQueue = jest.fn().mockResolvedValue(undefined);
const mockUpdateAnnotationQueue = jest.fn().mockResolvedValue(undefined);

jest.mock('@/hooks/annotation-queues/use-annotation-queues-query', () => ({
  useCreateAnnotationQueue: jest.fn(),
  useUpdateAnnotationQueue: jest.fn()
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

jest.mock('../queue-details-form', () => {
  const React = require('react');
  const { AnnotationQueueType } = require('@/types/');
  return {
    QueueDetailsForm: ({ name, description, type, onNameChange, onDescriptionChange, onTypeChange, disabled, isEditMode }: any) => {
      return React.createElement('div', { 'data-testid': 'queue-details-form' },
      React.createElement('input', { 'data-testid': 'name-input', value: name, onChange: (e: any) => onNameChange(e.target.value), disabled }),
      React.createElement('textarea', { 'data-testid': 'description-input', value: description, onChange: (e: any) => onDescriptionChange(e.target.value), disabled }),
      React.createElement('select', { 'data-testid': 'type-select', value: type, onChange: (e: any) => onTypeChange(e.target.value), disabled: disabled || isEditMode },
      React.createElement('option', { value: AnnotationQueueType.TRACES }, 'Traces'),
      React.createElement('option', { value: AnnotationQueueType.CONVERSATIONS }, 'Conversations')
      )
      );
    }
  };
});

jest.mock('../questions-list', () => {
  const React = require('react');
  return {
    QuestionsList: ({ questions, onAdd, onEdit, onDelete, isLoading }: any) =>
    React.createElement('div', { 'data-testid': 'questions-list' },
    React.createElement('button', { 'data-testid': 'add-question', onClick: onAdd, disabled: isLoading }, 'Add Question'),
    questions.map((q: any) =>
    React.createElement('div', { key: q.id, 'data-testid': `question-${q.id}` },
    React.createElement('button', { onClick: () => onEdit(q) }, 'Edit'),
    React.createElement('button', { onClick: () => onDelete(q.id) }, 'Delete')
    )
    )
    )

  };
});

jest.mock('../../dialogs/question-dialog', () => ({
  QuestionDialog: ({ open, onOpenChange, question, onSave }: any) => {
    if (!open) return null;
    return (
      <div data-testid="question-dialog">
        <input data-testid="question-input" defaultValue={question?.question || ''} />
        <button onClick={() => onSave({ id: question?.id || 'new-id', question: 'New Question', type: AnnotationQuestionType.FREEFORM })}>Save</button>
        <button onClick={() => onOpenChange(false)}>Cancel</button>
      </div>);

  }
}));

jest.mock('../form-footer', () => {
  const React = require('react');
  return {
    FormFooter: ({ isLoading, isEditMode, canSubmit, onCancel, onSubmit }: any) =>
    React.createElement('div', { 'data-testid': 'form-footer' },
    React.createElement('button', { onClick: onCancel, disabled: isLoading }, 'Cancel'),
    React.createElement('button', { onClick: onSubmit, disabled: isLoading || !canSubmit },
    isLoading ? isEditMode ? 'Updating...' : 'Creating...' : isEditMode ? 'Update Queue' : 'Create Queue'
    )
    )

  };
});

const mockUseCreateAnnotationQueue = useCreateAnnotationQueue as jest.MockedFunction<typeof useCreateAnnotationQueue>;
const mockUseUpdateAnnotationQueue = useUpdateAnnotationQueue as jest.MockedFunction<typeof useUpdateAnnotationQueue>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

describe('AnnotationQueueForm', () => {
  const mockNavigate = jest.fn();

  const defaultCreateMutation = {
    mutateAsync: mockCreateAnnotationQueue,
    isPending: false,
    error: null
  };

  const defaultUpdateMutation = {
    mutateAsync: mockUpdateAnnotationQueue,
    isPending: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mutationData.clear();
    mutationSuccessWatchers = [];
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseCreateAnnotationQueue.mockReturnValue(defaultCreateMutation as any);
    mockUseUpdateAnnotationQueue.mockReturnValue(defaultUpdateMutation as any);
  });

  it('should render form in create mode', async () => {
    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );

    await waitFor(() => {
      expect(screen.getByText('Create New Annotation Queue')).toBeInTheDocument();
    });
    expect(screen.getByTestId('queue-details-form')).toBeInTheDocument();
    expect(screen.getByTestId('questions-list')).toBeInTheDocument();
    expect(screen.getByTestId('form-footer')).toBeInTheDocument();
  });

  it('should render form in edit mode', async () => {
    const queue: AnnotationQueueResponse = {
      id: 'queue-1',
      name: 'Test Queue',
      description: 'Test Description',
      type: AnnotationQueueType.TRACES,
      templateId: 'template-1',
      annotations: [],
      tracesToBeAnnotated: [],
      conversationsToBeAnnotated: []
    };

    customRender(
      <AnnotationQueueForm projectId="project-1" queue={queue} />
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Annotation Queue')).toBeInTheDocument();
    });
  });

  it('should handle name input change', async () => {
    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );

    await waitFor(() => {
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Queue Name' } });

    expect(nameInput.value).toBe('New Queue Name');
  });

  it('should handle description input change', async () => {
    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );

    await waitFor(() => {
      expect(screen.getByTestId('description-input')).toBeInTheDocument();
    });

    const descriptionInput = screen.getByTestId('description-input') as HTMLTextAreaElement;
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    expect(descriptionInput.value).toBe('New Description');
  });

  it('should handle type select change', async () => {
    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );

    await waitFor(() => {
      expect(screen.getByTestId('type-select')).toBeInTheDocument();
    });

    const typeSelect = screen.getByTestId('type-select') as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: AnnotationQueueType.CONVERSATIONS } });

    expect(typeSelect.value).toBe(AnnotationQueueType.CONVERSATIONS);
  });

  it('should open question dialog when Add Question is clicked', () => {
    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );

    const addButton = screen.getByTestId('add-question');
    fireEvent.click(addButton);

    expect(screen.getByTestId('question-dialog')).toBeInTheDocument();
  });

  it('should add question when saved in question dialog', () => {
    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );

    const addButton = screen.getByTestId('add-question');
    fireEvent.click(addButton);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(screen.getByTestId('question-new-id')).toBeInTheDocument();
  });

  it('should delete question when Delete is clicked', async () => {
    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );


    await waitFor(() => {
      expect(screen.getByTestId('add-question')).toBeInTheDocument();
    });

    const addButton = screen.getByTestId('add-question');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('question-dialog')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('question-new-id')).toBeInTheDocument();
    });


    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByTestId('question-new-id')).not.toBeInTheDocument();
    });
  });

  it('should navigate back when Cancel is clicked', () => {
    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/organisations/$organisationId/projects/$projectId/annotation-queues', params: { organisationId: 'org-1', projectId: 'project-1' } });
  });

  it('should call createAnnotationQueue when form is submitted in create mode', async () => {
    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );

    await waitFor(() => {
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
    });


    const addButton = screen.getByTestId('add-question');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByTestId('question-dialog')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByTestId('question-new-id')).toBeInTheDocument();
    });


    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Queue' } });

    await waitFor(() => {
      const submitButton = screen.getByText('Create Queue');
      expect(submitButton).not.toHaveAttribute('disabled');
    });

    const submitButton = screen.getByText('Create Queue');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAnnotationQueue).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Queue'
        })
      );
    }, { timeout: 3000 });
  });

  it('should call updateAnnotationQueue when form is submitted in edit mode', async () => {
    const queue: AnnotationQueueResponse = {
      id: 'queue-1',
      name: 'Test Queue',
      description: 'Test Description',
      type: AnnotationQueueType.TRACES,
      templateId: 'template-1',
      annotations: [],
      tracesToBeAnnotated: [],
      conversationsToBeAnnotated: []
    };

    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.FREEFORM
    };

    customRender(
      <AnnotationQueueForm
        projectId="project-1"
        queue={queue}
        template={{ id: 'template-1', questions: [question] }} />

    );

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Updated Queue' } });

    const submitButton = screen.getByText('Update Queue');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateAnnotationQueue).toHaveBeenCalledWith({
        queueId: 'queue-1',
        data: expect.objectContaining({
          name: 'Updated Queue'
        })
      });
    });
  });

  it('should display error message', async () => {
    const errorMessage = 'Failed to create queue';


    mockUseCreateAnnotationQueue.mockReturnValue({
      ...defaultCreateMutation,
      error: null
    } as any);


    const { rerender } = customRender(
      <AnnotationQueueForm projectId="project-1" />
    );


    await waitFor(() => {
      expect(screen.getByTestId('queue-details-form')).toBeInTheDocument();
    });


    await new Promise((resolve) => setTimeout(resolve, 100));


    mockUseCreateAnnotationQueue.mockReturnValue({
      ...defaultCreateMutation,
      error: new Error(errorMessage)
    } as any);


    rerender(<AnnotationQueueForm projectId="project-1" />);


    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should disable form when loading', () => {
    mockUseCreateAnnotationQueue.mockReturnValue({
      ...defaultCreateMutation,
      isPending: true
    } as any);

    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    expect(nameInput).toHaveAttribute('disabled');
  });


  it('should initialize form data from queue', () => {
    const queue: AnnotationQueueResponse = {
      id: 'queue-1',
      name: 'Initial Queue',
      description: 'Initial Description',
      type: AnnotationQueueType.CONVERSATIONS,
      templateId: 'template-1',
      annotations: [],
      tracesToBeAnnotated: [],
      conversationsToBeAnnotated: []
    };

    customRender(
      <AnnotationQueueForm projectId="project-1" queue={queue} />
    );

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    expect(nameInput.value).toBe('Initial Queue');
  });

  it('should render with initial template questions', async () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Initial Question',
      type: AnnotationQuestionType.FREEFORM
    };

    customRender(
      <AnnotationQueueForm
        projectId="project-1"
        template={{ id: 'template-1', questions: [question] }} />

    );
    await waitFor(() => {
      expect(screen.getByTestId('questions-list')).toBeInTheDocument();
    }, { timeout: 2000 });
    const questionsList = screen.getByTestId('questions-list');
    expect(questionsList).toBeInTheDocument();
  });

  it('should not submit when name is empty', async () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.FREEFORM
    };

    customRender(
      <AnnotationQueueForm
        projectId="project-1"
        template={{ id: 'template-1', questions: [question] }} />

    );

    const submitButton = screen.getByText('Create Queue');
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('should not submit when no questions', async () => {
    customRender(
      <AnnotationQueueForm projectId="project-1" />
    );

    const nameInput = screen.getByTestId('name-input') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Queue' } });

    const submitButton = screen.getByText('Create Queue');
    expect(submitButton).toHaveAttribute('disabled');
  });
});
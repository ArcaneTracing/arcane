import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnnotatedTracesTab } from '../annotated-traces-tab';
import { AnnotationResponse, AnnotationAnswerResponse } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

const mockDeleteAnnotation = jest.fn().mockResolvedValue(undefined);
const mockInvalidateQueries = jest.fn();

jest.mock('lucide-react', () => ({
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  Pencil: () => <span data-testid="pencil-icon">Pencil</span>,
  Trash2: () => <span data-testid="trash-icon">Trash</span>,
  ExternalLink: () => <span data-testid="external-link-icon">ExternalLink</span>
}));

jest.mock('@/hooks/annotation-queues/use-queue-annotations', () => ({
  useQueueAnnotations: jest.fn(() => ({
    deleteAnnotation: mockDeleteAnnotation,
    isDeleteLoading: false
  }))
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: jest.fn(() => ({
      invalidateQueries: mockInvalidateQueries
    }))
  };
});

jest.mock('@tanstack/react-router', () => ({
  useNavigate: jest.fn(() => jest.fn()),
  useParams: jest.fn(() => ({ organisationId: 'org-1', projectId: 'project-1' })),
  Link: ({ children, to, params, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

jest.mock('../delete-annotation-dialog', () => ({
  DeleteAnnotationDialog: ({ isOpen, onConfirm, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="delete-annotation-dialog">
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>);

  }
}));

jest.mock('../annotate-trace-dialog', () => ({
  AnnotateTraceDialog: ({ isOpen, traceId, onClose, onComplete }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="annotate-trace-dialog">
        <div>Trace ID: {traceId}</div>
        <button onClick={onClose}>Close</button>
        <button onClick={onComplete}>Complete</button>
      </div>);

  }
}));

const mockUseQueueAnnotations = require('@/hooks/annotation-queues/use-queue-annotations').useQueueAnnotations;

describe('AnnotatedTracesTab', () => {
  const mockAnnotations: AnnotationResponse[] = [
  {
    id: 'annotation-1',
    traceId: 'trace-1',
    answers: [
    {
      id: 'answer-1',
      questionId: 'question-1',
      value: 'Answer 1'
    }]

  },
  {
    id: 'annotation-2',
    traceId: 'trace-2',
    answers: [
    {
      id: 'answer-2',
      questionId: 'question-2',
      value: 'Answer 2'
    },
    {
      id: 'answer-3',
      questionId: 'question-3',
      value: 'Answer 3'
    }]

  }];


  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockClear();
    mockUseQueueAnnotations.mockReturnValue({
      deleteAnnotation: mockDeleteAnnotation,
      isDeleteLoading: false
    });
  });

  it('should render annotations table', () => {
    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations} />

    );

    expect(screen.getByText('trace-1')).toBeInTheDocument();
    expect(screen.getByText('trace-2')).toBeInTheDocument();
  });

  it('should display answer count', () => {
    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations} />

    );

    expect(screen.getByText(/1 answer/i)).toBeInTheDocument();
    expect(screen.getByText(/2 answers/i)).toBeInTheDocument();
  });

  it('should display empty state when no annotations', () => {
    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={[]} />

    );

    expect(screen.getByText(/No annotated traces found/i)).toBeInTheDocument();
  });

  it('should open annotate dialog when View button is clicked', async () => {
    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations} />

    );

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-trace-dialog')).toBeInTheDocument();
    });
  });

  it('should open annotate dialog when Edit button is clicked', async () => {
    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations} />

    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-trace-dialog')).toBeInTheDocument();
    });
  });

  it('should open delete dialog when Delete button is clicked', async () => {
    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-annotation-dialog')).toBeInTheDocument();
    });
  });

  it('should call deleteAnnotation when delete is confirmed', async () => {
    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-annotation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteAnnotation).toHaveBeenCalledWith('annotation-1');
    });
  });

  it('should call fetchAnnotationQueue after annotation completes', async () => {
    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations} />

    );

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-trace-dialog')).toBeInTheDocument();
    });

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['annotationQueue', 'project-1', 'queue-1']
      });
    });
  });

  it('should call invalidateQueries after delete completes', async () => {
    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-annotation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['annotationQueue', 'project-1', 'queue-1']
      });
    });
  });


  it('should handle annotation without answers', () => {
    const annotationWithoutAnswers: AnnotationResponse = {
      id: 'annotation-3',
      traceId: 'trace-3',
      answers: []
    };

    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={[annotationWithoutAnswers]} />

    );

    expect(screen.getByText('trace-3')).toBeInTheDocument();
    expect(screen.getByText(/0 answers/i)).toBeInTheDocument();
  });

  it('should handle annotation with undefined answers', () => {
    const annotationWithoutAnswers: AnnotationResponse = {
      id: 'annotation-4',
      traceId: 'trace-4',
      answers: []
    };

    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={[annotationWithoutAnswers]} />

    );

    expect(screen.getByText('trace-4')).toBeInTheDocument();
    expect(screen.getByText(/0 answers/i)).toBeInTheDocument();
  });

  it('should handle annotation without id', () => {
    const annotationWithoutId: AnnotationResponse = {
      traceId: 'trace-5',
      answers: []
    };

    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={[annotationWithoutId]} />

    );

    expect(screen.getByText('trace-5')).toBeInTheDocument();
  });

  it('should handle delete error gracefully', async () => {
    mockDeleteAnnotation.mockRejectedValueOnce(new Error('Failed to delete'));

    customRender(
      <AnnotatedTracesTab
        projectId="project-1"
        queueId="queue-1"
        annotations={mockAnnotations} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-annotation-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);


    await waitFor(() => {
      expect(mockDeleteAnnotation).toHaveBeenCalled();
    });
  });
});
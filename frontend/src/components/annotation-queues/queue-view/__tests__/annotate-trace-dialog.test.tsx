import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnnotateTraceDialog } from '../annotate-trace-dialog';
import { AnnotationResponse, AnnotationAnswerResponse, AnnotationTemplateResponse, AnnotationQuestionResponse, AnnotationQuestionType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

const mockFetchTrace = jest.fn().mockResolvedValue(undefined);
const mockCreateAnnotation = jest.fn().mockResolvedValue(undefined);
const mockUpdateAnnotation = jest.fn().mockResolvedValue(undefined);
jest.mock('@/hooks/annotation-queues/use-queue-annotations', () => ({
  useQueueAnnotations: jest.fn(() => ({
    template: null,
    isTemplateLoading: false,
    createAnnotation: mockCreateAnnotation,
    updateAnnotation: mockUpdateAnnotation,
    isCreateLoading: false,
    isUpdateLoading: false
  }))
}));

jest.mock('@/components/traces/tree/trace-viewer', () => ({
  TraceViewer: ({ trace }: any) =>
  <div data-testid="trace-viewer">Trace Viewer: {trace?.id || 'No trace'}</div>

}));

jest.mock('@/components/traces/conversation/trace-conversation', () => ({
  TraceConversation: ({ trace }: any) =>
  <div data-testid="trace-conversation">Trace Conversation: {trace?.id || 'No trace'}</div>

}));

jest.mock('@/components/annotation-queues/question-preview/question-preview', () => ({
  QuestionPreview: ({ question, value, onChange }: any) =>
  <div data-testid={`question-preview-${question.id}`}>
      <div>{question.question}</div>
      <input
      data-testid={`answer-input-${question.id}`}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)} />

    </div>

}));

jest.mock('@/hooks/traces/use-traces-query', () => ({
  useTraceQuery: jest.fn()
}));

const mockHandleError = jest.fn();
const mockClear = jest.fn();

jest.mock('@/hooks/shared/use-action-error', () => ({
  useActionError: jest.fn(() => ({
    message: null,
    handleError: mockHandleError,
    clear: mockClear
  }))
}));

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));


const mockUseTraceQuery = require('@/hooks/traces/use-traces-query').useTraceQuery;
const mockUseQueueAnnotations = require('@/hooks/annotation-queues/use-queue-annotations').useQueueAnnotations;

describe('AnnotateTraceDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnComplete = jest.fn();

  const mockTemplate: AnnotationTemplateResponse = {
    id: 'template-1',
    questions: [
    {
      id: 'question-1',
      question: 'Test Question 1',
      type: AnnotationQuestionType.FREEFORM
    },
    {
      id: 'question-2',
      question: 'Test Question 2',
      type: AnnotationQuestionType.BOOLEAN
    }]

  };

  const mockTrace = {
    id: 'trace-1',
    name: 'Test Trace'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHandleError.mockClear();
    mockClear.mockClear();
    mockUseTraceQuery.mockReturnValue({
      data: mockTrace,
      isLoading: false,
      error: null
    });
    mockUseQueueAnnotations.mockReturnValue({
      template: mockTemplate,
      isTemplateLoading: false,
      createAnnotation: mockCreateAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      isCreateLoading: false,
      isUpdateLoading: false
    });
  });

  it('should render when open', () => {
    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );

    expect(screen.getByText('Annotate Trace')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={false}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );

    expect(screen.queryByText('Annotate Trace')).not.toBeInTheDocument();
  });

  it('should fetch trace when dialog opens', () => {
    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );


    expect(mockUseTraceQuery).toHaveBeenCalledWith('project-1', 'datasource-1', 'trace-1');
  });

  it('should render questions from template', () => {
    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );

    expect(screen.getByTestId('question-preview-question-1')).toBeInTheDocument();
    expect(screen.getByTestId('question-preview-question-2')).toBeInTheDocument();
  });

  it('should pre-populate answers from existing annotation', async () => {
    const existingAnnotation: AnnotationResponse = {
      id: 'annotation-1',
      traceId: 'trace-1',
      answers: [
      {
        id: 'answer-1',
        questionId: 'question-1',
        value: 'Existing answer'
      }]

    };

    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        existingAnnotation={existingAnnotation}
        queueTraceId="queue-trace-1" />

    );

    await waitFor(() => {
      const answerInput = screen.getByTestId('answer-input-question-1') as HTMLInputElement;
      expect(answerInput.value).toBe('Existing answer');
    });
  });

  it('should call createAnnotation when submitting new annotation', async () => {
    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );

    const answerInput = screen.getByTestId('answer-input-question-1') as HTMLInputElement;
    fireEvent.change(answerInput, { target: { value: 'New answer' } });

    const submitButton = screen.getByRole('button', { name: 'Submit Annotation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAnnotation).toHaveBeenCalled();
    });
  });

  it('should call updateAnnotation when submitting existing annotation', async () => {
    const existingAnnotation: AnnotationResponse = {
      id: 'annotation-1',
      traceId: 'trace-1',
      answers: []
    };

    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        existingAnnotation={existingAnnotation}
        queueTraceId="queue-trace-1" />

    );

    const answerInput = screen.getByTestId('answer-input-question-1') as HTMLInputElement;
    fireEvent.change(answerInput, { target: { value: 'Updated answer' } });

    const submitButton = screen.getByRole('button', { name: 'Update Annotation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateAnnotation).toHaveBeenCalled();
    });
  });

  it('should call onComplete after successful submission', async () => {

    mockCreateAnnotation.mockResolvedValue(undefined);

    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );

    const answerInput = screen.getByTestId('answer-input-question-1') as HTMLInputElement;
    fireEvent.change(answerInput, { target: { value: 'New answer' } });

    const submitButton = screen.getByRole('button', { name: 'Submit Annotation' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAnnotation).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should call onClose when Cancel is clicked', () => {
    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display loading state when template is loading', () => {
    mockUseQueueAnnotations.mockReturnValue({
      template: null,
      isTemplateLoading: true,
      createAnnotation: mockCreateAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      isCreateLoading: false,
      isUpdateLoading: false
    });

    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );


    expect(screen.getByTestId('trace-viewer')).toBeInTheDocument();
  });

  it('should display loading state when trace is loading', () => {
    mockUseTraceQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      fetchTrace: mockFetchTrace
    });

    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );


    expect(screen.getByText('Annotate Trace')).toBeInTheDocument();
  });


  it('should handle missing template', () => {
    mockUseQueueAnnotations.mockReturnValue({
      template: null,
      isTemplateLoading: false,
      createAnnotation: mockCreateAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      isCreateLoading: false,
      isUpdateLoading: false
    });

    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );

    expect(screen.getByText('Annotate Trace')).toBeInTheDocument();
  });

  it('should handle missing trace', () => {
    mockUseTraceQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      fetchTrace: mockFetchTrace
    });

    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );

    expect(screen.getByText('Annotate Trace')).toBeInTheDocument();
  });

  it('should handle empty template questions', () => {
    mockUseQueueAnnotations.mockReturnValue({
      template: { id: 'template-1', questions: [] },
      isTemplateLoading: false,
      createAnnotation: mockCreateAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      isCreateLoading: false,
      isUpdateLoading: false
    });

    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        queueTraceId="queue-trace-1" />

    );

    expect(screen.getByText('Annotate Trace')).toBeInTheDocument();
    expect(screen.getByText(/No questions found in template/i)).toBeInTheDocument();
  });

  it('should handle annotation with different answer types', () => {
    const existingAnnotation: AnnotationResponse = {
      id: 'annotation-1',
      traceId: 'trace-1',
      answers: [
      {
        id: 'answer-1',
        questionId: 'question-1',
        booleanValue: true
      },
      {
        id: 'answer-2',
        questionId: 'question-2',
        numberValue: 42
      },
      {
        id: 'answer-3',
        questionId: 'question-3',
        stringArrayValue: ['Option 1', 'Option 2']
      }]

    };

    customRender(
      <AnnotateTraceDialog
        projectId="project-1"
        queueId="queue-1"
        traceId="trace-1"
        datasourceId="datasource-1"
        isOpen={true}
        onClose={mockOnClose}
        onComplete={mockOnComplete}
        existingAnnotation={existingAnnotation}
        queueTraceId="queue-trace-1" />

    );

    expect(screen.getByText('Edit Annotation')).toBeInTheDocument();
  });
});
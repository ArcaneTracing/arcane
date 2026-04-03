import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnnotateConversationDialog } from '../annotate-conversation-dialog'

const mockFetchConversationByTraces = jest.fn().mockResolvedValue(undefined)
const mockFetchFullConversation = jest.fn().mockResolvedValue(undefined)
const mockResetByTraces = jest.fn()
const mockResetFullConversation = jest.fn()
const mockCreateAnnotation = jest.fn().mockResolvedValue(undefined)
const mockUpdateAnnotation = jest.fn().mockResolvedValue(undefined)

const mockUseConversationByTraces = jest.fn(() => ({
  traces: [],
  isFetchLoading: false,
  fetchError: null,
  fetchConversationByTraces: mockFetchConversationByTraces,
  reset: mockResetByTraces,
}))
const mockUseFullConversation = jest.fn(() => ({
  traces: [],
  isFetchLoading: false,
  fetchError: null,
  fetchFullConversation: mockFetchFullConversation,
  reset: mockResetFullConversation,
}))

jest.mock('@/hooks/conversation/use-conversation-by-traces', () => ({
  useConversationByTraces: () => mockUseConversationByTraces(),
}))
jest.mock('@/hooks/conversation/use-full-conversation', () => ({
  useFullConversation: () => mockUseFullConversation(),
}))

jest.mock('@/hooks/annotation-queues/use-queue-annotations', () => ({
  useQueueAnnotations: jest.fn(() => ({
    template: null,
    isTemplateLoading: false,
    createAnnotation: mockCreateAnnotation,
    updateAnnotation: mockUpdateAnnotation,
    isCreateLoading: false,
    isUpdateLoading: false,
  })),
}))

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: jest.fn(() => 'org-1'),
}))

jest.mock('@/hooks/shared/use-action-error', () => ({
  useActionError: jest.fn(() => ({
    message: null,
    handleError: jest.fn(),
    clear: jest.fn(),
  })),
}))

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn(),
}))

jest.mock('@/components/traces/conversation/trace-conversation', () => ({
  TraceConversation: ({ trace }: { trace: unknown }) => (
    <div data-testid="trace-conversation">
      Conversation: {trace ? 'loaded' : 'none'}
    </div>
  ),
}))
jest.mock('@/components/traces/tree/trace-viewer', () => ({
  TraceViewer: ({ trace }: { trace: unknown }) => (
    <div data-testid="trace-viewer">Viewer: {trace ? 'loaded' : 'none'}</div>
  ),
}))
jest.mock('@/components/annotation-queues/question-preview/question-preview', () => ({
  QuestionPreview: ({
    question,
    value,
    onChange,
    disabled,
  }: {
    question: { id: string; question: string }
    value: unknown
    onChange?: (v: unknown) => void
    disabled?: boolean
  }) => (
    <div data-testid={`question-${question.id}`}>
      <span>{question.question}</span>
      <input
        data-testid={`answer-${question.id}`}
        value={String(value ?? '')}
        onChange={(e) => !disabled && onChange?.(e.target.value)}
        disabled={disabled}
      />
    </div>
  ),
}))

const mockUseQueueAnnotations =
  require('@/hooks/annotation-queues/use-queue-annotations').useQueueAnnotations

const mockTrace = { traceID: 'trace-1', batches: [] }

describe('AnnotateConversationDialog', () => {
  const onClose = jest.fn()
  const onComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseConversationByTraces.mockReturnValue({
      traces: [mockTrace],
      isFetchLoading: false,
      fetchError: null,
      fetchConversationByTraces: mockFetchConversationByTraces,
      reset: mockResetByTraces,
    })
    mockUseFullConversation.mockReturnValue({
      traces: [],
      isFetchLoading: false,
      fetchError: null,
      fetchFullConversation: mockFetchFullConversation,
      reset: mockResetFullConversation,
    })
    mockUseQueueAnnotations.mockReturnValue({
      template: {
        id: 't1',
        questions: [
          { id: 'q1', question: 'Question 1', type: 'FREEFORM', required: true },
        ],
      },
      isTemplateLoading: false,
      createAnnotation: mockCreateAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      isCreateLoading: false,
      isUpdateLoading: false,
    })
  })

  it('renders Annotate Conversation title when open', () => {
    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        queueConversationId="qc-1"
      />
    )
    expect(
      screen.getByRole('heading', { name: 'Annotate Conversation' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Review the conversation and answer the questions/)
    ).toBeInTheDocument()
  })

  it('renders Edit Annotation when existing annotation', () => {
    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        existingAnnotation={{ id: 'ann-1', answers: [] }}
        queueConversationId="qc-1"
      />
    )
    expect(
      screen.getByRole('heading', { name: 'Edit Annotation' })
    ).toBeInTheDocument()
  })

  it('renders View Annotation when readOnly', () => {
    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        readOnly={true}
        queueConversationId="qc-1"
      />
    )
    expect(
      screen.getByRole('heading', { name: 'View Annotation' })
    ).toBeInTheDocument()
    const closeButtons = screen.getAllByRole('button', { name: 'Close' })
    expect(closeButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows loading when traces loading', () => {
    mockUseConversationByTraces.mockReturnValue({
      traces: [],
      isFetchLoading: true,
      fetchError: null,
      fetchConversationByTraces: mockFetchConversationByTraces,
      reset: mockResetByTraces,
    })

    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        queueConversationId="qc-1"
      />
    )
    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument()
  })

  it('shows error when traces fail to load', () => {
    mockUseConversationByTraces.mockReturnValue({
      traces: [],
      isFetchLoading: false,
      fetchError: 'Failed to fetch',
      fetchConversationByTraces: mockFetchConversationByTraces,
      reset: mockResetByTraces,
    })

    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        queueConversationId="qc-1"
      />
    )
    expect(screen.getByText(/Error loading conversation/)).toBeInTheDocument()
  })

  it('shows Conversation not found when no traces', () => {
    mockUseConversationByTraces.mockReturnValue({
      traces: [],
      isFetchLoading: false,
      fetchError: null,
      fetchConversationByTraces: mockFetchConversationByTraces,
      reset: mockResetByTraces,
    })

    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        queueConversationId="qc-1"
      />
    )
    expect(screen.getByText(/Conversation not found/)).toBeInTheDocument()
  })

  it('shows Conversation and Trace Viewer tabs when traces loaded', () => {
    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        queueConversationId="qc-1"
      />
    )
    expect(screen.getByRole('tab', { name: 'Conversation' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Trace Viewer' })).toBeInTheDocument()
    expect(screen.getByTestId('trace-conversation')).toBeInTheDocument()
  })

  it('shows questions from template', () => {
    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        queueConversationId="qc-1"
      />
    )
    expect(screen.getByTestId('question-q1')).toBeInTheDocument()
    expect(screen.getByText('Question 1')).toBeInTheDocument()
  })

  it('shows No questions found when template has no questions', () => {
    mockUseQueueAnnotations.mockReturnValue({
      template: { id: 't1', questions: [] },
      isTemplateLoading: false,
      createAnnotation: mockCreateAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      isCreateLoading: false,
      isUpdateLoading: false,
    })

    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        queueConversationId="qc-1"
      />
    )
    expect(
      screen.getByText(/No questions found in template/)
    ).toBeInTheDocument()
  })

  it('calls onClose when Cancel clicked', async () => {
    const user = userEvent.setup()
    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        queueConversationId="qc-1"
      />
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('Submit button disabled until all required questions answered', () => {
    render(
      <AnnotateConversationDialog
        projectId="proj-1"
        queueId="queue-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        queueConversationId="qc-1"
      />
    )
    const submitBtn = screen.getByRole('button', { name: 'Submit Annotation' })
    expect(submitBtn).toBeDisabled()
  })
})

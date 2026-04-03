import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnnotateConversationDrawer } from '../annotate-conversation-drawer'

const mockCreateAnnotation = jest.fn().mockResolvedValue(undefined)
const mockUpdateAnnotation = jest.fn().mockResolvedValue(undefined)
const mockMutateAsync = jest.fn().mockResolvedValue({ id: 'queue-conv-1' })

const mockUseQueueAnnotations = jest.fn(() => ({
  template: null,
  isTemplateLoading: false,
  createAnnotation: mockCreateAnnotation,
  updateAnnotation: mockUpdateAnnotation,
  isCreateLoading: false,
  isUpdateLoading: false,
}))

jest.mock('@/hooks/annotation-queues/use-queue-annotations', () => ({
  useQueueAnnotations: (projectId: string, queueId?: string) =>
    mockUseQueueAnnotations(projectId, queueId),
}))

const mockUseAnnotationQueuesByTypeQuery = jest.fn(() => ({
  data: [{ id: 'q1', name: 'Conversation Queue 1' }],
  isLoading: false,
}))
const mockUseAnnotationQueueQuery = jest.fn(() => ({ data: null }))
const mockUseAddConversation = jest.fn(() => ({
  mutateAsync: mockMutateAsync,
  isPending: false,
  reset: jest.fn(),
}))

jest.mock('@/hooks/annotation-queues/use-annotation-queues-query', () => ({
  useAnnotationQueuesByTypeQuery: (projectId: string, type?: string) =>
    mockUseAnnotationQueuesByTypeQuery(projectId, type),
  useAnnotationQueueQuery: (projectId: string, queueId?: string) =>
    mockUseAnnotationQueueQuery(projectId, queueId),
  useAddConversation: (projectId: string) => mockUseAddConversation(projectId),
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

jest.mock('@/components/annotation-queues/question-preview/question-preview', () => ({
  QuestionPreview: ({ question }: { question: { id: string; question: string } }) => (
    <div data-testid={`question-${question.id}`}>{question.question}</div>
  ),
}))

describe('AnnotateConversationDrawer', () => {
  const onClose = jest.fn()
  const onComplete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseQueueAnnotations.mockReturnValue({
      template: null,
      isTemplateLoading: false,
      createAnnotation: mockCreateAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      isCreateLoading: false,
      isUpdateLoading: false,
    })
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({
      data: [{ id: 'q1', name: 'Conversation Queue 1' }],
      isLoading: false,
    })
    mockUseAnnotationQueueQuery.mockReturnValue({ data: null })
    mockUseAddConversation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      reset: jest.fn(),
    })
  })

  it('renders Annotate Conversation title when open', () => {
    render(
      <AnnotateConversationDrawer
        projectId="proj-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={['trace-1']}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
      />
    )
    expect(
      screen.getByRole('heading', { name: 'Annotate Conversation' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Select an annotation queue and answer the questions/)
    ).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(
      <AnnotateConversationDrawer
        projectId="proj-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={[]}
        isOpen={false}
        onClose={onClose}
      />
    )
    expect(
      screen.queryByRole('heading', { name: 'Annotate Conversation' })
    ).not.toBeInTheDocument()
  })

  it('shows Annotation Queue select', () => {
    render(
      <AnnotateConversationDrawer
        projectId="proj-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={[]}
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByLabelText('Annotation Queue')).toBeInTheDocument()
  })

  it('shows loading queues message when queues loading', () => {
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({ data: [], isLoading: true })

    render(
      <AnnotateConversationDrawer
        projectId="proj-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={[]}
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByText('Loading queues...')).toBeInTheDocument()
  })

  it('shows no queues message when empty', () => {
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({ data: [], isLoading: false })

    render(
      <AnnotateConversationDrawer
        projectId="proj-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={[]}
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(
      screen.getByText('No conversation annotation queues found')
    ).toBeInTheDocument()
  })

  it('shows Submit Annotation button', () => {
    render(
      <AnnotateConversationDrawer
        projectId="proj-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={[]}
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByRole('button', { name: 'Submit Annotation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Annotation' })).toBeDisabled()
  })

  it('calls onClose when Cancel clicked', async () => {
    const user = userEvent.setup()
    render(
      <AnnotateConversationDrawer
        projectId="proj-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={[]}
        isOpen={true}
        onClose={onClose}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows template loading when template is loading', () => {
    mockUseQueueAnnotations.mockReturnValue({
      template: null,
      isTemplateLoading: true,
      createAnnotation: mockCreateAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      isCreateLoading: false,
      isUpdateLoading: false,
    })

    render(
      <AnnotateConversationDrawer
        projectId="proj-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={[]}
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByLabelText('Annotation Queue')).toBeInTheDocument()
  })

  it('displays error message when actionError has message', () => {
    const useActionError = require('@/hooks/shared/use-action-error').useActionError
    useActionError.mockReturnValue({
      message: 'Something went wrong',
      handleError: jest.fn(),
      clear: jest.fn(),
    })

    render(
      <AnnotateConversationDrawer
        projectId="proj-1"
        conversationId="conv-1"
        conversationConfigId="config-1"
        datasourceId="ds-1"
        traceIds={[]}
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})

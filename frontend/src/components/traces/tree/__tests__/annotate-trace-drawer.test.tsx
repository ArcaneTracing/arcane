import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnnotateTraceDrawer } from '../annotate-trace-drawer'

jest.mock('@tanstack/react-router', () => ({
  useParams: jest.fn(() => ({ datasourceId: 'ds-1' })),
}))

const mockCreateAnnotation = jest.fn().mockResolvedValue(undefined)
const mockUpdateAnnotation = jest.fn().mockResolvedValue(undefined)
const mockUseQueueAnnotations = jest.fn(() => ({
  template: null,
  isTemplateLoading: false,
  createAnnotation: mockCreateAnnotation,
  updateAnnotation: mockUpdateAnnotation,
  isCreateLoading: false,
  isUpdateLoading: false,
}))

jest.mock('@/hooks/annotation-queues/use-queue-annotations', () => ({
  useQueueAnnotations: (projectId: string, queueId?: string) => mockUseQueueAnnotations(projectId, queueId),
}))

const mockUseAnnotationQueuesByTypeQuery = jest.fn(() => ({
  data: [{ id: 'q1', name: 'Queue 1' }],
  isLoading: false,
}))
const mockUseAnnotationQueueQuery = jest.fn(() => ({ data: null }))
jest.mock('@/hooks/annotation-queues/use-annotation-queues-query', () => ({
  useAnnotationQueuesByTypeQuery: (projectId: string, type?: string) => mockUseAnnotationQueuesByTypeQuery(projectId, type),
  useAnnotationQueueQuery: (projectId: string, queueId?: string) => mockUseAnnotationQueueQuery(projectId, queueId),
  useAddTrace: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({ id: 'trace-1' }),
    isPending: false,
  })),
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

describe('AnnotateTraceDrawer', () => {
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
      data: [{ id: 'q1', name: 'Queue 1' }],
      isLoading: false,
    })
    mockUseAnnotationQueueQuery.mockReturnValue({ data: null })
  })

  it('renders Annotate Trace title when open', () => {
    render(
      <AnnotateTraceDrawer
        projectId="proj-1"
        traceId="trace-1"
        datasourceId="ds-1"
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
      />
    )
    expect(screen.getByRole('heading', { name: 'Annotate Trace' })).toBeInTheDocument()
    expect(screen.getByText(/Select an annotation queue and answer the questions/)).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(
      <AnnotateTraceDrawer
        projectId="proj-1"
        traceId="trace-1"
        datasourceId="ds-1"
        isOpen={false}
        onClose={onClose}
      />
    )
    expect(screen.queryByRole('heading', { name: 'Annotate Trace' })).not.toBeInTheDocument()
  })

  it('shows Annotation Queue select', () => {
    render(
      <AnnotateTraceDrawer
        projectId="proj-1"
        traceId="trace-1"
        datasourceId="ds-1"
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByLabelText('Annotation Queue')).toBeInTheDocument()
  })

  it('shows loading queues message when queues loading', () => {
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({ data: [], isLoading: true })

    render(
      <AnnotateTraceDrawer
        projectId="proj-1"
        traceId="trace-1"
        datasourceId="ds-1"
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByText('Annotation Queue')).toBeInTheDocument()
  })

  it('shows Submit Annotation button', () => {
    render(
      <AnnotateTraceDrawer
        projectId="proj-1"
        traceId="trace-1"
        datasourceId="ds-1"
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByRole('button', { name: 'Submit Annotation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Annotation' })).toBeDisabled()
  })


  it('calls onClose when Cancel clicked', async () => {
    render(
      <AnnotateTraceDrawer
        projectId="proj-1"
        traceId="trace-1"
        datasourceId="ds-1"
        isOpen={true}
        onClose={onClose}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('displays error message when actionError has message', () => {
    const useActionError = require('@/hooks/shared/use-action-error').useActionError
    useActionError.mockReturnValue({
      message: 'Annotation failed',
      handleError: jest.fn(),
      clear: jest.fn(),
    })

    render(
      <AnnotateTraceDrawer
        projectId="proj-1"
        traceId="trace-1"
        datasourceId="ds-1"
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByText('Annotation failed')).toBeInTheDocument()
  })

  it('shows No trace annotation queues found when queues empty', () => {
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({ data: [], isLoading: false })

    render(
      <AnnotateTraceDrawer
        projectId="proj-1"
        traceId="trace-1"
        datasourceId="ds-1"
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByText('Annotation Queue')).toBeInTheDocument()
  })

  it('shows template loading when queue selected and template loading', async () => {
    mockUseQueueAnnotations.mockReturnValue({
      template: null,
      isTemplateLoading: true,
      createAnnotation: mockCreateAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      isCreateLoading: false,
      isUpdateLoading: false,
    })

    render(
      <AnnotateTraceDrawer
        projectId="proj-1"
        traceId="trace-1"
        datasourceId="ds-1"
        isOpen={true}
        onClose={onClose}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Annotation Queue' }))
    const queueItem = await screen.findByText('Queue 1')
    await userEvent.click(queueItem)
    expect(screen.getByRole('button', { name: 'Submit Annotation' })).toBeDisabled()
  })

  it('shows Submitting when isCreateLoading', () => {
    mockUseQueueAnnotations.mockReturnValue({
      template: { questions: [] },
      isTemplateLoading: false,
      createAnnotation: mockCreateAnnotation,
      updateAnnotation: mockUpdateAnnotation,
      isCreateLoading: true,
      isUpdateLoading: false,
    })

    render(
      <AnnotateTraceDrawer
        projectId="proj-1"
        traceId="trace-1"
        datasourceId="ds-1"
        isOpen={true}
        onClose={onClose}
      />
    )
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeInTheDocument()
  })
})

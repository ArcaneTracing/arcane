import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddToQueueDialog } from '../add-to-queue-dialog'

const mockMutateAsync = jest.fn().mockResolvedValue(undefined)
const mockAddTracesMutation = {
  mutateAsync: mockMutateAsync,
  isPending: false,
  reset: jest.fn(),
}

jest.mock('@/hooks/annotation-queues/use-annotation-queues-query', () => ({
  useAnnotationQueuesByTypeQuery: jest.fn(() => ({
    data: [
      { id: 'q1', name: 'Trace Queue 1', description: 'Queue for traces' },
      { id: 'q2', name: 'Trace Queue 2' },
    ],
    isLoading: false,
  })),
  useAddTracesBulk: jest.fn(() => mockAddTracesMutation),
}))

jest.mock('@/hooks/shared/use-mutation-action', () => ({
  useMutationAction: jest.fn(({ mutation }) => ({
    ...mutation,
    isPending: mutation.isPending,
  })),
}))

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn(),
}))

const mockUseAnnotationQueuesByTypeQuery =
  require('@/hooks/annotation-queues/use-annotation-queues-query').useAnnotationQueuesByTypeQuery

describe('AddToQueueDialog', () => {
  const selectedTraces = new Set(['trace-1', 'trace-2'])
  const onSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({
      data: [
        { id: 'q1', name: 'Trace Queue 1', description: 'Queue for traces' },
        { id: 'q2', name: 'Trace Queue 2' },
      ],
      isLoading: false,
    })
    Object.assign(mockAddTracesMutation, {
      mutateAsync: mockMutateAsync,
      isPending: false,
    })
  })

  it('renders trigger button by default', () => {
    render(
      <AddToQueueDialog
        selectedTraces={selectedTraces}
        projectId="proj-1"
        datasourceId="ds-1"
      />
    )
    expect(screen.getByRole('button', { name: /Add to Annotation Queue/i })).toBeInTheDocument()
  })

  it('renders custom trigger when provided', () => {
    render(
      <AddToQueueDialog
        selectedTraces={selectedTraces}
        projectId="proj-1"
        datasourceId="ds-1"
        trigger={<button>Custom Add</button>}
      />
    )
    expect(screen.getByRole('button', { name: 'Custom Add' })).toBeInTheDocument()
  })

  it('opens dialog and shows title when trigger clicked', async () => {
    const user = userEvent.setup()
    render(
      <AddToQueueDialog
        selectedTraces={selectedTraces}
        projectId="proj-1"
        datasourceId="ds-1"
      />
    )
    await user.click(screen.getByRole('button', { name: /Add to Annotation Queue/i }))
    expect(screen.getByRole('heading', { name: 'Add to Annotation Queue' })).toBeInTheDocument()
    expect(screen.getByText(/Select an annotation queue to add 2 traces to/)).toBeInTheDocument()
  })

  it('shows singular trace in description when one selected', async () => {
    const user = userEvent.setup()
    render(
      <AddToQueueDialog
        selectedTraces={new Set(['trace-1'])}
        projectId="proj-1"
        datasourceId="ds-1"
      />
    )
    await user.click(screen.getByRole('button', { name: /Add to Annotation Queue/i }))
    expect(screen.getByText(/add 1 trace to/)).toBeInTheDocument()
  })

  it('shows loading queues message when loading', async () => {
    const user = userEvent.setup()
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({ data: [], isLoading: true })
    render(
      <AddToQueueDialog
        selectedTraces={selectedTraces}
        projectId="proj-1"
        datasourceId="ds-1"
      />
    )
    await user.click(screen.getByRole('button', { name: /Add to Annotation Queue/i }))
    expect(screen.getByText(/Loading annotation queues/)).toBeInTheDocument()
  })

  it('shows no queues message when empty', async () => {
    const user = userEvent.setup()
    mockUseAnnotationQueuesByTypeQuery.mockReturnValue({ data: [], isLoading: false })
    render(
      <AddToQueueDialog
        selectedTraces={selectedTraces}
        projectId="proj-1"
        datasourceId="ds-1"
      />
    )
    await user.click(screen.getByRole('button', { name: /Add to Annotation Queue/i }))
    expect(screen.getByText(/No trace annotation queues found/)).toBeInTheDocument()
  })

  it('shows queue list and allows selection', async () => {
    const user = userEvent.setup()
    render(
      <AddToQueueDialog
        selectedTraces={selectedTraces}
        projectId="proj-1"
        datasourceId="ds-1"
      />
    )
    await user.click(screen.getByRole('button', { name: /Add to Annotation Queue/i }))
    expect(screen.getByText('Trace Queue 1')).toBeInTheDocument()
    expect(screen.getByText('Trace Queue 2')).toBeInTheDocument()
    expect(screen.getByText('Queue for traces')).toBeInTheDocument()

    await user.click(screen.getByText('Trace Queue 1'))
    const addButton = screen.getByRole('button', { name: 'Add to Queue' })
    expect(addButton).not.toBeDisabled()
  })

  it('calls addTracesMutation when Add to Queue clicked', async () => {
    const user = userEvent.setup()
    render(
      <AddToQueueDialog
        selectedTraces={selectedTraces}
        projectId="proj-1"
        datasourceId="ds-1"
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-02')}
      />
    )
    await user.click(screen.getByRole('button', { name: /Add to Annotation Queue/i }))
    await user.click(screen.getByText('Trace Queue 1'))
    await user.click(screen.getByRole('button', { name: 'Add to Queue' }))

    expect(mockMutateAsync).toHaveBeenCalledWith({
      queueId: 'q1',
      data: {
        otelTraceIds: ['trace-1', 'trace-2'],
        datasourceId: 'ds-1',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-02T00:00:00.000Z',
      },
    })
  })

  it('calls onCancel when Cancel clicked', async () => {
    const user = userEvent.setup()
    render(
      <AddToQueueDialog
        selectedTraces={selectedTraces}
        projectId="proj-1"
        datasourceId="ds-1"
      />
    )
    await user.click(screen.getByRole('button', { name: /Add to Annotation Queue/i }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('heading', { name: 'Add to Annotation Queue' })).not.toBeInTheDocument()
  })
})

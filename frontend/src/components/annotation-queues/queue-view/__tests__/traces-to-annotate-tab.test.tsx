import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TracesToAnnotateTab } from '../traces-to-annotate-tab';
import { QueuedTraceResponse } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

const mockRemoveTrace = jest.fn().mockResolvedValue(undefined);
const mockInvalidateQueries = jest.fn();

jest.mock('@/hooks/annotation-queues/use-annotation-queues-query', () => ({
  useRemoveTraceById: jest.fn()
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

jest.mock('../delete-trace-dialog', () => ({
  DeleteTraceDialog: ({ isOpen, onConfirm, onClose }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="delete-trace-dialog">
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>);

  }
}));

import { useRemoveTraceById } from '@/hooks/annotation-queues/use-annotation-queues-query';
import { useQueryClient } from '@tanstack/react-query';

const mockUseRemoveTraceById = useRemoveTraceById as jest.MockedFunction<typeof useRemoveTraceById>;

describe('TracesToAnnotateTab', () => {
  const mockTraces: QueuedTraceResponse[] = [
  {
    id: 'queue-trace-1',
    otelTraceId: 'trace-1',
    datasourceId: 'datasource-1'
  },
  {
    id: 'queue-trace-2',
    otelTraceId: 'trace-2',
    datasourceId: 'datasource-1'
  },
  {
    id: 'queue-trace-3',
    otelTraceId: 'trace-3',
    datasourceId: 'datasource-2'
  }];


  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidateQueries.mockClear();
    mockUseRemoveTraceById.mockReturnValue({
      mutateAsync: mockRemoveTrace,
      isPending: false,
      error: null
    } as any);
  });

  it('should render traces table', () => {
    customRender(
      <TracesToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        traces={mockTraces} />

    );

    expect(screen.getByText('trace-1')).toBeInTheDocument();
    expect(screen.getByText('trace-2')).toBeInTheDocument();
    expect(screen.getByText('trace-3')).toBeInTheDocument();
  });

  it('should display empty state when no traces', () => {
    customRender(
      <TracesToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        traces={[]} />

    );

    expect(screen.getByText(/No traces to be annotated/i)).toBeInTheDocument();
  });

  it('should open annotate dialog when Annotate button is clicked', async () => {
    customRender(
      <TracesToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        traces={mockTraces} />

    );

    const annotateButtons = screen.getAllByRole('button', { name: /annotate/i });
    fireEvent.click(annotateButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('annotate-trace-dialog')).toBeInTheDocument();
    });
  });

  it('should open delete dialog when Delete button is clicked', async () => {
    customRender(
      <TracesToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        traces={mockTraces} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-trace-dialog')).toBeInTheDocument();
    });
  });

  it('should call removeTrace when delete is confirmed', async () => {
    customRender(
      <TracesToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        traces={mockTraces} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-trace-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockRemoveTrace).toHaveBeenCalled();
    });
  });

  it('should call fetchAnnotationQueue after annotation completes', async () => {
    customRender(
      <TracesToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        traces={mockTraces} />

    );

    const annotateButtons = screen.getAllByRole('button', { name: /annotate/i });
    fireEvent.click(annotateButtons[0]);

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
      <TracesToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        traces={mockTraces} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-trace-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['annotationQueue', 'project-1', 'queue-1']
      });
    });
  });


  it('should handle single trace', () => {
    customRender(
      <TracesToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        traces={[mockTraces[0]]} />

    );

    expect(screen.getByText('trace-1')).toBeInTheDocument();
    expect(screen.queryByText('trace-2')).not.toBeInTheDocument();
  });

  it('should handle many traces', () => {
    const manyTraces: QueuedTraceResponse[] = Array.from({ length: 20 }, (_, i) => ({
      id: `queue-trace-${i}`,
      otelTraceId: `trace-${i}`,
      datasourceId: 'datasource-1'
    }));

    customRender(
      <TracesToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        traces={manyTraces} />

    );

    expect(screen.getByText('trace-0')).toBeInTheDocument();
    expect(screen.getByText('trace-19')).toBeInTheDocument();
  });

  it('should handle delete error gracefully', async () => {
    mockRemoveTrace.mockRejectedValueOnce(new Error('Failed to delete'));

    customRender(
      <TracesToAnnotateTab
        projectId="project-1"
        queueId="queue-1"
        traces={mockTraces} />

    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('delete-trace-dialog')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Delete');
    fireEvent.click(confirmButton);


    await waitFor(() => {
      expect(mockRemoveTrace).toHaveBeenCalled();
    });
  });
});
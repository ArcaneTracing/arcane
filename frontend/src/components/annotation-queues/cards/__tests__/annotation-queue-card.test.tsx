import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnnotationQueueCard } from '../annotation-queue-card';
import { AnnotationQueueResponse, AnnotationQueueType } from '@/types';

jest.mock('@/components/icons/annotation-queue', () => ({
  __esModule: true,
  default: () => <div data-testid="annotation-queue-icon">Icon</div>
}));

describe('AnnotationQueueCard', () => {
  const mockQueue: AnnotationQueueResponse = {
    id: 'queue-1',
    name: 'Test Queue',
    description: 'Test Description',
    type: AnnotationQueueType.CONVERSATIONS,
    templateId: 'template-1',
    annotations: [],
    tracesToBeAnnotated: [],
    conversationsToBeAnnotated: []
  };

  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render queue information', () => {
    render(
      <AnnotationQueueCard
        queue={mockQueue}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Queue')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('CONVERSATIONS')).toBeInTheDocument();
    expect(screen.queryByText('0 annotations')).not.toBeInTheDocument();
  });

  it('should call onView when View button is clicked', () => {
    render(
      <AnnotationQueueCard
        queue={mockQueue}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const viewButton = screen.getByText('View');
    fireEvent.click(viewButton);

    expect(mockOnView).toHaveBeenCalledWith(mockQueue);
  });

  it('should call onEdit when Edit button is clicked', () => {
    render(
      <AnnotationQueueCard
        queue={mockQueue}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockQueue);
  });

  it('should call onDelete when Delete button is clicked', () => {
    render(
      <AnnotationQueueCard
        queue={mockQueue}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('queue-1');
  });

  it('should stop event propagation on edit click', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <AnnotationQueueCard
          queue={mockQueue}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete} />

      </div>
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('should stop event propagation on delete click', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <AnnotationQueueCard
          queue={mockQueue}
          onView={mockOnView}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete} />

      </div>
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });


  it('should handle queue without description', () => {
    const queueWithoutDesc: AnnotationQueueResponse = {
      ...mockQueue,
      description: undefined
    };

    render(
      <AnnotationQueueCard
        queue={queueWithoutDesc}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Queue')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should handle queue with null description', () => {
    const queueWithNullDesc: AnnotationQueueResponse = {
      ...mockQueue,
      description: null as any
    };

    render(
      <AnnotationQueueCard
        queue={queueWithNullDesc}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Queue')).toBeInTheDocument();
  });

  it('should handle queue with empty string description', () => {
    const queueWithEmptyDesc: AnnotationQueueResponse = {
      ...mockQueue,
      description: ''
    };

    render(
      <AnnotationQueueCard
        queue={queueWithEmptyDesc}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Test Queue')).toBeInTheDocument();
  });

  it('should handle queue with missing annotations array', () => {
    const queueWithoutAnnotations: AnnotationQueueResponse = {
      ...mockQueue,
      annotations: undefined
    };

    render(
      <AnnotationQueueCard
        queue={queueWithoutAnnotations}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.queryByText('0 annotations')).not.toBeInTheDocument();
  });

  it('should display singular annotation count', () => {
    const queueWithOneAnnotation: AnnotationQueue = {
      ...mockQueue,
      annotations: [{ id: 'ann-1', answers: [] }] as any
    };

    render(
      <AnnotationQueueCard
        queue={queueWithOneAnnotation}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.queryByText('1 annotation')).not.toBeInTheDocument();
  });

  it('should display plural annotation count', () => {
    const queueWithManyAnnotations: AnnotationQueueResponse = {
      ...mockQueue,
      annotations: [{ id: 'ann-1', answers: [] }, { id: 'ann-2', answers: [] }] as any
    };

    render(
      <AnnotationQueueCard
        queue={queueWithManyAnnotations}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.queryByText('2 annotations')).not.toBeInTheDocument();
  });

  it('should handle very long queue name', () => {
    const queueWithLongName: AnnotationQueueResponse = {
      ...mockQueue,
      name: 'a'.repeat(500)
    };

    render(
      <AnnotationQueueCard
        queue={queueWithLongName}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('a'.repeat(500))).toBeInTheDocument();
  });

  it('should handle very long description', () => {
    const queueWithLongDesc: AnnotationQueueResponse = {
      ...mockQueue,
      description: 'b'.repeat(1000)
    };

    render(
      <AnnotationQueueCard
        queue={queueWithLongDesc}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('b'.repeat(1000))).toBeInTheDocument();
  });

  it('should handle different queue types', () => {
    const tracesQueue: AnnotationQueueResponse = {
      ...mockQueue,
      type: AnnotationQueueType.TRACES
    };

    const { rerender } = render(
      <AnnotationQueueCard
        queue={tracesQueue}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('TRACES')).toBeInTheDocument();

    const conversationsQueue: AnnotationQueueResponse = {
      ...mockQueue,
      type: AnnotationQueueType.CONVERSATIONS
    };

    rerender(
      <AnnotationQueueCard
        queue={conversationsQueue}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('CONVERSATIONS')).toBeInTheDocument();
  });

  it('should handle empty string queue name', () => {
    const queueWithEmptyName: AnnotationQueueResponse = {
      ...mockQueue,
      name: ''
    };

    const { container } = render(
      <AnnotationQueueCard
        queue={queueWithEmptyName}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );


    expect(container.querySelector('.text-base')).toBeInTheDocument();
  });

  it('should handle missing callbacks', () => {
    render(
      <AnnotationQueueCard
        queue={mockQueue}
        onView={undefined as any}
        onEdit={undefined as any}
        onDelete={undefined as any} />

    );


    expect(screen.getByText('Test Queue')).toBeInTheDocument();
  });

  it('should render annotation queue icon', () => {
    render(
      <AnnotationQueueCard
        queue={mockQueue}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByTestId('annotation-queue-icon')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from '../question-card';
import { AnnotationQuestionResponse, AnnotationQuestionType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/components/annotation-queues/question-preview/question-preview', () => {
  const React = require('react');
  return {
    QuestionPreview: ({ question }: any) =>
    React.createElement('div', { 'data-testid': 'question-preview' },
    React.createElement('div', {}, question.question)
    )

  };
});

describe('QuestionCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const mockQuestion: AnnotationQuestionResponse = {
    id: 'question-1',
    question: 'Test Question',
    type: AnnotationQuestionType.FREEFORM,
    required: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render question preview', () => {
    customRender(
      <QuestionCard
        question={mockQuestion}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByTestId('question-preview')).toBeInTheDocument();
    expect(screen.getByText('Test Question')).toBeInTheDocument();
  });

  it('should call onEdit when Edit button is clicked', () => {
    customRender(
      <QuestionCard
        question={mockQuestion}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockQuestion);
  });

  it('should call onDelete when Delete button is clicked', () => {
    customRender(
      <QuestionCard
        question={mockQuestion}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('question-1');
  });

  it('should disable buttons when isLoading is true', () => {
    customRender(
      <QuestionCard
        question={mockQuestion}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={true} />

    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    expect(editButton).toHaveAttribute('disabled');
    expect(deleteButton).toHaveAttribute('disabled');
  });

  it('should enable buttons when isLoading is false', () => {
    customRender(
      <QuestionCard
        question={mockQuestion}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false} />

    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    expect(editButton).not.toHaveAttribute('disabled');
    expect(deleteButton).not.toHaveAttribute('disabled');
  });


  it('should handle question without id', () => {
    const questionWithoutId: AnnotationQuestionResponse = {
      question: 'Test Question',
      type: AnnotationQuestionType.FREEFORM
    };

    customRender(
      <QuestionCard
        question={questionWithoutId}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByTestId('question-preview')).toBeInTheDocument();
  });

  it('should handle question with all optional fields', () => {
    const fullQuestion: AnnotationQuestionResponse = {
      id: 'question-2',
      question: 'Full Question',
      helperText: 'Helper text',
      placeholder: 'Placeholder text',
      type: AnnotationQuestionType.FREEFORM,
      options: ['Option 1', 'Option 2'],
      min: 0,
      max: 100,
      required: true,
      default: 'default value'
    };

    customRender(
      <QuestionCard
        question={fullQuestion}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Full Question')).toBeInTheDocument();
  });

  it('should handle different question types', () => {
    const booleanQuestion: AnnotationQuestionResponse = {
      id: 'question-3',
      question: 'Boolean Question',
      type: AnnotationQuestionType.BOOLEAN
    };

    customRender(
      <QuestionCard
        question={booleanQuestion}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Boolean Question')).toBeInTheDocument();
  });

  it('should handle empty question text', () => {
    const emptyQuestion: AnnotationQuestionResponse = {
      id: 'question-4',
      question: '',
      type: AnnotationQuestionType.FREEFORM
    };

    customRender(
      <QuestionCard
        question={emptyQuestion}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByTestId('question-preview')).toBeInTheDocument();
  });
});
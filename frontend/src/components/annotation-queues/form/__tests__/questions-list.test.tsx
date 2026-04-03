import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionsList } from '../questions-list';
import { AnnotationQuestionResponse, AnnotationQuestionType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/components/annotation-queues/form/question-card', () => {
  const React = require('react');
  return {
    QuestionCard: ({ question, onEdit, onDelete }: any) =>
    React.createElement('div', { 'data-testid': `question-card-${question.id}` },
    React.createElement('div', {}, question.question),
    React.createElement('button', { onClick: () => onEdit(question) }, 'Edit'),
    React.createElement('button', { onClick: () => onDelete(question.id) }, 'Delete')
    )

  };
});

describe('QuestionsList', () => {
  const mockOnAdd = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  const mockQuestions: AnnotationQuestionResponse[] = [
  {
    id: 'question-1',
    question: 'Question 1',
    type: AnnotationQuestionType.FREEFORM
  },
  {
    id: 'question-2',
    question: 'Question 2',
    type: AnnotationQuestionType.BOOLEAN
  }];


  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render questions list', () => {
    customRender(
      <QuestionsList
        questions={mockQuestions}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  it('should display section title and description', () => {
    customRender(
      <QuestionsList
        questions={mockQuestions}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Template Questions')).toBeInTheDocument();
    expect(screen.getByText(/Add questions that annotators will answer/i)).toBeInTheDocument();
  });

  it('should render Add Question button', () => {
    customRender(
      <QuestionsList
        questions={mockQuestions}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Add Question')).toBeInTheDocument();
  });

  it('should call onAdd when Add Question button is clicked', () => {
    customRender(
      <QuestionsList
        questions={mockQuestions}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const addButton = screen.getByText('Add Question');
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalled();
  });

  it('should display empty state when no questions', () => {
    customRender(
      <QuestionsList
        questions={[]}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText(/No questions added yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Click "Add Question" to get started/i)).toBeInTheDocument();
  });

  it('should render QuestionCard for each question', () => {
    customRender(
      <QuestionsList
        questions={mockQuestions}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByTestId('question-card-question-1')).toBeInTheDocument();
    expect(screen.getByTestId('question-card-question-2')).toBeInTheDocument();
  });

  it('should pass onEdit to QuestionCard', () => {
    customRender(
      <QuestionsList
        questions={mockQuestions}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockQuestions[0]);
  });

  it('should pass onDelete to QuestionCard', () => {
    customRender(
      <QuestionsList
        questions={mockQuestions}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith('question-1');
  });

  it('should disable Add Question button when isLoading is true', () => {
    customRender(
      <QuestionsList
        questions={mockQuestions}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={true} />

    );

    const addButton = screen.getByText('Add Question');
    expect(addButton).toHaveAttribute('disabled');
  });

  it('should enable Add Question button when isLoading is false', () => {
    customRender(
      <QuestionsList
        questions={mockQuestions}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={false} />

    );

    const addButton = screen.getByText('Add Question');
    expect(addButton).not.toHaveAttribute('disabled');
  });


  it('should handle empty questions array', () => {
    customRender(
      <QuestionsList
        questions={[]}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText(/No questions added yet/i)).toBeInTheDocument();
  });

  it('should handle single question', () => {
    customRender(
      <QuestionsList
        questions={[mockQuestions[0]]}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.queryByText('Question 2')).not.toBeInTheDocument();
  });

  it('should handle many questions', () => {
    const manyQuestions: AnnotationQuestionResponse[] = Array.from({ length: 10 }, (_, i) => ({
      id: `question-${i}`,
      question: `Question ${i}`,
      type: AnnotationQuestionType.FREEFORM
    }));

    customRender(
      <QuestionsList
        questions={manyQuestions}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Question 0')).toBeInTheDocument();
    expect(screen.getByText('Question 9')).toBeInTheDocument();
  });

  it('should handle questions without ids', () => {
    const questionsWithoutIds: AnnotationQuestionResponse[] = [
    {
      question: 'Question without ID',
      type: AnnotationQuestionType.FREEFORM
    }];


    customRender(
      <QuestionsList
        questions={questionsWithoutIds}
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete} />

    );

    expect(screen.getByText('Question without ID')).toBeInTheDocument();
  });
});
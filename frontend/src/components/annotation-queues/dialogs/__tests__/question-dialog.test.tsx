import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuestionDialog } from '../question-dialog';
import { AnnotationQuestionResponse, AnnotationQuestionType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('@/components/annotation-queues/question-preview/question-preview', () => ({
  QuestionPreview: ({ question }: any) =>
  <div data-testid="question-preview">
      <div>{question.question}</div>
      <div>{question.type}</div>
    </div>

}));

describe('QuestionDialog', () => {
  const mockOnSave = jest.fn();
  const mockOnOpenChange = jest.fn();

  const mockQuestion: AnnotationQuestionResponse = {
    id: 'question-1',
    question: 'Test Question',
    type: AnnotationQuestionType.FREEFORM,
    required: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    expect(screen.getAllByText('Add Question')[0]).toBeInTheDocument();
    expect(screen.getByText(/Configure the question/i)).toBeInTheDocument();
  });

  it('should render edit mode when question is provided', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={mockQuestion}
        onSave={mockOnSave}
        isLoading={false} />

    );

    expect(screen.getByText('Edit Question')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    customRender(
      <QuestionDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    expect(screen.queryByText('Add Question')).not.toBeInTheDocument();
  });

  it('should display question input field', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    expect(questionInput).toBeInTheDocument();
  });

  it('should allow typing in question field', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = (screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0]) as HTMLInputElement;
    fireEvent.change(questionInput, { target: { value: 'New Question' } });

    expect(questionInput.value).toBe('New Question');
  });

  it('should display question type selector', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    expect(screen.getByLabelText(/question type/i)).toBeInTheDocument();
  });

  it('should show options field for multiple choice', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );


    const questionWithMultipleChoice: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.MULTIPLE_CHOICE,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithMultipleChoice}
        onSave={mockOnSave}
        isLoading={false} />

    );

    expect(screen.getByLabelText(/options/i)).toBeInTheDocument();
  });

  it('should show options field for single choice', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );


    const questionWithSingleChoice: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.SINGLE_CHOICE,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithSingleChoice}
        onSave={mockOnSave}
        isLoading={false} />

    );

    expect(screen.getByLabelText(/options/i)).toBeInTheDocument();
  });

  it('should show min/max fields for numeric type', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );


    const questionWithNumeric: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.NUMERIC,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithNumeric}
        onSave={mockOnSave}
        isLoading={false} />

    );

    expect(screen.getByLabelText(/min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max/i)).toBeInTheDocument();
  });

  it('should not show placeholder for boolean type', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );


    const questionWithBoolean: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.BOOLEAN,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithBoolean}
        onSave={mockOnSave}
        isLoading={false} />

    );


    const placeholderInputs = screen.queryAllByLabelText(/placeholder/i);
    expect(placeholderInputs.length).toBe(0);
  });

  it('should call onSave when form is submitted', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should disable submit button when question is empty', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    expect(submitButton).toBeDisabled();
  });

  it('should disable submit button when multiple choice has no options', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });


    const questionWithMultipleChoice: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.MULTIPLE_CHOICE,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithMultipleChoice}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    expect(submitButton).toBeDisabled();
  });

  it('should call onOpenChange when Cancel is clicked', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable fields when loading', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={true} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    expect(questionInput).toBeDisabled();
  });

  it('should populate form when editing existing question', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={mockQuestion}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = (screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0]) as HTMLInputElement;
    expect(questionInput.value).toBe('Test Question');
  });

  it('should show preview when question has text', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Preview Question' } });

    expect(screen.getByTestId('question-preview')).toBeInTheDocument();
  });


  it('should handle question with options', () => {
    const questionWithOptions: AnnotationQuestionResponse = {
      ...mockQuestion,
      type: AnnotationQuestionType.MULTIPLE_CHOICE,
      options: ['Option 1', 'Option 2']
    };

    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithOptions}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const optionsInput = screen.getByLabelText(/options/i) as HTMLInputElement;
    expect(optionsInput.value).toBe('Option 1, Option 2');
  });

  it('should handle question with min/max values', () => {
    const questionWithNumeric: AnnotationQuestionResponse = {
      ...mockQuestion,
      type: AnnotationQuestionType.NUMERIC,
      min: 0,
      max: 100
    };

    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithNumeric}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const minInput = screen.getByLabelText(/min/i) as HTMLInputElement;
    const maxInput = screen.getByLabelText(/max/i) as HTMLInputElement;
    expect(minInput.value).toBe('0');
    expect(maxInput.value).toBe('100');
  });

  it('should handle question with helper text', () => {
    const questionWithHelper: AnnotationQuestionResponse = {
      ...mockQuestion,
      helperText: 'Helper text'
    };

    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithHelper}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const helperInput = screen.getByLabelText(/helper text/i) as HTMLTextAreaElement;
    expect(helperInput.value).toBe('Helper text');
  });

  it('should handle question with placeholder', () => {
    const questionWithPlaceholder: AnnotationQuestionResponse = {
      ...mockQuestion,
      placeholder: 'Placeholder text'
    };

    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithPlaceholder}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const placeholderInput = screen.getByLabelText(/placeholder/i) as HTMLInputElement;
    expect(placeholderInput.value).toBe('Placeholder text');
  });

  it('should handle required checkbox', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const requiredCheckbox = screen.getByLabelText(/required/i);
    expect(requiredCheckbox).not.toBeChecked();

    fireEvent.click(requiredCheckbox);
    expect(requiredCheckbox).toBeChecked();
  });

  it('should parse comma-separated options', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });


    const questionWithMultipleChoice: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.MULTIPLE_CHOICE,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithMultipleChoice}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const optionsInput = screen.getByLabelText(/options/i);
    fireEvent.change(optionsInput, { target: { value: 'Option 1, Option 2, Option 3' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        options: ['Option 1', 'Option 2', 'Option 3']
      })
    );
  });

  it('should trim options when parsing', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });


    const questionWithMultipleChoice: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.MULTIPLE_CHOICE,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithMultipleChoice}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const optionsInput = screen.getByLabelText(/options/i);
    fireEvent.change(optionsInput, { target: { value: ' Option 1 , Option 2 ' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        options: ['Option 1', 'Option 2']
      })
    );
  });

  it('should filter empty options', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });


    const questionWithMultipleChoice: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.MULTIPLE_CHOICE,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithMultipleChoice}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const optionsInput = screen.getByLabelText(/options/i);
    fireEvent.change(optionsInput, { target: { value: 'Option 1, , Option 2' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        options: ['Option 1', 'Option 2']
      })
    );
  });

  it('should handle empty string question', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    expect(submitButton).toBeDisabled();
  });

  it('should handle whitespace-only question', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: '   ' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    expect(submitButton).toBeDisabled();
  });

  it('should handle very long question text', () => {
    const longQuestion = 'a'.repeat(1000);
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: longQuestion } });

    expect((questionInput as HTMLInputElement).value).toBe(longQuestion);
  });

  it('should handle question with undefined helperText', () => {
    const questionWithoutHelper: AnnotationQuestionResponse = {
      ...mockQuestion,
      helperText: undefined
    };

    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithoutHelper}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const helperInput = screen.getByLabelText(/helper text/i) as HTMLTextAreaElement;
    expect(helperInput.value).toBe('');
  });

  it('should handle question with undefined placeholder', () => {
    const questionWithoutPlaceholder: AnnotationQuestionResponse = {
      ...mockQuestion,
      placeholder: undefined
    };

    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithoutPlaceholder}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const placeholderInput = screen.getByLabelText(/placeholder/i) as HTMLInputElement;
    expect(placeholderInput.value).toBe('');
  });

  it('should handle question with null min/max', () => {
    const questionWithNullNumeric: AnnotationQuestionResponse = {
      ...mockQuestion,
      type: AnnotationQuestionType.NUMERIC,
      min: undefined,
      max: undefined
    };

    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithNullNumeric}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const minInput = screen.getByLabelText(/min/i) as HTMLInputElement;
    const maxInput = screen.getByLabelText(/max/i) as HTMLInputElement;
    expect(minInput.value).toBe('');
    expect(maxInput.value).toBe('');
  });

  it('should update button text when editing', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={mockQuestion}
        onSave={mockOnSave}
        isLoading={false} />

    );

    expect(screen.getByRole('button', { name: /update question/i })).toBeInTheDocument();
  });

  it('should reset form when question changes', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0] as HTMLInputElement;
    fireEvent.change(questionInput, { target: { value: 'New Question' } });

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={mockQuestion}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const updatedQuestionInputs = screen.getAllByLabelText(/question/i);
    expect((updatedQuestionInputs[0] as HTMLInputElement).value).toBe('Test Question');
  });

  it('should not submit when multiple choice has empty options', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });


    const questionWithMultipleChoice: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.MULTIPLE_CHOICE,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithMultipleChoice}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const optionsInput = screen.getByLabelText(/options/i);
    fireEvent.change(optionsInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    expect(submitButton).toBeDisabled();

    fireEvent.click(submitButton);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should not submit when single choice has empty options', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });


    const questionWithSingleChoice: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.SINGLE_CHOICE,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithSingleChoice}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const optionsInput = screen.getByLabelText(/options/i);
    fireEvent.change(optionsInput, { target: { value: '   ' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    expect(submitButton).toBeDisabled();
  });

  it('should handle numeric min/max input', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });


    const questionWithNumeric: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.NUMERIC,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithNumeric}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const minInput = screen.getByLabelText(/min/i);
    fireEvent.change(minInput, { target: { value: '10' } });

    const maxInput = screen.getByLabelText(/max/i);
    fireEvent.change(maxInput, { target: { value: '20' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        min: 10,
        max: 20
      })
    );
  });

  it('should handle empty min/max values', () => {
    const { rerender } = customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });


    const questionWithNumeric: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.NUMERIC,
      required: false
    };

    rerender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={questionWithNumeric}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const minInput = screen.getByLabelText(/min/i);
    fireEvent.change(minInput, { target: { value: '' } });

    const maxInput = screen.getByLabelText(/max/i);
    fireEvent.change(maxInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    fireEvent.click(submitButton);


    expect(mockOnSave).toHaveBeenCalled();
    const callArgs = mockOnSave.mock.calls[0][0];
    expect(callArgs.min).toBeUndefined();
    expect(callArgs.max).toBeUndefined();
  });

  it('should handle helperText changes', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });

    const helperInput = screen.getByLabelText(/helper text/i);
    fireEvent.change(helperInput, { target: { value: 'Helper text' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        helperText: 'Helper text'
      })
    );
  });

  it('should handle placeholder changes', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });

    const placeholderInput = screen.getByLabelText(/placeholder/i);
    fireEvent.change(placeholderInput, { target: { value: 'Placeholder' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholder: 'Placeholder'
      })
    );
  });

  it('should handle empty helperText as undefined', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });

    const helperInput = screen.getByLabelText(/helper text/i);
    fireEvent.change(helperInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        helperText: undefined
      })
    );
  });

  it('should handle empty placeholder as undefined', () => {
    customRender(
      <QuestionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        question={null}
        onSave={mockOnSave}
        isLoading={false} />

    );

    const questionInput = screen.getByLabelText(/^question \*$/i) || screen.getAllByLabelText(/question/i)[0];
    fireEvent.change(questionInput, { target: { value: 'Test Question' } });

    const placeholderInput = screen.getByLabelText(/placeholder/i);
    fireEvent.change(placeholderInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /add question|update question/i });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        placeholder: undefined
      })
    );
  });
});
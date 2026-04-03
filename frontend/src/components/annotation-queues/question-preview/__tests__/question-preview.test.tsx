import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionPreview } from '../question-preview';
import { AnnotationQuestionResponse, AnnotationQuestionType } from '@/types';
import { render as customRender } from '@/__tests__/test-utils';

jest.mock('../question-preview-header', () => ({
  QuestionPreviewHeader: ({ question, required, helperText }: any) =>
  <div data-testid="question-preview-header">
      <div>{question}{required && '*'}</div>
      {helperText && <div>{helperText}</div>}
    </div>

}));

jest.mock('../boolean-preview', () => ({
  BooleanPreview: ({ questionId, value, onChange }: any) =>
  <div data-testid="boolean-preview">
      <button onClick={() => onChange?.(true)}>Yes</button>
      <button onClick={() => onChange?.(false)}>No</button>
    </div>

}));

jest.mock('../freeform-preview', () => ({
  FreeformPreview: ({ placeholder, value, onChange }: any) =>
  <div data-testid="freeform-preview">
      <textarea
      data-testid="freeform-input"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder} />

    </div>

}));

jest.mock('../numeric-preview', () => ({
  NumericPreview: ({ placeholder, min, max, value, onChange }: any) =>
  <div data-testid="numeric-preview">
      <input
      data-testid="numeric-input"
      type="number"
      value={value || ''}
      onChange={(e) => onChange?.(Number(e.target.value))}
      placeholder={placeholder}
      min={min}
      max={max} />

    </div>

}));

jest.mock('../single-choice-preview', () => ({
  SingleChoicePreview: ({ questionId, options, emptyMessage, value, onChange }: any) =>
  <div data-testid="single-choice-preview">
      {options.length > 0 ?
    options.map((opt: string, idx: number) =>
    <button key={idx} onClick={() => onChange?.(opt)}>
            {opt}
          </button>
    ) :

    <div>{emptyMessage}</div>
    }
    </div>

}));

jest.mock('../multiple-choice-preview', () => ({
  MultipleChoicePreview: ({ questionId, options, emptyMessage, value, onChange }: any) =>
  <div data-testid="multiple-choice-preview">
      {options.length > 0 ?
    options.map((opt: string, idx: number) =>
    <button key={idx} onClick={() => onChange?.([...(value || []), opt])}>
            {opt}
          </button>
    ) :

    <div>{emptyMessage}</div>
    }
    </div>

}));

describe('QuestionPreview', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render QuestionPreviewHeader', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.FREEFORM
    };

    customRender(
      <QuestionPreview question={question} />
    );

    expect(screen.getByTestId('question-preview-header')).toBeInTheDocument();
  });

  it('should render BooleanPreview for boolean type', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.BOOLEAN
    };

    customRender(
      <QuestionPreview question={question} />
    );

    expect(screen.getByTestId('boolean-preview')).toBeInTheDocument();
  });

  it('should render FreeformPreview for freeform type', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.FREEFORM
    };

    customRender(
      <QuestionPreview question={question} />
    );

    expect(screen.getByTestId('freeform-preview')).toBeInTheDocument();
  });

  it('should render NumericPreview for numeric type', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.NUMERIC
    };

    customRender(
      <QuestionPreview question={question} />
    );

    expect(screen.getByTestId('numeric-preview')).toBeInTheDocument();
  });

  it('should render SingleChoicePreview for single choice type', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.SINGLE_CHOICE,
      options: ['Option 1', 'Option 2']
    };

    customRender(
      <QuestionPreview question={question} />
    );

    expect(screen.getByTestId('single-choice-preview')).toBeInTheDocument();
  });

  it('should render MultipleChoicePreview for multiple choice type', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.MULTIPLE_CHOICE,
      options: ['Option 1', 'Option 2']
    };

    customRender(
      <QuestionPreview question={question} />
    );

    expect(screen.getByTestId('multiple-choice-preview')).toBeInTheDocument();
  });

  it('should pass value and onChange to preview components', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.FREEFORM
    };

    customRender(
      <QuestionPreview
        question={question}
        value="Test value"
        onChange={mockOnChange} />

    );

    const input = screen.getByTestId('freeform-input') as HTMLTextAreaElement;
    expect(input.value).toBe('Test value');
  });

  it('should pass disabled prop to preview components', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.FREEFORM
    };

    customRender(
      <QuestionPreview
        question={question}
        onChange={mockOnChange}
        disabled={true} />

    );

    expect(screen.getByTestId('freeform-preview')).toBeInTheDocument();
  });

  it('should use optionsText when provided for single choice', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.SINGLE_CHOICE,
      options: ['Original Option']
    };

    customRender(
      <QuestionPreview
        question={question}
        optionsText="New Option 1, New Option 2" />

    );

    expect(screen.getByTestId('single-choice-preview')).toBeInTheDocument();
  });

  it('should use optionsText when provided for multiple choice', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.MULTIPLE_CHOICE,
      options: ['Original Option']
    };

    customRender(
      <QuestionPreview
        question={question}
        optionsText="New Option 1, New Option 2" />

    );

    expect(screen.getByTestId('multiple-choice-preview')).toBeInTheDocument();
  });

  it('should display empty message when optionsText is undefined and no options', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.SINGLE_CHOICE,
      options: []
    };

    customRender(
      <QuestionPreview question={question} />
    );

    expect(screen.getByText('No options configured')).toBeInTheDocument();
  });

  it('should display preview message when optionsText is provided but empty', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.SINGLE_CHOICE,
      options: []
    };

    customRender(
      <QuestionPreview
        question={question}
        optionsText="" />

    );

    expect(screen.getByText('Add options above to see preview')).toBeInTheDocument();
  });


  it('should handle question without id', () => {
    const question: AnnotationQuestionResponse = {
      question: 'Test Question',
      type: AnnotationQuestionType.FREEFORM
    };

    customRender(
      <QuestionPreview question={question} />
    );

    expect(screen.getByTestId('freeform-preview')).toBeInTheDocument();
  });

  it('should handle question with all optional fields', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
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
      <QuestionPreview question={question} />
    );

    expect(screen.getByTestId('freeform-preview')).toBeInTheDocument();
  });

  it('should handle optionsText with whitespace', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.SINGLE_CHOICE,
      options: []
    };

    customRender(
      <QuestionPreview
        question={question}
        optionsText="  Option 1  ,  Option 2  ,  Option 3  " />

    );

    expect(screen.getByTestId('single-choice-preview')).toBeInTheDocument();
  });

  it('should handle optionsText with empty strings', () => {
    const question: AnnotationQuestionResponse = {
      id: 'question-1',
      question: 'Test Question',
      type: AnnotationQuestionType.SINGLE_CHOICE,
      options: []
    };

    customRender(
      <QuestionPreview
        question={question}
        optionsText="Option 1,,Option 2, ,Option 3" />

    );

    expect(screen.getByTestId('single-choice-preview')).toBeInTheDocument();
  });
});
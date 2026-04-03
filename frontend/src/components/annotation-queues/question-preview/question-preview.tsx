"use client";

import { AnnotationQuestionResponse, AnnotationQuestionType } from '@/types';
import { QuestionPreviewHeader } from '@/components/annotation-queues/question-preview/question-preview-header';
import { BooleanPreview } from '@/components/annotation-queues/question-preview/boolean-preview';
import { FreeformPreview } from '@/components/annotation-queues/question-preview/freeform-preview';
import { NumericPreview } from '@/components/annotation-queues/question-preview/numeric-preview';
import { SingleChoicePreview } from '@/components/annotation-queues/question-preview/single-choice-preview';
import { MultipleChoicePreview } from '@/components/annotation-queues/question-preview/multiple-choice-preview';

interface QuestionPreviewProps {
  question: AnnotationQuestionResponse;
  optionsText?: string;

  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
}

export function QuestionPreview({ question, optionsText, value, onChange, disabled }: Readonly<QuestionPreviewProps>) {
  const displayOptions = optionsText ?
  optionsText.split(',').map((opt) => opt.trim()).filter(Boolean) :
  question.options || [];

  const emptyMessage = optionsText === undefined ?
  "No options configured" :
  "Add options above to see preview";

  return (
    <div className="space-y-2">
      <QuestionPreviewHeader
        question={question.question}
        required={question.required}
        helperText={question.helperText} />

      
      {}
      {question.type === AnnotationQuestionType.BOOLEAN &&
      <BooleanPreview
        questionId={question.id}
        value={value}
        onChange={onChange}
        disabled={disabled} />

      }

      {question.type === AnnotationQuestionType.FREEFORM &&
      <FreeformPreview
        placeholder={question.placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled} />

      }

      {question.type === AnnotationQuestionType.NUMERIC &&
      <NumericPreview
        placeholder={question.placeholder}
        min={question.min}
        max={question.max}
        value={value}
        onChange={onChange}
        disabled={disabled} />

      }

      {question.type === AnnotationQuestionType.SINGLE_CHOICE &&
      <SingleChoicePreview
        questionId={question.id}
        options={displayOptions}
        emptyMessage={emptyMessage}
        value={value}
        onChange={onChange}
        disabled={disabled} />

      }

      {question.type === AnnotationQuestionType.MULTIPLE_CHOICE &&
      <MultipleChoicePreview
        questionId={question.id}
        options={displayOptions}
        emptyMessage={emptyMessage}
        value={value}
        onChange={onChange}
        disabled={disabled} />

      }
    </div>);

}
import { Loader2 } from 'lucide-react'
import { QuestionPreview } from '@/components/annotation-queues/question-preview/question-preview'
import type { AnnotationQuestionResponse } from '@/types/annotation-queue'

type AnnotationQuestionsContentProps = {
  isTemplateLoading: boolean
  questions: AnnotationQuestionResponse[] | undefined
  answers: Record<string, unknown>
  readOnly: boolean
  onAnswerChange: (questionId: string, value: unknown) => void
}

export function AnnotationQuestionsContent({
  isTemplateLoading,
  questions,
  answers,
  readOnly,
  onAnswerChange,
}: Readonly<AnnotationQuestionsContentProps>) {
  if (isTemplateLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" data-testid="icon-loader2" />
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
        No questions found in template. Please configure the template first.
      </div>
    )
  }

  return (
    <>
      {questions.map((question) => (
        <QuestionPreview
          key={question.id}
          question={question}
          value={answers[question.id]}
          onChange={readOnly ? undefined : (value) => onAnswerChange(question.id, value)}
          disabled={readOnly}
        />
      ))}
    </>
  )
}

"use client"

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AnnotationQuestionResponse } from '@/types'
import { QuestionCard } from '@/components/annotation-queues/form/question-card'

interface QuestionsListProps {
  questions: AnnotationQuestionResponse[]
  onAdd: () => void
  onEdit: (question: AnnotationQuestionResponse) => void
  onDelete: (questionId: string) => void
  isLoading?: boolean
}

export function QuestionsList({
  questions,
  onAdd,
  onEdit,
  onDelete,
  isLoading,
}: Readonly<QuestionsListProps>) {
  return (
    <div className="border-t pt-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Template Questions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add questions that annotators will answer for each trace.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAdd}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-12 border border-dashed rounded-lg">
            No questions added yet. Click "Add Question" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={onEdit}
                onDelete={onDelete}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


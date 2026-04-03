"use client"

import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { AnnotationQuestionResponse } from '@/types'
import { QuestionPreview } from '@/components/annotation-queues/question-preview/question-preview'

interface QuestionCardProps {
  question: AnnotationQuestionResponse
  onEdit: (question: AnnotationQuestionResponse) => void
  onDelete: (questionId: string) => void
  isLoading?: boolean
}

export function QuestionCard({ question, onEdit, onDelete, isLoading }: Readonly<QuestionCardProps>) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <QuestionPreview question={question} />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(question)}
            disabled={isLoading}
          >
            <span className="sr-only">Edit</span>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => question.id && onDelete(question.id)}
            disabled={isLoading}
          >
            <span className="sr-only">Delete</span>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


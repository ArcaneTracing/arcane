"use client"

interface QuestionPreviewHeaderProps {
  question: string
  required?: boolean
  helperText?: string
}

export function QuestionPreviewHeader({ question, required, helperText }: Readonly<QuestionPreviewHeaderProps>) {
  return (
    <>
      <div className="text-sm font-medium">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      {helperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </>
  )
}


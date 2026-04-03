"use client"

export interface TableErrorStateProps {
  error: string | Error | null | undefined
  className?: string
}

export function TableErrorState({ error, className }: Readonly<TableErrorStateProps>) {
  if (!error) return null

  const errorMessage = error instanceof Error ? error.message : String(error)

  return (
    <div className={`text-sm text-red-500 dark:text-red-400 text-center py-8 ${className || ''}`}>
      Error: {errorMessage}
    </div>
  )
}


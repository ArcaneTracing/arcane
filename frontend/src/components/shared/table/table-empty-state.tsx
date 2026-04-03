"use client"

import { LucideIcon } from "lucide-react"

export interface TableEmptyStateProps {
  message?: string
  icon?: LucideIcon
  className?: string
}

export function TableEmptyState({ 
  message = "No items found", 
  icon: Icon,
  className 
}: Readonly<TableEmptyStateProps>) {
  return (
    <div className={`text-sm text-gray-500 dark:text-gray-400 text-center py-12 ${className || ''}`}>
      {Icon && <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />}
      {message}
    </div>
  )
}


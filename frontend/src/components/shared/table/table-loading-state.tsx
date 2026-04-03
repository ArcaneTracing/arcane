"use client"

import { Loader2 } from "lucide-react"

export interface TableLoadingStateProps {
  height?: string
  className?: string
}

export function TableLoadingState({ height = "h-64", className }: Readonly<TableLoadingStateProps>) {
  return (
    <div className={`flex justify-center items-center ${height} ${className || ''}`}>
      <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
    </div>
  )
}


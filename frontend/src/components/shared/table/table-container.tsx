"use client"

import { ReactNode } from "react"
import { TableLoadingState } from "./table-loading-state"
import { TableErrorState } from "./table-error-state"
import { TableEmptyState } from "./table-empty-state"

export interface TableContainerProps {
  isLoading?: boolean
  error?: string | Error | null
  isEmpty?: boolean
  emptyMessage?: string
  loadingHeight?: string
  children: ReactNode
  className?: string
}

export function TableContainer({
  isLoading = false,
  error,
  isEmpty = false,
  emptyMessage,
  loadingHeight,
  children,
  className
}: Readonly<TableContainerProps>) {
  if (isLoading) {
    return <TableLoadingState height={loadingHeight} />
  }

  if (error) {
    return <TableErrorState error={error} />
  }

  if (isEmpty) {
    return <TableEmptyState message={emptyMessage} />
  }

  return <div className={className}>{children}</div>
}


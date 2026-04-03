"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Meta } from "@/types/shared"

interface ModelConfigurationsTablePaginationProps {
  meta: Meta
  onPageChange: (page: number) => void
}

export function ModelConfigurationsTablePagination({ meta, onPageChange }: Readonly<ModelConfigurationsTablePaginationProps>) {
  if (meta.totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} configurations
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={!meta.hasPreviousPage}
          className="h-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {meta.page} of {meta.totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={!meta.hasNextPage}
          className="h-8"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}


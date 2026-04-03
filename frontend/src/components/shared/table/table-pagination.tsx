import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

interface TablePaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function TablePagination({ meta, onPageChange }: Readonly<TablePaginationProps>) {
  const startIndex = (meta.page - 1) * meta.limit + 1
  const endIndex = Math.min(meta.page * meta.limit, meta.total)
  
  return (
    <div className="mt-4 flex justify-end w-full">
      <Pagination className="ml-auto mr-0 justify-end w-auto">
        <PaginationContent className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PaginationItem>
              <button 
                className="flex items-center justify-center h-8 w-8 text-sm text-muted-foreground/60 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-[#1F1F1F]"
                onClick={() => onPageChange(1)}
                disabled={meta.page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            </PaginationItem>
            <PaginationItem>
              <button 
                className="flex items-center justify-center h-8 w-8 text-sm text-muted-foreground/60 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-[#1F1F1F]"
                onClick={() => onPageChange(meta.page - 1)}
                disabled={!meta.hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </PaginationItem>
          </div>
          
          <div className="text-sm text-muted-foreground/60 dark:text-gray-400">
            Showing {startIndex}-{endIndex} of {meta.total}
          </div>

          <div className="flex items-center gap-2">
            <PaginationItem>
              <button 
                className="flex items-center justify-center h-8 w-8 text-sm text-muted-foreground/60 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-[#1F1F1F]"
                onClick={() => onPageChange(meta.page + 1)}
                disabled={!meta.hasNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </PaginationItem>
            <PaginationItem>
              <button 
                className="flex items-center justify-center h-8 w-8 text-sm text-muted-foreground/60 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 dark:hover:bg-[#1F1F1F]"
                onClick={() => onPageChange(meta.totalPages)}
                disabled={meta.page === meta.totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </PaginationItem>
          </div>
        </PaginationContent>
      </Pagination>
    </div>
  )
}


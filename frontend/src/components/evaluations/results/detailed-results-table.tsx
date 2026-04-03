import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TablePagination, type PaginationMeta } from '@/components/shared/table'
import { DetailedResultRowComponent } from './detailed-result-row'
import type { DetailedResultRow } from './evaluation-results-detailed-utils'

type DetailedResultsTableProps = {
  headers: string[]
  displayScoreIds: string[]
  paginatedItems: DetailedResultRow[]
  filteredRows: DetailedResultRow[]
  searchQuery: string
  onSearchChange: (value: string) => void
  onSort: (index: number) => void
  getScoreName: (scoreId: string) => string
  meta: PaginationMeta
  onPageChange: (page: number) => void
  showExperimentColumn: boolean
  showStatusBadge?: boolean
  manualScoreIds?: string[]
  onRowClick?: (row: DetailedResultRow) => void
}

export function DetailedResultsTable({
  headers,
  displayScoreIds,
  paginatedItems,
  filteredRows,
  searchQuery,
  onSearchChange,
  onSort,
  getScoreName,
  meta,
  onPageChange,
  showExperimentColumn,
  showStatusBadge = true,
  manualScoreIds = [],
  onRowClick,
}: Readonly<DetailedResultsTableProps>) {
  const hasManualScores = manualScoreIds.length > 0
  const colSpan = headers.length + (showExperimentColumn ? 1 : 0) + displayScoreIds.length

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground/40 dark:text-gray-400/40" />
        <Input
          placeholder="Search results"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 w-[240px] h-8 rounded-lg bg-white dark:bg-[#0D0D0D] border-[1px] border border-gray-100 dark:border-[#2A2A2A] placeholder:text-muted-foreground/40 dark:placeholder:text-gray-400/40 dark:text-gray-100"
        />
      </div>

      <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header, index) => (
                <TableHead
                  key={header}
                  className="border-r border-gray-200 dark:border-[#2A2A2A] text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => onSort(index)}
                >
                  {header}
                </TableHead>
              ))}
              {showExperimentColumn && (
                <TableHead className="border-r border-gray-200 dark:border-[#2A2A2A] text-xs font-medium text-gray-500 dark:text-gray-400">
                  Experiment Result
                </TableHead>
              )}
              {displayScoreIds.map((scoreId) => (
                <TableHead
                  key={scoreId}
                  className="border-r border-gray-200 dark:border-[#2A2A2A] last:border-r-0 text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {getScoreName(scoreId)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">No results found</div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((row) => (
                <DetailedResultRowComponent
                  key={row.id}
                  row={row}
                  headers={headers}
                  displayScoreIds={displayScoreIds}
                  showExperimentColumn={showExperimentColumn}
                  showStatusBadge={showStatusBadge}
                  manualScoreIds={manualScoreIds}
                  onClick={hasManualScores && onRowClick ? () => onRowClick(row) : undefined}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {filteredRows.length > 0 && <TablePagination meta={meta} onPageChange={onPageChange} />}
    </>
  )
}

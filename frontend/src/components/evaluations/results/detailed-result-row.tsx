import { Pencil } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { TruncatedCell } from '@/components/shared/truncated-cell'
import { ScoreResultCell } from './score-result-cell'
import type { DetailedResultRow } from './evaluation-results-detailed-utils'

type DetailedResultRowProps = {
  row: DetailedResultRow
  headers: string[]
  displayScoreIds: string[]
  showExperimentColumn: boolean
  showStatusBadge?: boolean
  manualScoreIds?: string[]
  onClick?: () => void
}

export function DetailedResultRowComponent({
  row,
  headers,
  displayScoreIds,
  showExperimentColumn,
  showStatusBadge = true,
  manualScoreIds = [],
  onClick,
}: Readonly<DetailedResultRowProps>) {
  return (
    <TableRow
      className={`border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {headers.map((header, index) => (
        <TableCell
          key={`${row.id}-${header}`}
          className="text-xs text-gray-900 dark:text-gray-100 py-3 border-r border-gray-200 dark:border-[#2A2A2A]"
        >
          <TruncatedCell value={row.values[index] || ''} maxLength={50} />
        </TableCell>
      ))}
      {showExperimentColumn && (
        <TableCell className="text-xs text-gray-900 dark:text-gray-100 py-3 border-r border-gray-200 dark:border-[#2A2A2A]">
          <TruncatedCell value={row.experimentResult || ''} maxLength={50} />
        </TableCell>
      )}
      {displayScoreIds.map((scoreId) => {
        const isManualScore = manualScoreIds.includes(scoreId)
        return (
          <TableCell
            key={scoreId}
            className={`border-r border-gray-200 dark:border-[#2A2A2A] last:border-r-0 ${isManualScore && onClick ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center gap-2">
              <ScoreResultCell scoreResult={row.scoreResults.get(scoreId)} showStatusBadge={showStatusBadge} />
              {isManualScore && onClick && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                  }}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground hover:text-foreground"
                  aria-label="Edit manual score"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </TableCell>
        )
      })}
    </TableRow>
  )
}

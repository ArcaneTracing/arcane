import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SortIcon } from "@/components/icons/sort-icon"

type SortDirection = 'asc' | 'desc'

interface SortConfig {
  columnIndex: number | null
  direction: SortDirection
}

interface ExperimentResultsTableHeaderProps {
  headers: string[]
  sortConfig: SortConfig
  onSort: (columnIndex: number) => void
}

interface SortableHeaderProps {
  label: string
  columnIndex: number
  sortConfig: SortConfig
  onSort: (columnIndex: number) => void
  className?: string
}

function SortableHeader({ label, columnIndex, sortConfig, onSort, className = "" }: Readonly<SortableHeaderProps>) {
  const isActive = sortConfig.columnIndex === columnIndex
  
  return (
    <TableHead 
      className={`text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 group ${className}`}
      onClick={() => onSort(columnIndex)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon className={`h-4 w-4 transition-transform ${(() => {
          if (!isActive) return 'rotate-180 opacity-0 group-hover:opacity-30'
          return sortConfig.direction === 'asc' ? 'inline-block rotate-[180deg]' : 'inline-block rotate-[0deg]'
        })()}`} />
      </div>
    </TableHead>
  )
}

export function ExperimentResultsTableHeader({ headers, sortConfig, onSort }: Readonly<ExperimentResultsTableHeaderProps>) {
  return (
    <TableHeader>
      <TableRow className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-transparent">
        {headers.map((header, index) => (
          <SortableHeader 
            key={header}
            label={header} 
            columnIndex={index} 
            sortConfig={sortConfig} 
            onSort={onSort}
          />
        ))}
        <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Experiment Result
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}


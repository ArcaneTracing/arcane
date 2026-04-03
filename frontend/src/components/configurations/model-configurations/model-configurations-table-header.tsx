import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SortIcon } from "@/components/icons/sort-icon"

type SortKey = 'name' | 'adapter' | 'createdAt'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  key: SortKey
  direction: SortDirection
}

interface ModelConfigurationsTableHeaderProps {
  sortConfig: SortConfig
  onSort: (key: SortKey) => void
}

interface SortableHeaderProps {
  label: string
  sortKey: SortKey
  sortConfig: SortConfig
  onSort: (key: SortKey) => void
  className?: string
}

function SortableHeader({ label, sortKey, sortConfig, onSort, className = "" }: Readonly<SortableHeaderProps>) {
  const isActive = sortConfig.key === sortKey
  const rotationClass = (() => {
    if (!isActive) return 'rotate-180 opacity-0 group-hover:opacity-30'
    if (sortConfig.direction === 'asc') return 'inline-block rotate-[180deg]'
    return 'inline-block rotate-[0deg]'
  })()

  return (
    <TableHead 
      className={`text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 group ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon className={`h-4 w-4 transition-transform ${rotationClass}`} />
      </div>
    </TableHead>
  )
}

export function ModelConfigurationsTableHeader({ sortConfig, onSort }: Readonly<ModelConfigurationsTableHeaderProps>) {
  return (
    <TableHeader>
      <TableRow className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-transparent">
        <SortableHeader 
          label="Name" 
          sortKey="name" 
          sortConfig={sortConfig} 
          onSort={onSort}
          className="py-3"
        />
        <SortableHeader 
          label="Adapter" 
          sortKey="adapter" 
          sortConfig={sortConfig} 
          onSort={onSort}
          className="text-xs"
        />
        <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 py-3">
          Model Name
        </TableHead>
        <SortableHeader 
          label="Created Date" 
          sortKey="createdAt" 
          sortConfig={sortConfig} 
          onSort={onSort}
          className="text-xs"
        />
        <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}


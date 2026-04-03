import { TableHead } from "@/components/ui/table"
import { SortIcon } from "@/components/icons/sort-icon"

export interface SortConfig<T extends string = string> {
  key: T
  direction: 'asc' | 'desc'
}

interface SortableHeaderProps<T extends string = string> {
  label: string
  sortKey: T
  sortConfig: SortConfig<T>
  onSort: (key: T) => void
  className?: string
}

export function SortableHeader<T extends string = string>({ 
  label, 
  sortKey, 
  sortConfig, 
  onSort, 
  className = "" 
}: Readonly<SortableHeaderProps<T>>) {
  const isActive = sortConfig.key === sortKey
  
  return (
    <TableHead 
      className={`text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 group ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon className={`h-4 w-4 transition-transform ${(() => {
          if (!isActive) return 'rotate-180 opacity-0 group-hover:opacity-30'
          if (sortConfig.direction === 'asc') return 'inline-block rotate-[180deg]'
          return 'inline-block rotate-[0deg]'
        })()}`} />
      </div>
    </TableHead>
  )
}


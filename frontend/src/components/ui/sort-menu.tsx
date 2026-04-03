"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SortOption {
  value: string
  label: string
}

export interface SortMenuProps {
  options: SortOption[]
  sortKey: string
  sortDirection: 'asc' | 'desc'
  onSortChange: (key: string, direction: 'asc' | 'desc') => void
}

export function SortMenu({ options, sortKey, sortDirection, onSortChange }: SortMenuProps) {
  const handleSort = (key: string) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    onSortChange(key, newDirection)
  }

  const currentOption = options.find(opt => opt.value === sortKey)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {currentOption?.label || 'Sort'}
          </span>
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          ) : (
            <ArrowDown className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSort(option.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{option.label}</span>
            {sortKey === option.value && (
              <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export interface TableSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TableSearchBar({ 
  value, 
  onChange, 
  placeholder = "Search",
  className 
}: Readonly<TableSearchBarProps>) {
  return (
    <div className={`relative ${className || ''}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-muted-foreground/40 dark:text-gray-400/40" />
      <Input 
        placeholder={placeholder}
        className="pl-9 w-[240px] h-8 rounded-lg bg-white dark:bg-[#0D0D0D] border-[1px] border border-gray-100 dark:border-[#2A2A2A] placeholder:text-muted-foreground/40 dark:placeholder:text-gray-400/40 dark:text-gray-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}


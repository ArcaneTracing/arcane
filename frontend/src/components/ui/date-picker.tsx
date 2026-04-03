"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  className?: string
  value?: Date | undefined
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
}

export function DatePicker({
  className,
  value,
  onChange,
  disabled = false,
  placeholder = "Pick a date"
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date)
    if (date) {
      setOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange?.(undefined)
    setOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal group",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              <span className="flex-1">
                {format(value, "LLL dd, y")}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
            {value && !disabled && (
              <div 
                role="button"
                className="ml-2 rounded-full hover:bg-muted p-1"
                onMouseDown={handleClear}
                onClick={handleClear}
              >
                <X className="h-4 w-4 opacity-50 group-hover:opacity-100" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}


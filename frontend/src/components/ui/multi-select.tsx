"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MultiSelectOption {
  value: string
  label: string
  description?: string
}

interface MultiSelectProps {
  value?: string[]
  onChange: (value: string[]) => void
  options?: MultiSelectOption[]
  placeholder?: string
}

export function MultiSelect({ value = [], onChange, options = [], placeholder = "Select items..." }: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleUnselect = (itemValue: string) => {
    const newValue = value.filter((v) => v !== itemValue)
    onChange(newValue)
  }

  const handleSelect = (itemValue: string) => {
    setInputValue("")
    if (value.includes(itemValue)) {
      handleUnselect(itemValue)
    } else {
      const newValue = [...value, itemValue]
      onChange(newValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && value.length > 0) {
          handleUnselect(value[value.length - 1])
        }
      }
      if (e.key === "Escape") {
        input.blur()
      }
    }
  }

  const selectables = options.filter((option) => !value.includes(option.value))

  return (
    <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-border focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {value.map((selectedValue) => {
            const option = options.find((o) => o.value === selectedValue)
            if (!option) return null
            return (
              <TooltipProvider key={option.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center">
                      <Badge variant="secondary" className="cursor-pointer">
                        {option.label}
                        <button
                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-border focus:ring-offset-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUnselect(option.value)
                            }
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onClick={() => handleUnselect(option.value)}
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  {option.description && (
                    <TooltipContent side="top" align="center" className="z-[100]">
                      <p className="max-w-xs">{option.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={value.length === 0 ? placeholder : undefined}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {selectables.map((option) => {
                return (
                  <TooltipProvider key={option.value}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <CommandItem
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            onSelect={() => handleSelect(option.value)}
                            className="cursor-pointer w-full"
                          >
                            {option.label}
                          </CommandItem>
                        </div>
                      </TooltipTrigger>
                      {option.description && (
                        <TooltipContent side="right" align="center" className="z-[100]">
                          <p className="max-w-xs">{option.description}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </Command>
  )
}


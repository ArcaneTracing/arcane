"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TruncatedCellProps {
  value: string
  maxLength?: number
  className?: string
}

export function TruncatedCell({ value, maxLength = 50, className = "" }: Readonly<TruncatedCellProps>) {
  const [copied, setCopied] = useState(false)
  const shouldTruncate = value.length > maxLength
  const displayValue = shouldTruncate ? `${value.substring(0, maxLength)}...` : value

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 group ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="truncate flex-1 min-w-0">{displayValue}</span>
          </TooltipTrigger>
          {shouldTruncate && (
            <TooltipContent className="max-w-md max-h-64 overflow-y-auto">
              <p className="whitespace-pre-wrap break-words">{value}</p>
            </TooltipContent>
          )}
        </Tooltip>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </TooltipProvider>
  )
}


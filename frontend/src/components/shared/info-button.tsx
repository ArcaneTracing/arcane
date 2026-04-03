"use client"

import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface InfoButtonProps {
  content: string | React.ReactNode
  className?: string
  iconSize?: "sm" | "md" | "lg"
  side?: "top" | "bottom" | "left" | "right"
  maxWidth?: string
}

export function InfoButton({
  content,
  className = "",
  iconSize = "md",
  side = "top",
  maxWidth = "max-w-md"
}: Readonly<InfoButtonProps>) {
  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button
          type="button"
          tabIndex={-1}
          className={cn("text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative z-10", className)}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onFocus={(e) => {
            e.preventDefault()
            e.target.blur()
          }}
        >
          <Info className={iconSizeClasses[iconSize]} />
          <span className="sr-only">Help</span>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        collisionPadding={8}
        className={cn(maxWidth, "max-h-[min(20rem,var(--radix-tooltip-content-available-height))] overflow-y-auto")}
      >
        {typeof content === 'string' ? (
          <p className="whitespace-pre-line">{content}</p>
        ) : (
          content
        )}
      </TooltipContent>
    </Tooltip>
  )
}

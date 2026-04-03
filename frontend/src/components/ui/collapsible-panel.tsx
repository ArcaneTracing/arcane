"use client"

import { Button } from "@/components/ui/button"
import { PanelRightClose, PanelRightOpen } from "lucide-react"
import { useState, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CollapsiblePanelProps {
  children: ReactNode
  className?: string
}

export function CollapsiblePanel({ children, className = "" }: CollapsiblePanelProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) {
    return (
      <div className="w-12 border-l flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(false)}
        className="absolute right-2 top-2 z-10 text-muted-foreground hover:text-foreground"
      >
        <PanelRightClose className="h-4 w-4" />
      </Button>
      {children}
    </div>
  )
}


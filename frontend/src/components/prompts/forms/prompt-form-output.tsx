"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

export interface PromptFormOutputProps {
  output: string
}

export function PromptFormOutput({ output }: Readonly<PromptFormOutputProps>) {
  return (
    <Collapsible defaultOpen className="flex flex-col">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 w-full">
        <ChevronDown className="h-4 w-4" />
        Output
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col">
        <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-4 bg-white dark:bg-[#0D0D0D] flex flex-col min-h-[200px] max-h-[400px]">
          <div className="mb-2 shrink-0">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">A Output</span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <pre className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-words font-mono">
              {output || 'click run to see output'}
            </pre>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}


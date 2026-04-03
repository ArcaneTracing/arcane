"use client"

import { Button } from "@/components/ui/button"
import { InfoButton } from "@/components/shared/info-button"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  PROMPT_RESPONSE_FORMAT_TOOLTIP,
  PROMPT_TOOLS_TOOLTIP,
} from "@/lib/prompts/tools-response-format-tooltips"

export interface PromptFormActionsProps {
  responseFormatOpen: boolean
  onToggleResponseFormat: () => void
  onAddTool: () => void
  onAddMessage: () => void
}

export function PromptFormActions({
  responseFormatOpen,
  onToggleResponseFormat,
  onAddTool,
  onAddMessage,
}: Readonly<PromptFormActionsProps>) {
  return (
    <TooltipProvider>
      <div className="flex gap-2 mt-4 flex-wrap items-center">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={responseFormatOpen ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleResponseFormat}
            className="h-8 text-xs"
          >
            {responseFormatOpen ? "− Response Format" : "+ Response Format"}
          </Button>
          <InfoButton
            content={PROMPT_RESPONSE_FORMAT_TOOLTIP}
            iconSize="sm"
            maxWidth="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddTool}
            className="h-8 text-xs"
          >
            + Tool
          </Button>
          <InfoButton
            content={PROMPT_TOOLS_TOOLTIP}
            iconSize="sm"
            maxWidth="max-w-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddMessage}
          className="h-8 text-xs"
        >
          + Message
        </Button>
      </div>
    </TooltipProvider>
  )
}


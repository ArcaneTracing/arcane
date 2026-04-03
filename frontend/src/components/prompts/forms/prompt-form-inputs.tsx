"use client"

import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { TemplateFormat } from "@/types/enums"
import { extractVariablesFromMessages } from "@/lib/prompt-utils"
import { MessageBox } from "@/hooks/prompts/use-prompt-form"

export interface PromptFormInputsProps {
  templateFormat: TemplateFormat
  messages: MessageBox[]
  inputValues: Record<string, string>
  onInputChange: (variable: string, value: string) => void
}

export function PromptFormInputs({
  templateFormat,
  messages,
  inputValues,
  onInputChange,
}: Readonly<PromptFormInputsProps>) {
  const detectedVariables = extractVariablesFromMessages(messages, templateFormat)

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 w-full">
        <ChevronDown className="h-4 w-4" />
        Inputs
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg p-4 bg-white dark:bg-[#0D0D0D]">
          {(() => {
            if (templateFormat === 'NONE') {
              return (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  No template format selected. Variables are only detected when using Mustache or F-String formats.
                </p>
              )
            }
            if (detectedVariables.length === 0) {
              const hint = templateFormat === TemplateFormat.MUSTACHE
                ? 'Add variable inputs to your prompt using {{input name}} within your prompt template.'
                : 'Add variable inputs to your prompt using {input name} within your prompt template.'
              return (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {hint}
                </p>
              )
            }
            return (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detected Variables ({detectedVariables.length})
              </p>
              {detectedVariables.map((variable) => (
                <div key={variable} className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {variable}
                  </label>
                  <Textarea
                    value={inputValues[variable] || ''}
                    onChange={(e) => onInputChange(variable, e.target.value)}
                    placeholder={`Enter value for ${variable}...`}
                    className="w-full min-h-[60px] text-xs font-mono border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] resize-none"
                  />
                </div>
              ))}
            </div>
            )
          })()}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}


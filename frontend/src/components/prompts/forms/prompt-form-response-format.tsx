"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import type { AdapterType } from "@/types/model-configuration";

const PLACEHOLDER_OPENAI_BEDROCK = `{
  "type": "json_schema",
  "json_schema": {
    "name": "result_schema",
    "schema": {
      "type": "object",
      "properties": {
        "result": {
          "type": "string"
        }
      },
      "required": ["result"],
      "additionalProperties": false
    },
    "strict": true
  }
}`;

const PLACEHOLDER_ANTHROPIC = `{
  "type": "json_schema",
  "schema": {
    "type": "object",
    "properties": {
      "response": {"type": "string"}
    },
    "required": ["response"],
    "additionalProperties": false
  }
}`;

const PLACEHOLDER_GOOGLE = `{
  "response_mime_type": "application/json",
  "response_schema": {
    "type": "OBJECT",
    "properties": {
      "result": {
        "type": "STRING"
      }
    },
    "required": ["result"]
  }
}`;

function getPlaceholderForAdapter(adapter: AdapterType | undefined): string {
  switch (adapter) {
    case "anthropic":
      return PLACEHOLDER_ANTHROPIC;
    case "google-vertex-ai":
    case "google-ai-studio":
      return PLACEHOLDER_GOOGLE;
    case "openai":
    case "azure":
    case "bedrock":
    default:
      return PLACEHOLDER_OPENAI_BEDROCK;
  }
}

export interface PromptFormResponseFormatProps {
  responseFormat: string;
  isOpen: boolean;
  onFormatChange: (format: string) => void;
  onOpenChange: (open: boolean) => void;
  adapter?: AdapterType;
}

function getLineNumbers(content: string) {
  const lines = content.split('\n');
  return lines.length || 1;
}

export function PromptFormResponseFormat({
  responseFormat,
  isOpen,
  onFormatChange,
  onOpenChange,
  adapter
}: Readonly<PromptFormResponseFormatProps>) {
  const placeholder = getPlaceholderForAdapter(adapter);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInternalChangeRef = useRef(false);


  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    const el = textareaRef.current;
    if (el && el.value !== responseFormat) {
      el.value = responseFormat;
    }
  }, [responseFormat]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    isInternalChangeRef.current = true;
    onFormatChange(value);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="mt-4">
      <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg overflow-hidden bg-white dark:bg-[#0D0D0D]">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]">
          <CollapsibleTrigger className="flex items-center gap-2 text-left">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="text-sm font-medium">Response Format</span>
            <span className="text-xs text-gray-500">Schema</span>
          </CollapsibleTrigger>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => navigator.clipboard.writeText(responseFormat)}>

              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CollapsibleContent>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 dark:bg-[#1A1A1A] border-r border-gray-200 dark:border-[#2A2A2A] flex flex-col items-center py-2 text-xs text-gray-400 font-mono">
              {Array.from({ length: getLineNumbers(responseFormat) || 13 }, (_, i) =>
              <div key={i}>{i + 1}</div>
              )}
            </div>
            <Textarea
              ref={textareaRef}
              defaultValue={responseFormat}
              onChange={handleChange}
              className="w-full min-h-[200px] pl-10 pr-3 py-2 font-mono text-sm border-0 resize-none focus-visible:ring-0 dark:bg-[#0D0D0D] dark:text-white"
              placeholder={placeholder} />

          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>);

}
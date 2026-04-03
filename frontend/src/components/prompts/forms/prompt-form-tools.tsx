"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export interface Tool {
  id: string;
  content: string;
}

export interface PromptFormToolsProps {
  tools: Tool[];
  toolOpenStates: Record<string, boolean>;
  onAddTool: () => void;
  onRemoveTool: (id: string) => void;
  onUpdateTool: (id: string, content: string) => void;
  onCopyTool: (id: string) => void;
  onToggleToolOpen: (id: string) => void;
}

function getLineNumbers(content: string) {
  const lines = content.split('\n');
  return lines.length || 1;
}

function getToolName(tool: Tool, index: number): string {
  try {
    const parsed = JSON.parse(tool.content);
    if (parsed?.function?.name) {
      return parsed.function.name;
    }
  } catch {

  }
  return `Tool ${index + 1}`;
}

export function PromptFormTools({
  tools,
  toolOpenStates,
  onAddTool,
  onRemoveTool,
  onUpdateTool,
  onCopyTool,
  onToggleToolOpen
}: Readonly<PromptFormToolsProps>) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      {tools.map((tool, index) => {
        const toolOpen = toolOpenStates[tool.id] !== false;
        const toolName = getToolName(tool, index);

        return (
          <Collapsible key={tool.id} open={toolOpen} onOpenChange={() => onToggleToolOpen(tool.id)} className="flex flex-col">
            <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg overflow-hidden bg-white dark:bg-[#0D0D0D]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]">
                <CollapsibleTrigger className="flex items-center gap-2 text-left">
                  {toolOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="text-sm font-medium">{toolName}</span>
                </CollapsibleTrigger>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onCopyTool(tool.id)}>

                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRemoveTool(tool.id)}>

                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CollapsibleContent>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 dark:bg-[#1A1A1A] border-r border-gray-200 dark:border-[#2A2A2A] flex flex-col items-center py-2 text-xs text-gray-400 font-mono">
                    {Array.from({ length: getLineNumbers(tool.content) || 16 }, (_, i) =>
                    <div key={i}>{i + 1}</div>
                    )}
                  </div>
                  <Textarea
                    value={tool.content}
                    onChange={(e) => onUpdateTool(tool.id, e.target.value)}
                    className="w-full min-h-[300px] pl-10 pr-3 py-2 font-mono text-sm border-0 resize-none focus-visible:ring-0 dark:bg-[#0D0D0D] dark:text-white"
                    placeholder={`{\n  "type": "function",\n  "function": {\n    "name": "new_function_1",\n    "description": "a description",\n    "parameters": {\n      "type": "object",\n      "properties": {\n        "new_arg": {\n          "type": "string"\n        }\n      },\n      "required": []\n    }\n  }\n}`} />

                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>);

      })}
    </div>);

}
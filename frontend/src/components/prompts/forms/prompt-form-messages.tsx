"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Copy, Trash2, GripVertical, ChevronDown } from "lucide-react"
import { MessageBox } from "@/hooks/prompts/use-prompt-form"

export interface PromptFormMessagesProps {
  messages: MessageBox[]
  onAddMessage: () => void
  onRemoveMessage: (id: string) => void
  onUpdateMessage: (id: string, field: 'role' | 'content', value: string) => void
  onCopyMessage: (id: string) => void
}

function getLineNumbers(content: string) {
  const lines = content.split('\n')
  return lines.length || 1
}

export function PromptFormMessages({
  messages,
  onAddMessage,
  onRemoveMessage,
  onUpdateMessage,
  onCopyMessage,
}: Readonly<PromptFormMessagesProps>) {
  return (
    <Collapsible defaultOpen className="flex flex-col">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <ChevronDown className="h-4 w-4" />
        Prompts
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg overflow-hidden bg-white dark:bg-[#0D0D0D]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <Select
                    value={message.role}
                    onValueChange={(value) => onUpdateMessage(message.id, 'role', value)}
                  >
                    <SelectTrigger className="h-7 w-[100px] text-xs border-0 bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onCopyMessage(message.id)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {messages.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onRemoveMessage(message.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 dark:bg-[#1A1A1A] border-r border-gray-200 dark:border-[#2A2A2A] flex flex-col items-center py-2 text-xs text-gray-400 font-mono">
                  {Array.from({ length: getLineNumbers(message.content) }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <Textarea
                  value={message.content}
                  onChange={(e) => onUpdateMessage(message.id, 'content', e.target.value)}
                  className="w-full min-h-[100px] pl-10 pr-3 py-2 font-mono text-sm border-0 resize-none focus-visible:ring-0 dark:bg-[#0D0D0D] dark:text-white"
                  placeholder={message.role === 'system' ? 'Enter system message...' : 'Enter user message...'}
                />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}


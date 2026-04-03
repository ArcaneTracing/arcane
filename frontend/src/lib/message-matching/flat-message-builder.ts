import { MessageType } from '@/types'
import type { ExtractedMessage } from './shared'
import type { NormalizedSpan } from '@/types/traces'

export function buildMessagesFromMap(
  messageMap: Map<string, Partial<ExtractedMessage>>,
  defaultTimestamp: number,
  defaultSpanId: string
): ExtractedMessage[] {
  const messages: ExtractedMessage[] = []
  const sortedKeys = Array.from(messageMap.keys()).sort((a, b) => {
    const numA = Number(a)
    const numB = Number(b)
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      return numA - numB
    }
    return a.localeCompare(b)
  })
  
  for (const key of sortedKeys) {
    const partialMessage = messageMap.get(key)!
    const finalMessage: ExtractedMessage = {
      type: partialMessage.type || MessageType.USER,
      content: partialMessage.content || '',
      timestamp: partialMessage.timestamp || defaultTimestamp,
      spanId: partialMessage.spanId || defaultSpanId,
      tool_call_id: partialMessage.tool_call_id,
      tool_call_function_name: partialMessage.tool_call_function_name,
      tool_call_function_arguments: partialMessage.tool_call_function_arguments,
      name: partialMessage.name,
    }
    
    messages.push(finalMessage)
  }

  return messages
}

export function createMessageMapGetter(
  messageMap: Map<string, Partial<ExtractedMessage>>,
  span: NormalizedSpan,
  timestamp: number
): (key: string | null) => Partial<ExtractedMessage> | null {
  return (key: string | null): Partial<ExtractedMessage> | null => {
    if (key === null) return null
    
    if (!messageMap.has(key)) {
      messageMap.set(key, {
        type: MessageType.USER,
        content: '',
        timestamp,
        spanId: span.spanId,
      })
    }
    return messageMap.get(key)!
  }
}

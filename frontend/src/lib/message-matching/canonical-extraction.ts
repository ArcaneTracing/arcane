import { CanonicalMessageMatchingConfiguration } from '@/types'
import { ExtractedMessage, mapRoleToMessageType } from './shared'
import { extractInputMessages, parseInputMessages } from './canonical/input-messages'
import { getAttributeValue } from './canonical/util'
import type { NormalizedSpan } from '@/types/traces'

function extractOutputMessages(
  span: NormalizedSpan,
  config: CanonicalMessageMatchingConfiguration
): ExtractedMessage[] {
  const messages: ExtractedMessage[] = []

  if (!config.outputAttributeKey) {
    return messages
  }

  const outputValue = getAttributeValue(span.attributes, config.outputAttributeKey)
  if (!outputValue) {
    return messages
  }

  const parsedMessages = parseInputMessages(outputValue)
  for (const msg of parsedMessages) {
    messages.push({
      type: mapRoleToMessageType(msg.role),
      content: msg.content,
      timestamp: span.endTime || span.startTime,
      spanId: span.spanId,
      name: msg.name,
      tool_call_id: msg.tool_call_id,
      tool_call_function_name: msg.tool_call_function_name,
      tool_call_function_arguments: msg.tool_call_function_arguments,
    })
  }

  return messages
}

export function extractCanonicalMessagesFromSpan(
  span: NormalizedSpan,
  config: CanonicalMessageMatchingConfiguration
): ExtractedMessage[] {
  const inputMessages = extractInputMessages(span, config)
  const outputMessages = extractOutputMessages(span, config)
  const allMessages = [...inputMessages, ...outputMessages]
  return allMessages.sort((a, b) => a.timestamp - b.timestamp)
}

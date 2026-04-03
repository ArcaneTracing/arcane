import { EntityResponse, MessageMatchingType, FlatMessageMatchingPatterns, MessageType } from '@/types'
import type { ExtractedMessage } from '../shared'
import { mergeConversations, processSpansForMessageMatching, mapRoleToMessageType } from '../shared'
import {
  matchesPattern,
  extractIndexFromMatch,
} from './pattern-handlers'
import { extractContent, addContentWithNewline, extractToolCallArguments } from '../flat-helpers'
import type { NormalizedSpan, TempoTraceResponse, SpanAttribute } from '@/types/traces'

export type { ExtractedMessage } from '../shared'

function attributeValueToString(value: unknown): string {
  if (value == null) return ''
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

function attributeValueToStringIfPresent(value: unknown): string | null {
  if (value == null) return null
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

type GetOrCreateMessage = (key: string | null) => Partial<ExtractedMessage> | null

function tryRolePattern(
  key: string,
  value: unknown,
  patterns: FlatMessageMatchingPatterns,
  getOrCreateMessage: GetOrCreateMessage
): boolean {
  if (!patterns.rolePattern || !matchesPattern(key, patterns.rolePattern)) return false
  const index = extractIndexFromMatch(key, patterns.rolePattern)
  const message = getOrCreateMessage(index)
  if (!message) return true
  const roleStr = attributeValueToString(value)
  message.type = mapRoleToMessageType(roleStr.toLowerCase())
  return true
}

function tryContentPattern(
  key: string,
  value: unknown,
  patterns: FlatMessageMatchingPatterns,
  getOrCreateMessage: GetOrCreateMessage
): boolean {
  if (!patterns.contentPattern || !matchesPattern(key, patterns.contentPattern)) return false
  const index = extractIndexFromMatch(key, patterns.contentPattern)
  const message = getOrCreateMessage(index)
  if (!message) return true
  const content = extractContent(value as SpanAttribute['value'])
  if (content) addContentWithNewline(message, content)
  return true
}

function tryToolCallFunctionNamePattern(
  key: string,
  value: unknown,
  patterns: FlatMessageMatchingPatterns,
  getOrCreateMessage: GetOrCreateMessage
): boolean {
  if (!patterns.toolCallFunctionNamePattern || !matchesPattern(key, patterns.toolCallFunctionNamePattern)) return false
  const index = extractIndexFromMatch(key, patterns.toolCallFunctionNamePattern)
  const message = getOrCreateMessage(index)
  if (!message) return true
  const functionName = attributeValueToStringIfPresent(value)
  if (functionName) message.tool_call_function_name = functionName
  return true
}

function tryToolCallIdPattern(
  key: string,
  value: unknown,
  patterns: FlatMessageMatchingPatterns,
  getOrCreateMessage: GetOrCreateMessage
): boolean {
  if (!patterns.toolCallIdPattern || !matchesPattern(key, patterns.toolCallIdPattern)) return false
  const index = extractIndexFromMatch(key, patterns.toolCallIdPattern)
  const message = getOrCreateMessage(index)
  if (!message) return true
  const toolCallId = attributeValueToStringIfPresent(value)
  if (toolCallId) message.tool_call_id = toolCallId
  return true
}

function tryToolCallFunctionArgumentPattern(
  key: string,
  value: unknown,
  patterns: FlatMessageMatchingPatterns,
  getOrCreateMessage: GetOrCreateMessage
): boolean {
  if (!patterns.toolCallFunctionArgumentPattern || !matchesPattern(key, patterns.toolCallFunctionArgumentPattern)) return false
  const index = extractIndexFromMatch(key, patterns.toolCallFunctionArgumentPattern)
  const message = getOrCreateMessage(index)
  if (!message) return true
  const args = extractToolCallArguments(value as SpanAttribute['value'])
  if (args) message.tool_call_function_arguments = args
  return true
}

function tryToolMessageCallIdPattern(
  key: string,
  value: unknown,
  patterns: FlatMessageMatchingPatterns,
  getOrCreateMessage: GetOrCreateMessage
): boolean {
  if (!patterns.toolMessageCallIdPattern || !matchesPattern(key, patterns.toolMessageCallIdPattern)) return false
  const index = extractIndexFromMatch(key, patterns.toolMessageCallIdPattern)
  const message = getOrCreateMessage(index)
  if (!message) return true
  const toolCallId = attributeValueToStringIfPresent(value)
  if (toolCallId) message.tool_call_id = toolCallId
  return true
}

function tryNamePattern(
  key: string,
  value: unknown,
  patterns: FlatMessageMatchingPatterns,
  getOrCreateMessage: GetOrCreateMessage
): boolean {
  if (!patterns.namePattern || !matchesPattern(key, patterns.namePattern)) return false
  const index = extractIndexFromMatch(key, patterns.namePattern)
  const message = getOrCreateMessage(index)
  if (!message) return true
  const name = attributeValueToStringIfPresent(value)
  if (name) message.name = name
  return true
}

const PATTERN_HANDLERS: Array<(
  key: string,
  value: unknown,
  patterns: FlatMessageMatchingPatterns,
  getOrCreateMessage: GetOrCreateMessage
) => boolean> = [
  tryRolePattern,
  tryContentPattern,
  tryToolCallFunctionNamePattern,
  tryToolCallIdPattern,
  tryToolCallFunctionArgumentPattern,
  tryToolMessageCallIdPattern,
  tryNamePattern,
]

export function processAttribute(
  key: string,
  value: SpanAttribute['value'],
  patterns: FlatMessageMatchingPatterns,
  getOrCreateMessage: GetOrCreateMessage
): boolean {
  for (const tryHandler of PATTERN_HANDLERS) {
    if (tryHandler(key, value, patterns, getOrCreateMessage)) return true
  }
  return false
}

function extractMessagesFromSpan(
  span: NormalizedSpan,
  patterns: FlatMessageMatchingPatterns,
  isInput: boolean
): ExtractedMessage[] {
  if (!span.attributes || !Array.isArray(span.attributes)) {
    return []
  }

  const messageMap = new Map<string, Partial<ExtractedMessage>>()
  const timestamp = isInput ? span.startTime : (span.endTime || span.startTime)

  const getOrCreateMessage = (key: string | null): Partial<ExtractedMessage> | null => {
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

  for (const attr of span.attributes) {
    if (!attr?.key) continue
    processAttribute(attr.key, attr.value, patterns, getOrCreateMessage)
  }

  return convertMessageMapToArray(messageMap, timestamp, span.spanId, isInput)
}

function convertMessageMapToArray(
  messageMap: Map<string, Partial<ExtractedMessage>>,
  defaultTimestamp: number,
  defaultSpanId: string,
  isInput: boolean
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

export function extractFlatMessagesFromTrace(
  trace: TempoTraceResponse | Record<string, unknown> | null | undefined,
  entities: EntityResponse[]
): ExtractedMessage[] {
  const sortedSpans = processSpansForMessageMatching(trace, entities)
  
  if (sortedSpans.length === 0) {
    return []
  }

  const conversations: ExtractedMessage[][] = []

  for (const span of sortedSpans) {
    if (
      !span.matchedEntity?.messageMatching ||
      span.matchedEntity.messageMatching.type !== MessageMatchingType.FLAT ||
      !span.matchedEntity.messageMatching.flatMessageMatchingConfiguration
    ) {
      continue
    }

    const config = span.matchedEntity.messageMatching.flatMessageMatchingConfiguration

    const inputMessages = extractMessagesFromSpan(span, config.flatInputMessageMatchingKeys, true)
    const outputMessages = extractMessagesFromSpan(span, config.flatOutputMessageMatchingKeys, false)

    const spanConversation = [...inputMessages, ...outputMessages]
    
    spanConversation.sort((a, b) => a.timestamp - b.timestamp)

    if (spanConversation.length > 0) {
      conversations.push(spanConversation)
    }
  }

  return mergeConversations(conversations)
}


import { FlatMessageMatchingPatterns } from '@/types'
import { mapRoleToMessageType } from './shared'
import { matchesPattern, extractIndexFromMatch } from './flat/pattern-handlers'
import { extractContent, addContentWithNewline, extractToolCallArguments } from './flat-helpers'
import type { SpanAttribute } from '@/types/traces'
import type { ExtractedMessage } from './shared'

function attributeValueToString(value: unknown): string {
  if (value == null) return ''
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

function attributeValueToOptionalString(value: unknown): string | null {
  if (value == null) return null
  const s = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return s || null
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
  const content = extractContent(value)
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
  const functionName = attributeValueToOptionalString(value)
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
  const toolCallId = attributeValueToOptionalString(value)
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
  const args = extractToolCallArguments(value)
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
  const toolCallId = attributeValueToOptionalString(value)
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
  const name = attributeValueToOptionalString(value)
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

export function processAttributePatterns(
  attr: SpanAttribute,
  patterns: FlatMessageMatchingPatterns,
  getOrCreateMessage: GetOrCreateMessage
): boolean {
  if (!attr?.key) return false
  const { key, value } = attr
  for (const tryHandler of PATTERN_HANDLERS) {
    if (tryHandler(key, value, patterns, getOrCreateMessage)) return true
  }
  return false
}

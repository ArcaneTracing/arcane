import { FlatMessageMatchingConfiguration } from '@/types'
import type { ExtractedMessage } from './shared'
import { processAttributePatterns } from './flat-pattern-processor'
import { buildMessagesFromMap, createMessageMapGetter } from './flat-message-builder'
import type { NormalizedSpan } from '@/types/traces'

export function extractFlatMessagesFromSpan(
  span: NormalizedSpan,
  patterns: FlatMessageMatchingConfiguration['flatInputMessageMatchingKeys'] | FlatMessageMatchingConfiguration['flatOutputMessageMatchingKeys'],
  isInput: boolean
): ExtractedMessage[] {
  if (!span.attributes || !Array.isArray(span.attributes)) {
    return []
  }

  const timestamp = isInput ? span.startTime : (span.endTime || span.startTime)
  const messageMap = new Map<string, Partial<ExtractedMessage>>()
  const getOrCreateMessage = createMessageMapGetter(messageMap, span, timestamp)

  for (const attr of span.attributes) {
    processAttributePatterns(attr, patterns, getOrCreateMessage)
  }

  return buildMessagesFromMap(messageMap, timestamp, span.spanId)
}

export function extractFlatMessagesFromSingleSpan(
  span: NormalizedSpan,
  config: FlatMessageMatchingConfiguration
): ExtractedMessage[] {
  const inputMessages = extractFlatMessagesFromSpan(span, config.flatInputMessageMatchingKeys, true)
  const outputMessages = extractFlatMessagesFromSpan(span, config.flatOutputMessageMatchingKeys, false)
  const allMessages = [...inputMessages, ...outputMessages]
  return allMessages.sort((a, b) => a.timestamp - b.timestamp)
}

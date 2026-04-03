import { EntityResponse, CanonicalMessageMatchingConfiguration, MessageMatchingType } from '@/types';
import type { ExtractedMessage } from '../shared';
import { mergeConversations, processSpansForMessageMatching, mapRoleToMessageType } from '../shared';
import { extractInputMessages, parseInputMessages } from './input-messages';
import { getAttributeValue } from './util';
import type { NormalizedSpan, TempoTraceResponse } from '@/types/traces';

export type { ExtractedMessage } from '../shared';
function extractOutputMessages(
span: NormalizedSpan,
config: CanonicalMessageMatchingConfiguration)
: ExtractedMessage[] {
  const messages: ExtractedMessage[] = [];

  if (!config.outputAttributeKey) {
    return messages;
  }

  const outputValue = getAttributeValue(span.attributes, config.outputAttributeKey);
  if (!outputValue) {
    return messages;
  }


  const parsedMessages = parseInputMessages(outputValue);
  for (const msg of parsedMessages) {
    messages.push({
      type: mapRoleToMessageType(msg.role),
      content: msg.content,
      timestamp: span.endTime || span.startTime,
      spanId: span.spanId,
      name: msg.name,
      tool_call_id: msg.tool_call_id,
      tool_call_function_name: msg.tool_call_function_name,
      tool_call_function_arguments: msg.tool_call_function_arguments
    });
  }

  return messages;
}


function extractMessagesFromSpan(
span: NormalizedSpan,
config: CanonicalMessageMatchingConfiguration)
: ExtractedMessage[] {
  const inputMessages = extractInputMessages(span, config);
  const outputMessages = extractOutputMessages(span, config);
  return [...inputMessages, ...outputMessages];
}
export function extractCanonicalMessagesFromTrace(
trace: TempoTraceResponse | Record<string, unknown> | null | undefined,
entities: EntityResponse[])
: ExtractedMessage[] {

  const sortedSpans = processSpansForMessageMatching(trace, entities);

  if (sortedSpans.length === 0) {
    return [];
  }


  const conversations: ExtractedMessage[][] = [];

  for (const span of sortedSpans) {

    if (
    !span.matchedEntity?.messageMatching ||
    span.matchedEntity.messageMatching.type !== MessageMatchingType.CANONICAL ||
    !span.matchedEntity.messageMatching.canonicalMessageMatchingConfiguration)
    {
      continue;
    }

    const config = span.matchedEntity.messageMatching.canonicalMessageMatchingConfiguration;


    const spanConversation = extractMessagesFromSpan(span, config);


    spanConversation.sort((a, b) => a.timestamp - b.timestamp);


    if (spanConversation.length > 0) {
      conversations.push(spanConversation);
    }
  }


  return mergeConversations(conversations);
}
import { extractSpansFromTrace, normalizeSpan } from '@/lib/trace-utils';
import { findMatchingEntity } from '@/lib/entity-utils';
import { EntityResponse, MessageType } from '@/types';
import type { TempoTraceResponse, NormalizedSpan } from '@/types/traces';

export function mapRoleToMessageType(role: string): MessageType {
  if (!role) return MessageType.USER;

  const normalizedRole = role.toLowerCase();
  if (normalizedRole === 'user' || normalizedRole === 'human') {
    return MessageType.USER;
  }
  if (normalizedRole === 'assistant' || normalizedRole === 'ai' || normalizedRole === 'model') {
    return MessageType.ASSISTANT;
  }
  if (normalizedRole === 'system') {
    return MessageType.SYSTEM;
  }
  if (normalizedRole === 'tool' || normalizedRole === 'function') {
    return MessageType.TOOL;
  }
  return MessageType.USER;
}

export interface ExtractedMessage {
  type: MessageType;
  content: string;
  timestamp: number;
  spanId: string;
  tool_call_id?: string;
  tool_call_function_name?: string;
  tool_call_function_arguments?: Record<string, unknown>;
  name?: string;
}

export function processSpansForMessageMatching(
trace: TempoTraceResponse | Record<string, unknown> | null | undefined,
entities: EntityResponse[])
: NormalizedSpan[] {
  if (!trace || !entities || entities.length === 0) {
    return [];
  }

  const spanData = extractSpansFromTrace(trace);
  const normalizedSpans = spanData.map(({ span, resource }) =>
  normalizeSpan(span, resource)
  );

  const spansWithEntities: NormalizedSpan[] = normalizedSpans.map((span) => ({
    ...span,
    matchedEntity: findMatchingEntity(span, entities)
  }));

  const sortedSpans = [...spansWithEntities].sort((a, b) => a.startTime - b.startTime);

  return sortedSpans;
}

function getMessageKey(msg: ExtractedMessage): string {
  return `${msg.type}:${msg.content}`;
}

function messagesEqual(msg1: ExtractedMessage, msg2: ExtractedMessage): boolean {
  return getMessageKey(msg1) === getMessageKey(msg2);
}
function findCommonPrefixLength(seq1: ExtractedMessage[], seq2: ExtractedMessage[]): number {
  let commonLength = 0;
  const minLength = Math.min(seq1.length, seq2.length);

  for (let i = 0; i < minLength; i++) {
    if (messagesEqual(seq1[i], seq2[i])) {
      commonLength++;
    } else {
      break;
    }
  }

  return commonLength;
}

function findBestMatch(
processed: ExtractedMessage[][],
current: ExtractedMessage[])
: {maxCommonLength: number;bestMatchIndex: number;} {
  let maxCommonLength = 0;
  let bestMatchIndex = 0;
  for (let j = 0; j < processed.length; j++) {
    const commonLength = findCommonPrefixLength(processed[j], current);
    if (commonLength > maxCommonLength) {
      maxCommonLength = commonLength;
      bestMatchIndex = j;
    }
  }
  return { maxCommonLength, bestMatchIndex };
}

function findInsertIndexAfterLastCommon(
merged: ExtractedMessage[],
lastCommonMessage: ExtractedMessage | null)
: number {
  if (!lastCommonMessage) return merged.length;
  for (let k = merged.length - 1; k >= 0; k--) {
    if (messagesEqual(merged[k], lastCommonMessage)) return k + 1;
  }
  return merged.length;
}

export function mergeConversations(conversations: ExtractedMessage[][]): ExtractedMessage[] {
  if (conversations.length === 0) return [];
  if (conversations.length === 1) return conversations[0];

  const merged: ExtractedMessage[] = [...conversations[0]];
  const processed: ExtractedMessage[][] = [conversations[0]];

  for (let i = 1; i < conversations.length; i++) {
    const current = conversations[i];
    const { maxCommonLength, bestMatchIndex } = findBestMatch(processed, current);

    if (maxCommonLength < current.length) {
      const uniqueMessages = current.slice(maxCommonLength);
      const commonPrefix = processed[bestMatchIndex].slice(0, maxCommonLength);
      const lastCommon = maxCommonLength > 0 ? commonPrefix[maxCommonLength - 1] : null;
      const insertIndex = findInsertIndexAfterLastCommon(merged, lastCommon);
      merged.splice(insertIndex, 0, ...uniqueMessages);
    }
    processed.push(current);
  }

  return merged.sort((a, b) => a.timestamp - b.timestamp);
}
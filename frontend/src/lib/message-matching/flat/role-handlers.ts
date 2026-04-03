import { MessageType } from '@/types';
import type { SpanAttribute } from '@/types/traces';
import { ExtractedMessage, mapRoleToMessageType } from '../shared';
import { matchesPattern, matchesPatternWithResult, extractIndexFromMatch } from './pattern-utils';

export interface RolePatternResult {
  matched: boolean;
  finalizedMessage: ExtractedMessage | null;
  newMessage: Partial<ExtractedMessage> | null;
  messageIndex: number | null;
}

export function handleRolePattern(
pattern: string | undefined,
key: string,
value: SpanAttribute['value'],
currentMessage: Partial<ExtractedMessage> | null,
timestamp: number,
spanId: string)
: RolePatternResult {
  const { matched } = matchesPatternWithResult(key, pattern);
  if (!matched) {
    return {
      matched: false,
      finalizedMessage: null,
      newMessage: null,
      messageIndex: null
    };
  }

  const messageIndexStr = pattern ? extractIndexFromMatch(key, pattern) : null;
  const messageIndex = messageIndexStr ? Number.parseInt(messageIndexStr, 10) : null;

  const finalizedMessage: ExtractedMessage | null = currentMessage ?
  {
    type: currentMessage.type || MessageType.USER,
    content: currentMessage.content || '',
    timestamp: currentMessage.timestamp || timestamp,
    spanId: currentMessage.spanId || spanId,
    tool_call_id: currentMessage.tool_call_id,
    tool_call_function_name: currentMessage.tool_call_function_name,
    tool_call_function_arguments: currentMessage.tool_call_function_arguments,
    name: currentMessage.name
  } :
  null;

  const roleStr = (() => {
    if (!value) return '';
    return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
  })();
  const role = roleStr.toLowerCase();
  const newMessage: Partial<ExtractedMessage> = {
    type: mapRoleToMessageType(role),
    content: '',
    timestamp,
    spanId
  };

  return {
    matched: true,
    finalizedMessage,
    newMessage,
    messageIndex: Number.isNaN(messageIndex as number) ? null : messageIndex
  };
}

export function handleNamePattern(
pattern: string | undefined,
key: string,
value: SpanAttribute['value'],
currentMessage: Partial<ExtractedMessage>)
: boolean {
  if (!pattern || !matchesPattern(key, pattern)) {
    return false;
  }

  const name = (() => {
    if (!value) return null;
    return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
  })();
  if (name && name !== (currentMessage.content || '')) {
    currentMessage.name = name;
  }

  return true;
}
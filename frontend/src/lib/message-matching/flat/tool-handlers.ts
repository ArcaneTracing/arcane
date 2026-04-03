import type { SpanAttribute } from '@/types/traces';
import type { ExtractedMessage } from '../shared';
import { matchesPattern } from './pattern-utils';

function valueToString(value: SpanAttribute['value']): string | null {
  if (!value) return null;
  return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
}

export function handleToolCallFunctionNamePattern(
pattern: string | undefined,
key: string,
value: SpanAttribute['value'],
currentMessage: Partial<ExtractedMessage>)
: boolean {
  if (!pattern || !matchesPattern(key, pattern)) {
    return false;
  }

  const functionName = valueToString(value);
  if (functionName) {
    currentMessage.tool_call_function_name = functionName;
  }

  return true;
}

export function handleToolCallIdPattern(
pattern: string | undefined,
key: string,
value: SpanAttribute['value'],
currentMessage: Partial<ExtractedMessage>)
: boolean {
  if (!pattern || !matchesPattern(key, pattern)) {
    return false;
  }

  const toolCallId = valueToString(value);
  if (toolCallId) {
    currentMessage.tool_call_id = toolCallId;
  }

  return true;
}

export function handleToolCallFunctionArgumentPattern(
pattern: string | undefined,
key: string,
value: SpanAttribute['value'],
currentMessage: Partial<ExtractedMessage>)
: boolean {
  if (!pattern || !matchesPattern(key, pattern)) {
    return false;
  }

  if (value !== null && value !== undefined) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      currentMessage.tool_call_function_arguments = value as Record<string, unknown>;
    } else {
      currentMessage.tool_call_function_arguments = { value };
    }
  }

  return true;
}

export function handleToolMessageCallIdPattern(
pattern: string | undefined,
key: string,
value: SpanAttribute['value'],
currentMessage: Partial<ExtractedMessage>)
: boolean {
  return handleToolCallIdPattern(pattern, key, value, currentMessage);
}
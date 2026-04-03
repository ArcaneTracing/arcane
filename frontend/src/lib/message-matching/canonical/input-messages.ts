import { ExtractedMessage, mapRoleToMessageType } from '../shared';
import { CanonicalMessageMatchingConfiguration } from '@/types';
import type { NonObjectPrimitive } from '@/lib/utils';
import { getAttributeValue } from './util';
export interface ParsedInputMessage {
  role: string;
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_call_function_name?: string;
  tool_call_function_arguments?: Record<string, unknown>;
}

function toDisplayStr(v: unknown, fallback = 'unknown'): string {
  if (v == null) return fallback;
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'string') return v;
  return String(v as NonObjectPrimitive);
}
function extractPartContent(part: unknown): string {
  if (!part || typeof part !== 'object') {
    return '';
  }

  const p = part as Record<string, unknown>;
  switch (p.type) {
    case 'text':
      return p.content as string || '';

    case 'reasoning':
      return p.content as string || '';

    case 'tool_call':

      return '';

    case 'tool_call_response':

      return '';

    case 'blob':
      return `[Blob: ${toDisplayStr(p.mime_type)}, ${toDisplayStr(p.modality)}]`;

    case 'file':
      return `[File: ${toDisplayStr(p.file_id)}, ${toDisplayStr(p.mime_type)}]`;

    case 'uri':
      return `[URI: ${toDisplayStr(p.uri)}, ${toDisplayStr(p.mime_type)}]`;

    default:

      if (p.content !== undefined) {
        return toDisplayStr(p.content, '');
      }
      if (p.type !== undefined && p.type !== null) {
        return `[${toDisplayStr(p.type)}]`;
      }
      return typeof p === 'object' && p !== null ? JSON.stringify(p) : String(p);
  }
}

function parseChatMessage(msg: unknown): ParsedInputMessage[] {
  if (!msg || typeof msg !== 'object') {
    return [];
  }

  const m = msg as Record<string, unknown>;
  const parts = Array.isArray(m.parts) ? m.parts : [];


  if (parts.length === 0) {
    return [];
  }

  const messages: ParsedInputMessage[] = [];
  const contentParts: string[] = [];


  for (const part of parts) {
    const p = part as Record<string, unknown>;
    if (p.type === 'tool_call') {

      messages.push({
        role: m.role as string || 'assistant',
        content: '',
        name: m.name as string || undefined,
        tool_call_id: p.id as string || undefined,
        tool_call_function_name: p.name as string || undefined,
        tool_call_function_arguments: p.arguments as Record<string, unknown> | undefined
      });
    } else if (p.type === 'tool_call_response') {

      const responseContent = p.response ? JSON.stringify(p.response) : '';
      messages.push({
        role: 'tool',
        content: responseContent,
        name: m.name as string || undefined,
        tool_call_id: p.id as string || undefined
      });
    } else {

      const partContent = extractPartContent(part);
      if (partContent) {
        contentParts.push(partContent);
      }
    }
  }


  if (contentParts.length > 0) {
    messages.push({
      role: m.role as string || 'user',
      content: contentParts.join('\n\n'),
      name: m.name as string || undefined
    });
  }

  return messages;
}


export function parseInputMessages(value: unknown): ParsedInputMessage[] {
  if (!value) {
    return [];
  }


  let parsedValue = value;
  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {

      console.error('Error parsing input messages', e);
      return [];
    }
  }


  if (!Array.isArray(parsedValue)) {
    return [];
  }

  const parsedMessages: ParsedInputMessage[] = [];

  for (const msg of parsedValue) {
    const parsed = parseChatMessage(msg);

    parsedMessages.push(...parsed);
  }

  return parsedMessages;
}

import type { NormalizedSpan } from '@/types/traces';
export function extractInputMessages(
span: NormalizedSpan,
config: CanonicalMessageMatchingConfiguration)
: ExtractedMessage[] {
  const messages: ExtractedMessage[] = [];

  if (!config.inputAttributeKey) {
    return messages;
  }

  const inputValue = getAttributeValue(span.attributes, config.inputAttributeKey);
  if (!inputValue) {
    return messages;
  }

  const parsedMessages = parseInputMessages(inputValue);
  for (const msg of parsedMessages) {
    messages.push({
      type: mapRoleToMessageType(msg.role),
      content: msg.content,
      timestamp: span.startTime,
      spanId: span.spanId,
      name: msg.name,
      tool_call_id: msg.tool_call_id,
      tool_call_function_name: msg.tool_call_function_name,
      tool_call_function_arguments: msg.tool_call_function_arguments
    });
  }

  return messages;
}
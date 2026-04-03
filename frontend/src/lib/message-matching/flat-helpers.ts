import type { SpanAttribute } from '@/types/traces';
import type { NonObjectPrimitive } from '@/lib/utils';
import type { ExtractedMessage } from './shared';

function safeAttrStr(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'string') return v;
  return String(v as NonObjectPrimitive);
}

export function extractContent(value: SpanAttribute['value']): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj.content !== undefined) return safeAttrStr(obj.content);
    if (obj.message !== undefined) return safeAttrStr(obj.message);
    if (obj.text !== undefined) return safeAttrStr(obj.text);
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  return String(value as NonObjectPrimitive);
}

export function addContentWithNewline(message: Partial<ExtractedMessage>, content: string): void {
  message.content = message.content ?
  `${message.content}\n\n${content}` :
  content;
}

export function extractToolCallArguments(value: SpanAttribute['value']): Record<string, unknown> | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return { value };
}
import type { SpanAttribute } from '@/types/traces';
import type { NonObjectPrimitive } from '@/lib/utils';
import type { ExtractedMessage } from '../shared';
import { matchesPattern, extractIndexFromMatch } from './pattern-utils';

function safeAttrStr(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'string') return v;
  return String(v as NonObjectPrimitive);
}

function extractContent(value: SpanAttribute['value']): string {
  if (value === null || value === undefined) {
    return '';
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

function addContentWithNewline(message: Partial<ExtractedMessage>, content: string): void {
  message.content = message.content ?
  `${message.content}\n\n${content}` :
  content;
}

function addContentInline(message: Partial<ExtractedMessage>, content: string): void {
  message.content = message.content ?
  `${message.content}${content}` :
  content;
}

export function handleContentPattern(
contentPattern: string | undefined,
key: string,
value: SpanAttribute['value'],
currentMessage: Partial<ExtractedMessage>,
currentMessageIndex: number | null = null,
rolePattern: string | undefined = undefined)
: boolean {
  if (!contentPattern || !matchesPattern(key, contentPattern)) {
    return false;
  }

  if (currentMessageIndex !== null) {
    const contentIndex = extractIndexFromMatch(key, contentPattern);
    if (contentIndex !== null && currentMessageIndex.toString() !== contentIndex) {
      return false;
    }
  }

  const content = extractContent(value);
  if (content) {
    addContentWithNewline(currentMessage, content);
  }

  return true;
}
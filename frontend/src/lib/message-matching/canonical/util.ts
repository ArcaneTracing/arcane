import type { SpanAttribute } from '@/types/traces';
export function getAttributeValue(attributes: SpanAttribute[], key: string): string | number | boolean | object | null | undefined {
  if (!attributes || !Array.isArray(attributes)) {
    return null;
  }

  const attr = attributes.find((a: SpanAttribute) => a.key === key);
  return attr ? attr.value : null;
}
import type {
  IAnyValue,
  IKeyValue } from
'@opentelemetry/otlp-transformer/build/src/common/internal-types';
import type { SpanAttribute } from '@/types/traces';


export function otlpBase64TraceIdToHexBrowser(b64: string): string {
  const bin = atob(b64);
  let hex = '';
  for (let i = 0; i < bin.length; i++) {
    hex += (bin.codePointAt(i) ?? 0).toString(16).padStart(2, '0');
  }
  return hex;
}
export function isIAnyValue(value: unknown): value is IAnyValue {
  return typeof value === 'object' && value !== null;
}
function isIKeyValue(value: unknown): value is IKeyValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'key' in value &&
    'value' in value);

}

function extractIntValue(intVal: number | string): number {
  return typeof intVal === 'string' ? Number.parseInt(intVal, 10) : intVal;
}

function extractDoubleValue(doubleVal: number | string): number {
  return typeof doubleVal === 'string' ? Number.parseFloat(doubleVal) : doubleVal;
}

function extractArrayValue(av: {values?: unknown[];}): object {
  return (av.values ? av.values.map(extractAttributeValue) : av) as object;
}

function extractKvlistValue(kv: {values?: unknown[];}): object {
  const values = kv.values && Array.isArray(kv.values) ? kv.values : null;
  return values ?
  values.reduce<Record<string, unknown>>((acc, item) => {
    if (!isIKeyValue(item)) return acc;
    acc[item.key] = extractAttributeValue(item.value);
    return acc;
  }, {}) :
  kv as object;
}
export function extractAttributeValue(valueObj: unknown): SpanAttribute['value'] {
  if (!valueObj || typeof valueObj !== 'object') return valueObj as SpanAttribute['value'];
  if (!isIAnyValue(valueObj)) return valueObj as SpanAttribute['value'];

  if (valueObj.stringValue != null) return valueObj.stringValue;
  if (valueObj.intValue != null) return extractIntValue(valueObj.intValue);
  if (valueObj.doubleValue != null) return extractDoubleValue(valueObj.doubleValue);
  if (valueObj.boolValue != null) return valueObj.boolValue;
  if (valueObj.arrayValue != null) return extractArrayValue(valueObj.arrayValue);
  if (valueObj.kvlistValue != null) return extractKvlistValue(valueObj.kvlistValue);

  return valueObj as SpanAttribute['value'];
}
import {
  otlpBase64TraceIdToHexBrowser,
  isIAnyValue,
  extractAttributeValue } from
'../otlp';

describe('otlpBase64TraceIdToHexBrowser', () => {
  it('decodes base64 trace ID to hex string', () => {

    const b64 = btoa('\x61\x62\x63');
    expect(otlpBase64TraceIdToHexBrowser(b64)).toBe('616263');
  });

  it('handles empty string', () => {
    expect(otlpBase64TraceIdToHexBrowser(btoa(''))).toBe('');
  });

  it('produces lowercase hex', () => {
    const b64 = btoa('\x0a\x0b\x0c');
    expect(otlpBase64TraceIdToHexBrowser(b64)).toBe('0a0b0c');
  });
});

describe('isIAnyValue', () => {
  it('returns true for object with OTLP-like shape', () => {
    expect(isIAnyValue({ stringValue: 'x' })).toBe(true);
    expect(isIAnyValue({ intValue: 1 })).toBe(true);
    expect(isIAnyValue({})).toBe(true);
  });

  it('returns false for null', () => {
    expect(isIAnyValue(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isIAnyValue('a')).toBe(false);
    expect(isIAnyValue(1)).toBe(false);
    expect(isIAnyValue(true)).toBe(false);
  });
});

describe('extractAttributeValue', () => {
  it('returns non-object values as-is', () => {
    expect(extractAttributeValue('hello')).toBe('hello');
    expect(extractAttributeValue(42)).toBe(42);
    expect(extractAttributeValue(true)).toBe(true);
    expect(extractAttributeValue(null)).toBe(null);
  });

  it('extracts stringValue', () => {
    expect(extractAttributeValue({ stringValue: 'test' })).toBe('test');
  });

  it('extracts intValue (number)', () => {
    expect(extractAttributeValue({ intValue: 100 })).toBe(100);
  });

  it('extracts intValue (string from JSON)', () => {
    expect(extractAttributeValue({ intValue: '99' })).toBe(99);
  });

  it('extracts doubleValue (number)', () => {
    expect(extractAttributeValue({ doubleValue: 3.14 })).toBe(3.14);
  });

  it('extracts doubleValue (string from JSON)', () => {
    expect(extractAttributeValue({ doubleValue: '2.5' })).toBe(2.5);
  });

  it('extracts boolValue', () => {
    expect(extractAttributeValue({ boolValue: true })).toBe(true);
    expect(extractAttributeValue({ boolValue: false })).toBe(false);
  });

  it('extracts arrayValue (IArrayValue with values)', () => {
    const av = {
      values: [
      { stringValue: 'a' },
      { stringValue: 'b' }]

    };
    expect(extractAttributeValue({ arrayValue: av })).toEqual(['a', 'b']);
  });

  it('extracts kvlistValue (IKeyValueList with values)', () => {
    const kv = {
      values: [
      { key: 'k1', value: { stringValue: 'v1' } },
      { key: 'k2', value: { intValue: 2 } }]

    };
    expect(extractAttributeValue({ kvlistValue: kv })).toEqual({
      k1: 'v1',
      k2: 2
    });
  });

  it('returns object as-is when no recognized OTLP field is set', () => {
    const obj = { stringValue: null };
    expect(extractAttributeValue(obj)).toEqual(obj);
  });

  it('extracts arrayValue with empty values', () => {
    expect(extractAttributeValue({ arrayValue: { values: [] } })).toEqual([]);
  });

  it('extracts arrayValue when values is undefined', () => {
    expect(extractAttributeValue({ arrayValue: {} })).toEqual({});
  });

  it('extracts kvlistValue with empty values', () => {
    expect(extractAttributeValue({ kvlistValue: { values: [] } })).toEqual({});
  });

  it('extracts kvlistValue when values is not array', () => {
    expect(extractAttributeValue({ kvlistValue: {} })).toEqual({});
  });

  it('returns value as-is for undefined', () => {
    expect(extractAttributeValue(undefined)).toBe(undefined);
  });
});
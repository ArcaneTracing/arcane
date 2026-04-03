

const TRACES_SEARCH_KEYS = [
  'datasourceId', 'q', 'attributes', 'start', 'end',
  'lookback', 'min_duration', 'max_duration', 'limit', 'spanName'
] as const;

function toSafeString(value: unknown): string {
  return typeof value === 'object' && value !== null ?
  JSON.stringify(value) :
  String(value);
}

function addParamIfPresent(
search: Record<string, unknown>,
params: Record<string, string>,
key: string)
: void {
  const value = search[key];
  if (value && toSafeString(value).trim()) {
    params[key] = toSafeString(value);
  }
}

export function extractTracesSearchParams(
search: Record<string, unknown>)
: Record<string, string> {
  const searchParams: Record<string, string> = {};
  for (const key of TRACES_SEARCH_KEYS) {
    addParamIfPresent(search, searchParams, key);
  }
  return searchParams;
}
export function hasTracesSearchParams(search: Record<string, unknown>): boolean {
  return !!(
  search.datasourceId ||
  search.q ||
  search.attributes ||
  search.start ||
  search.end ||
  search.lookback ||
  search.min_duration ||
  search.max_duration ||
  search.limit ||
  search.spanName);

}
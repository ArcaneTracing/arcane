import type { SearchMode } from './types';

export interface SearchConfig {
  showQueryEditor: boolean;
  showAttributesFilter: boolean;
  loadAttributeNames: boolean;
  loadAttributeValues: boolean;
}
export function getSearchModeFromConfig(config: SearchConfig): SearchMode {
  if (config.showQueryEditor) return 'query';
  if (config.showAttributesFilter) return 'tag';
  if (config.loadAttributeNames && config.loadAttributeValues) return 'tag-values';
  return 'tag';
}
export function isSearchModeSupported(
  mode: SearchMode,
  config: SearchConfig
): boolean {
  if (mode === 'query') return config.showQueryEditor;
  if (mode === 'tag') return config.showAttributesFilter;
  if (mode === 'tag-values') return config.loadAttributeNames && config.loadAttributeValues;
  if (mode === 'span-name') return config.showAttributesFilter;
  return false;
}
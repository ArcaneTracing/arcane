import {
  getSearchModeFromConfig,
  isSearchModeSupported,
} from '../search-mode'
import type { SearchConfig } from '../search-mode'

const baseConfig: SearchConfig = {
  showQueryEditor: false,
  showAttributesFilter: false,
  loadAttributeNames: false,
  loadAttributeValues: false,
}

describe('getSearchModeFromConfig', () => {
  it('returns query when showQueryEditor is true', () => {
    expect(
      getSearchModeFromConfig({ ...baseConfig, showQueryEditor: true })
    ).toBe('query')
  })

  it('returns tag when showAttributesFilter is true', () => {
    expect(
      getSearchModeFromConfig({ ...baseConfig, showAttributesFilter: true })
    ).toBe('tag')
  })

  it('returns tag-values when loadAttributeNames and loadAttributeValues are true', () => {
    expect(
      getSearchModeFromConfig({
        ...baseConfig,
        loadAttributeNames: true,
        loadAttributeValues: true,
      })
    ).toBe('tag-values')
  })

  it('returns tag as fallback when no capabilities enabled', () => {
    expect(getSearchModeFromConfig(baseConfig)).toBe('tag')
  })

  it('prefers query over tag when both showQueryEditor and showAttributesFilter', () => {
    expect(
      getSearchModeFromConfig({
        ...baseConfig,
        showQueryEditor: true,
        showAttributesFilter: true,
      })
    ).toBe('query')
  })

  it('prefers tag over tag-values when showAttributesFilter and load attrs', () => {
    expect(
      getSearchModeFromConfig({
        ...baseConfig,
        showAttributesFilter: true,
        loadAttributeNames: true,
        loadAttributeValues: true,
      })
    ).toBe('tag')
  })
})

describe('isSearchModeSupported', () => {
  it('returns true for query when showQueryEditor is true', () => {
    expect(
      isSearchModeSupported('query', { ...baseConfig, showQueryEditor: true })
    ).toBe(true)
  })

  it('returns false for query when showQueryEditor is false', () => {
    expect(isSearchModeSupported('query', baseConfig)).toBe(false)
  })

  it('returns true for tag when showAttributesFilter is true', () => {
    expect(
      isSearchModeSupported('tag', { ...baseConfig, showAttributesFilter: true })
    ).toBe(true)
  })

  it('returns false for tag when showAttributesFilter is false', () => {
    expect(isSearchModeSupported('tag', baseConfig)).toBe(false)
  })

  it('returns true for tag-values when both loadAttributeNames and loadAttributeValues', () => {
    expect(
      isSearchModeSupported('tag-values', {
        ...baseConfig,
        loadAttributeNames: true,
        loadAttributeValues: true,
      })
    ).toBe(true)
  })

  it('returns false for tag-values when only loadAttributeNames', () => {
    expect(
      isSearchModeSupported('tag-values', {
        ...baseConfig,
        loadAttributeNames: true,
        loadAttributeValues: false,
      })
    ).toBe(false)
  })

  it('returns false for tag-values when only loadAttributeValues', () => {
    expect(
      isSearchModeSupported('tag-values', {
        ...baseConfig,
        loadAttributeNames: false,
        loadAttributeValues: true,
      })
    ).toBe(false)
  })

  it('returns true for span-name when showAttributesFilter is true', () => {
    expect(
      isSearchModeSupported('span-name', { ...baseConfig, showAttributesFilter: true })
    ).toBe(true)
  })

  it('returns false for span-name when showAttributesFilter is false', () => {
    expect(isSearchModeSupported('span-name', baseConfig)).toBe(false)
  })

  it('returns false for unknown mode', () => {
    expect(
      isSearchModeSupported('unknown' as 'query', baseConfig)
    ).toBe(false)
  })
})

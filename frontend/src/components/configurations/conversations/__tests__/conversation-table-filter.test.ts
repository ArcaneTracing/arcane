import { filterConversationConfigurations } from '../conversation-table-filter'

describe('filterConversationConfigurations', () => {
  const baseItem = {
    id: '1',
    name: 'Test Config',
    description: 'A test configuration',
    stitchingAttributesName: ['attr1', 'attr2'],
    createdAt: new Date('2024-06-15'),
  }

  it('returns true when no query and no date range', () => {
    expect(filterConversationConfigurations(baseItem, '', undefined, undefined)).toBe(true)
  })

  it('returns false when query does not match name, description, or attributes', () => {
    expect(filterConversationConfigurations(baseItem, 'nonexistent', undefined, undefined)).toBe(false)
  })

  it('returns true when query matches name', () => {
    expect(filterConversationConfigurations(baseItem, 'test', undefined, undefined)).toBe(true)
  })

  it('returns true when query matches description', () => {
    expect(filterConversationConfigurations(baseItem, 'configuration', undefined, undefined)).toBe(true)
  })

  it('returns true when query matches stitching attribute', () => {
    expect(filterConversationConfigurations(baseItem, 'attr1', undefined, undefined)).toBe(true)
  })

  it('returns false when config date is before start date', () => {
    expect(
      filterConversationConfigurations(baseItem, '', '2024-07-01', '2024-07-31')
    ).toBe(false)
  })

  it('returns false when config date is after end date', () => {
    expect(
      filterConversationConfigurations(baseItem, '', '2024-05-01', '2024-05-31')
    ).toBe(false)
  })

  it('returns true when config date is within range', () => {
    expect(
      filterConversationConfigurations(baseItem, '', '2024-06-01', '2024-06-30')
    ).toBe(true)
  })

  it('returns true when only startDate and config is on or after', () => {
    expect(filterConversationConfigurations(baseItem, '', '2024-06-15', undefined)).toBe(true)
  })

  it('returns false when only startDate and config is before', () => {
    expect(filterConversationConfigurations(baseItem, '', '2024-06-16', undefined)).toBe(false)
  })

  it('returns true when only endDate and config is on or before', () => {
    expect(filterConversationConfigurations(baseItem, '', undefined, '2024-06-15')).toBe(true)
  })

  it('returns false when only endDate and config is after', () => {
    expect(filterConversationConfigurations(baseItem, '', undefined, '2024-06-14')).toBe(false)
  })

  it('combines search and date filter - fails on date', () => {
    expect(
      filterConversationConfigurations(baseItem, 'test', '2024-07-01', '2024-07-31')
    ).toBe(false)
  })

  it('combines search and date filter - passes both', () => {
    expect(
      filterConversationConfigurations(baseItem, 'test', '2024-06-01', '2024-06-30')
    ).toBe(true)
  })
})

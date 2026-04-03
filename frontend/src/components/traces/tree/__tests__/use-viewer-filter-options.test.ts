import { renderHook } from '@testing-library/react'
import { useViewerFilterOptions } from '../use-viewer-filter-options'
import type { NormalizedSpan } from '@/types/traces'
import { EntityType } from '@/types/enums'
import * as traceQueries from '@/lib/traces/queries'

jest.mock('@/lib/traces/queries')

const mockGetServiceName = traceQueries.getServiceName as jest.MockedFunction<typeof traceQueries.getServiceName>

const createMockSpan = (overrides?: Partial<NormalizedSpan>): NormalizedSpan => ({
  spanId: 'span-1',
  parentSpanId: null,
  name: 'test-span',
  startTime: 1000000,
  endTime: 2000000,
  duration: 1000,
  attributes: [],
  events: [],
  resource: {},
  ...overrides,
})

describe('useViewerFilterOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServiceName.mockReturnValue('unknown')
  })

  it('returns empty arrays when no spans provided', () => {
    const { result } = renderHook(() => useViewerFilterOptions([]))
    expect(result.current.filterOptions.serviceNames).toEqual([])
    expect(result.current.filterOptions.entityIds).toEqual([])
    expect(result.current.entityMap.size).toBe(0)
  })

  it('extracts service names from root spans', () => {
    mockGetServiceName.mockImplementation((resource) => {
      if (resource?.serviceName === 'service1') return 'service1'
      if (resource?.serviceName === 'service2') return 'service2'
      return 'unknown'
    })

    const spans = [
      createMockSpan({ resource: { serviceName: 'service1' } }),
      createMockSpan({ resource: { serviceName: 'service2' } }),
    ]

    const { result } = renderHook(() => useViewerFilterOptions(spans))
    expect(result.current.filterOptions.serviceNames).toEqual(['service1', 'service2'])
  })

  it('extracts entity IDs from root spans', () => {
    const spans = [
      createMockSpan({
        matchedEntity: {
          id: 'entity-1',
          name: 'Entity 1',
          entityType: EntityType.MODEL,
          messageMatching: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      createMockSpan({
        matchedEntity: {
          id: 'entity-2',
          name: 'Entity 2',
          entityType: EntityType.TOOL,
          messageMatching: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    ]

    const { result } = renderHook(() => useViewerFilterOptions(spans))
    expect(result.current.filterOptions.entityIds).toContain('entity-1')
    expect(result.current.filterOptions.entityIds).toContain('entity-2')
    expect(result.current.entityMap.get('entity-1')).toBe('Entity 1')
    expect(result.current.entityMap.get('entity-2')).toBe('Entity 2')
  })

  it('recursively extracts from nested children', () => {
    mockGetServiceName.mockImplementation((resource) => {
      if (resource?.serviceName === 'parent-service') return 'parent-service'
      if (resource?.serviceName === 'child-service') return 'child-service'
      return 'unknown'
    })

    const childSpan = createMockSpan({
      spanId: 'child',
      name: 'child-span',
      resource: { serviceName: 'child-service' },
      matchedEntity: {
        id: 'child-entity',
        name: 'Child Entity',
        entityType: EntityType.MODEL,
        messageMatching: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    const parentSpan = createMockSpan({
      spanId: 'parent',
      name: 'parent-span',
      resource: { serviceName: 'parent-service' },
      children: [childSpan],
    })

    const { result } = renderHook(() => useViewerFilterOptions([parentSpan]))
    expect(result.current.filterOptions.serviceNames).toContain('parent-service')
    expect(result.current.filterOptions.serviceNames).toContain('child-service')
    expect(result.current.filterOptions.entityIds).toContain('child-entity')
    expect(result.current.entityMap.get('child-entity')).toBe('Child Entity')
  })

  it('filters out unknown service names', () => {
    mockGetServiceName.mockReturnValue('unknown')

    const spans = [
      createMockSpan({ resource: { serviceName: 'service1' } }),
      createMockSpan({ resource: {} }),
    ]

    const { result } = renderHook(() => useViewerFilterOptions(spans))
    expect(result.current.filterOptions.serviceNames).toEqual([])
  })

  it('handles spans without matchedEntity', () => {
    const spans = [
      createMockSpan({ matchedEntity: null }),
      createMockSpan({
        matchedEntity: {
          id: 'entity-1',
          name: 'Entity 1',
          entityType: EntityType.MODEL,
          messageMatching: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    ]

    const { result } = renderHook(() => useViewerFilterOptions(spans))
    expect(result.current.filterOptions.entityIds).toEqual(['entity-1'])
    expect(result.current.entityMap.size).toBe(1)
  })

  it('sorts service names alphabetically', () => {
    mockGetServiceName.mockImplementation((resource) => {
      if (resource?.serviceName === 'zebra') return 'zebra'
      if (resource?.serviceName === 'alpha') return 'alpha'
      if (resource?.serviceName === 'beta') return 'beta'
      return 'unknown'
    })

    const spans = [
      createMockSpan({ resource: { serviceName: 'zebra' } }),
      createMockSpan({ resource: { serviceName: 'alpha' } }),
      createMockSpan({ resource: { serviceName: 'beta' } }),
    ]

    const { result } = renderHook(() => useViewerFilterOptions(spans))
    expect(result.current.filterOptions.serviceNames).toEqual(['alpha', 'beta', 'zebra'])
  })

  it('deduplicates service names', () => {
    mockGetServiceName.mockReturnValue('service1')

    const spans = [
      createMockSpan({ resource: { serviceName: 'service1' } }),
      createMockSpan({ resource: { serviceName: 'service1' } }),
      createMockSpan({ resource: { serviceName: 'service1' } }),
    ]

    const { result } = renderHook(() => useViewerFilterOptions(spans))
    expect(result.current.filterOptions.serviceNames).toEqual(['service1'])
  })

  it('deduplicates entity IDs', () => {
    const entity = {
      id: 'entity-1',
      name: 'Entity 1',
      entityType: EntityType.MODEL,
      messageMatching: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const spans = [
      createMockSpan({ matchedEntity: entity }),
      createMockSpan({ matchedEntity: entity }),
      createMockSpan({ matchedEntity: entity }),
    ]

    const { result } = renderHook(() => useViewerFilterOptions(spans))
    expect(result.current.filterOptions.entityIds).toEqual(['entity-1'])
    expect(result.current.entityMap.size).toBe(1)
  })
})

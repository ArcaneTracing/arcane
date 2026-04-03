import { renderHook, act } from '@testing-library/react'
import { useViewerFilters } from '../use-viewer-filters'
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

describe('useViewerFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServiceName.mockReturnValue('unknown')
  })

  describe('search filter', () => {
    it('filters spans by name', () => {
      const spans = [
        createMockSpan({ spanId: 's1', name: 'http-handler' }),
        createMockSpan({ spanId: 's2', name: 'db-query' }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setSearchQuery('http')
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].name).toBe('http-handler')
    })

    it('filters spans by spanId', () => {
      const spans = [
        createMockSpan({ spanId: 'span-abc', name: 'op1' }),
        createMockSpan({ spanId: 'span-xyz', name: 'op2' }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setSearchQuery('abc')
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].spanId).toBe('span-abc')
    })

    it('includes parent when child matches search', () => {
      const childSpan = createMockSpan({ spanId: 'child', name: 'nested-db-call', parentSpanId: 'parent' })
      const parentSpan = createMockSpan({ spanId: 'parent', name: 'root-op', children: [childSpan] })

      const { result } = renderHook(() => useViewerFilters([parentSpan]))
      
      act(() => {
        result.current.setSearchQuery('db')
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].name).toBe('root-op')
      expect(result.current.filteredSpanTree[0].children?.[0].name).toBe('nested-db-call')
    })

    it('returns all spans when search is empty', () => {
      const spans = [
        createMockSpan({ spanId: 's1', name: 'span1' }),
        createMockSpan({ spanId: 's2', name: 'span2' }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      expect(result.current.filteredSpanTree.length).toBe(2)
    })

    it('is case insensitive', () => {
      const spans = [
        createMockSpan({ spanId: 's1', name: 'HTTP-Handler' }),
        createMockSpan({ spanId: 's2', name: 'db-query' }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setSearchQuery('http')
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].name).toBe('HTTP-Handler')
    })
  })

  describe('service name filter', () => {
    it('filters spans by service name', () => {
      mockGetServiceName.mockImplementation((resource) => {
        if (resource?.serviceName === 'service1') return 'service1'
        if (resource?.serviceName === 'service2') return 'service2'
        return 'unknown'
      })

      const spans = [
        createMockSpan({ spanId: 's1', resource: { serviceName: 'service1' } }),
        createMockSpan({ spanId: 's2', resource: { serviceName: 'service2' } }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setFilters({ serviceName: 'service1', entityId: '', showOnlyEntitySpans: false })
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].spanId).toBe('s1')
    })

    it('shows all spans when service filter is empty', () => {
      mockGetServiceName.mockReturnValue('service1')

      const spans = [
        createMockSpan({ spanId: 's1', resource: { serviceName: 'service1' } }),
        createMockSpan({ spanId: 's2', resource: { serviceName: 'service1' } }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setFilters({ serviceName: '', entityId: '', showOnlyEntitySpans: false })
      })

      expect(result.current.filteredSpanTree.length).toBe(2)
    })

    it('includes parent when child matches service filter', () => {
      mockGetServiceName.mockImplementation((resource) => {
        if (resource?.serviceName === 'parent-service') return 'parent-service'
        if (resource?.serviceName === 'child-service') return 'child-service'
        return 'unknown'
      })

      const childSpan = createMockSpan({
        spanId: 'child',
        resource: { serviceName: 'child-service' },
        parentSpanId: 'parent',
      })
      const parentSpan = createMockSpan({
        spanId: 'parent',
        resource: { serviceName: 'parent-service' },
        children: [childSpan],
      })

      const { result } = renderHook(() => useViewerFilters([parentSpan]))
      
      act(() => {
        result.current.setFilters({ serviceName: 'child-service', entityId: '', showOnlyEntitySpans: false })
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].children?.[0].spanId).toBe('child')
    })
  })

  describe('entity ID filter', () => {
    const entity1 = {
      id: 'entity-1',
      name: 'Entity 1',
      entityType: EntityType.MODEL,
      messageMatching: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const entity2 = {
      id: 'entity-2',
      name: 'Entity 2',
      entityType: EntityType.TOOL,
      messageMatching: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('filters spans by entity ID', () => {
      const spans = [
        createMockSpan({ spanId: 's1', matchedEntity: entity1 }),
        createMockSpan({ spanId: 's2', matchedEntity: entity2 }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setFilters({ serviceName: '', entityId: 'entity-1', showOnlyEntitySpans: false })
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].spanId).toBe('s1')
    })

    it('shows all spans when entity filter is empty', () => {
      const spans = [
        createMockSpan({ spanId: 's1', matchedEntity: entity1 }),
        createMockSpan({ spanId: 's2', matchedEntity: entity2 }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setFilters({ serviceName: '', entityId: '', showOnlyEntitySpans: false })
      })

      expect(result.current.filteredSpanTree.length).toBe(2)
    })

    it('excludes non-matching root and promotes matching child when filtering by entity', () => {
      const childSpan = createMockSpan({
        spanId: 'child',
        matchedEntity: entity1,
        parentSpanId: 'parent',
      })
      const parentSpan = createMockSpan({
        spanId: 'parent',
        matchedEntity: null,
        children: [childSpan],
      })

      const { result } = renderHook(() => useViewerFilters([parentSpan]))
      
      act(() => {
        result.current.setFilters({ serviceName: '', entityId: 'entity-1', showOnlyEntitySpans: false })
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].spanId).toBe('child')
      expect(result.current.filteredSpanTree[0].matchedEntity?.id).toBe('entity-1')
    })
  })

  describe('showOnlyEntitySpans filter', () => {
    const entity = {
      id: 'entity-1',
      name: 'Entity 1',
      entityType: EntityType.MODEL,
      messageMatching: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('filters out spans without matchedEntity', () => {
      const spans = [
        createMockSpan({ spanId: 's1', matchedEntity: null }),
        createMockSpan({ spanId: 's2', matchedEntity: entity }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setFilters({ serviceName: '', entityId: '', showOnlyEntitySpans: true })
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].spanId).toBe('s2')
    })

    it('promotes children with entities when parent is filtered out', () => {
      const childSpan = createMockSpan({
        spanId: 'child',
        matchedEntity: entity,
        parentSpanId: 'parent',
      })
      const parentSpan = createMockSpan({
        spanId: 'parent',
        matchedEntity: null,
        children: [childSpan],
      })

      const { result } = renderHook(() => useViewerFilters([parentSpan]))
      
      act(() => {
        result.current.setFilters({ serviceName: '', entityId: '', showOnlyEntitySpans: true })
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].spanId).toBe('child')
      expect(result.current.filteredSpanTree[0].matchedEntity).toEqual(entity)
    })

    it('keeps spans with matchedEntity and their children', () => {
      const grandchildSpan = createMockSpan({
        spanId: 'grandchild',
        matchedEntity: entity,
        parentSpanId: 'child',
      })
      const childSpan = createMockSpan({
        spanId: 'child',
        matchedEntity: null,
        parentSpanId: 'parent',
        children: [grandchildSpan],
      })
      const parentSpan = createMockSpan({
        spanId: 'parent',
        matchedEntity: entity,
        children: [childSpan],
      })

      const { result } = renderHook(() => useViewerFilters([parentSpan]))
      
      act(() => {
        result.current.setFilters({ serviceName: '', entityId: '', showOnlyEntitySpans: true })
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].spanId).toBe('parent')
      expect(result.current.filteredSpanTree[0].children?.[0].spanId).toBe('grandchild')
    })

    it('shows all spans when showOnlyEntitySpans is false', () => {
      const spans = [
        createMockSpan({ spanId: 's1', matchedEntity: null }),
        createMockSpan({ spanId: 's2', matchedEntity: entity }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setFilters({ serviceName: '', entityId: '', showOnlyEntitySpans: false })
      })

      expect(result.current.filteredSpanTree.length).toBe(2)
    })
  })

  describe('combined filters', () => {
    const entity = {
      id: 'entity-1',
      name: 'Entity 1',
      entityType: EntityType.MODEL,
      messageMatching: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('combines search and service filters', () => {
      mockGetServiceName.mockImplementation((resource) => {
        if (resource?.serviceName === 'service1') return 'service1'
        if (resource?.serviceName === 'service2') return 'service2'
        return 'unknown'
      })

      const spans = [
        createMockSpan({ spanId: 's1', name: 'http-handler', resource: { serviceName: 'service1' } }),
        createMockSpan({ spanId: 's2', name: 'http-handler', resource: { serviceName: 'service2' } }),
        createMockSpan({ spanId: 's3', name: 'db-query', resource: { serviceName: 'service1' } }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setSearchQuery('http')
        result.current.setFilters({ serviceName: 'service1', entityId: '', showOnlyEntitySpans: false })
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].spanId).toBe('s1')
    })

    it('combines all filters together', () => {
      mockGetServiceName.mockReturnValue('service1')

      const spans = [
        createMockSpan({
          spanId: 's1',
          name: 'span1',
          resource: { serviceName: 'service1' },
          matchedEntity: entity,
        }),
        createMockSpan({
          spanId: 's2',
          name: 'span2',
          resource: { serviceName: 'service1' },
          matchedEntity: null,
        }),
      ]

      const { result } = renderHook(() => useViewerFilters(spans))
      
      act(() => {
        result.current.setSearchQuery('span1')
        result.current.setFilters({ serviceName: 'service1', entityId: 'entity-1', showOnlyEntitySpans: true })
      })

      expect(result.current.filteredSpanTree.length).toBe(1)
      expect(result.current.filteredSpanTree[0].spanId).toBe('s1')
    })
  })
})

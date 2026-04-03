import { renderHook, act } from '@testing-library/react'
import { useEntityForm } from '../use-entity-form'
import { EntityType, MatchPatternType } from '@/types/enums'
import type { EntityResponse } from '@/types/entities'

describe('useEntityForm', () => {
  it('returns initial form state when no entity', () => {
    const { result } = renderHook(() => useEntityForm(null, false))
    expect(result.current.formData.entityType).toBe(EntityType.MODEL)
    expect(result.current.formData.name).toBe('')
    expect(result.current.currentStep).toBe(1)
  })

  it('populates form when entity provided and open', () => {
    const entity: EntityResponse = {
      id: 'e1',
      name: 'Test Entity',
      description: 'Desc',
      type: EntityType.MODEL,
      entityType: EntityType.MODEL,
      matchingAttributeName: 'attr',
      matchingPatternType: MatchPatternType.VALUE,
      matchingValue: 'val',
      matchingPattern: null,
      entityHighlights: [],
      messageMatching: {
        type: 'canonical',
        canonicalMessageMatchingConfiguration: {
          inputAttributeKey: 'in',
          outputAttributeKey: 'out',
        },
        flatMessageMatchingConfiguration: null,
      },
      iconId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as EntityResponse

    const { result } = renderHook(() => useEntityForm(entity, true))
    expect(result.current.formData.name).toBe('Test Entity')
    expect(result.current.formData.attributeName).toBe('attr')
  })

  it('handleNext advances step when validation passes', () => {
    const { result } = renderHook(() => useEntityForm(null, true))
    act(() => {
      result.current.handleFieldChange('name', 'Test')
    })
    act(() => {
      result.current.handleNext()
    })
    expect(result.current.currentStep).toBe(2)
  })

  it('handlePrevious goes back', () => {
    const { result } = renderHook(() => useEntityForm(null, true))
    act(() => {
      result.current.handleFieldChange('name', 'Test')
    })
    act(() => {
      result.current.handleNext()
    })
    act(() => {
      result.current.handlePrevious()
    })
    expect(result.current.currentStep).toBe(1)
  })
})

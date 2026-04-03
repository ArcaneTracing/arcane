import {
  validateMatching,
  validateHighlights,
  validateMessageMatching,
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateEntityFormStep,
} from '../use-entity-form-validation'
import { EntityType, MatchPatternType, MessageMatchingType } from '@/types/enums'
import type { FormData } from '../use-entity-form'

const CUSTOM_ENTITY_STEP = 'Custom Entity'
const MESSAGE_MATCHING_STEP = 'Message Matching'

describe('validateMatching', () => {
  it('returns false when attributeName is empty', () => {
    const result = validateMatching({
      attributeName: '',
      matchPatternType: MatchPatternType.VALUE,
      matchValue: 'value',
    })
    expect(result).toBe(false)
  })

  it('returns false when attributeName is whitespace only', () => {
    const result = validateMatching({
      attributeName: '   ',
      matchPatternType: MatchPatternType.VALUE,
      matchValue: 'value',
    })
    expect(result).toBe(false)
  })

  it('returns false when matchPatternType is REGEX and matchPatttern is empty', () => {
    const result = validateMatching({
      attributeName: 'attr',
      matchPatternType: MatchPatternType.REGEX,
      matchPatttern: '',
      matchValue: 'value',
    })
    expect(result).toBe(false)
  })

  it('returns false when matchPatternType is REGEX and matchPatttern is undefined', () => {
    const result = validateMatching({
      attributeName: 'attr',
      matchPatternType: MatchPatternType.REGEX,
      matchValue: 'value',
    })
    expect(result).toBe(false)
  })

  it('returns true when matchPatternType is REGEX and matchPatttern is provided', () => {
    const result = validateMatching({
      attributeName: 'attr',
      matchPatternType: MatchPatternType.REGEX,
      matchPatttern: '.*',
      matchValue: 'value',
    })
    expect(result).toBe(true)
  })

  it('returns false when matchPatternType is VALUE and matchValue is empty', () => {
    const result = validateMatching({
      attributeName: 'attr',
      matchPatternType: MatchPatternType.VALUE,
      matchValue: '',
    })
    expect(result).toBe(false)
  })

  it('returns true when matchPatternType is VALUE and matchValue is provided', () => {
    const result = validateMatching({
      attributeName: 'attr',
      matchPatternType: MatchPatternType.VALUE,
      matchValue: 'value',
    })
    expect(result).toBe(true)
  })
})

describe('validateHighlights', () => {
  it('returns false when highlights array is empty', () => {
    const result = validateHighlights({ entityHighlights: [] })
    expect(result).toBe(false)
  })

  it('returns false when all highlights have empty title', () => {
    const result = validateHighlights({
      entityHighlights: [{ title: '', key: 'key1', valueType: 'STRING' }],
    })
    expect(result).toBe(false)
  })

  it('returns false when all highlights have empty key', () => {
    const result = validateHighlights({
      entityHighlights: [{ title: 'Title', key: '', valueType: 'STRING' }],
    })
    expect(result).toBe(false)
  })

  it('returns false when all highlights have whitespace-only title', () => {
    const result = validateHighlights({
      entityHighlights: [{ title: '   ', key: 'key1', valueType: 'STRING' }],
    })
    expect(result).toBe(false)
  })

  it('returns true when at least one highlight has both title and key', () => {
    const result = validateHighlights({
      entityHighlights: [
        { title: '', key: '', valueType: 'STRING' },
        { title: 'Title', key: 'key1', valueType: 'STRING' },
      ],
    })
    expect(result).toBe(true)
  })

  it('returns true when highlight has trimmed title and key', () => {
    const result = validateHighlights({
      entityHighlights: [{ title: '  Title  ', key: '  key1  ', valueType: 'STRING' }],
    })
    expect(result).toBe(true)
  })
})

describe('validateMessageMatching', () => {
  it('returns false when type is CANONICAL and configuration is missing', () => {
    const result = validateMessageMatching({
      messageMatching: {
        type: MessageMatchingType.CANONICAL,
        canonicalMessageMatchingConfiguration: undefined as never,
        flatMessageMatchingConfiguration: {
          flatInputMessageMatchingKeys: {},
          flatOutputMessageMatchingKeys: {},
        },
      },
    })
    expect(result).toBe(false)
  })

  it('returns false when type is CANONICAL and inputAttributeKey is missing', () => {
    const result = validateMessageMatching({
      messageMatching: {
        type: MessageMatchingType.CANONICAL,
        canonicalMessageMatchingConfiguration: {
          inputAttributeKey: '',
          outputAttributeKey: 'output',
        },
        flatMessageMatchingConfiguration: {
          flatInputMessageMatchingKeys: {},
          flatOutputMessageMatchingKeys: {},
        },
      },
    })
    expect(result).toBe(false)
  })

  it('returns false when type is CANONICAL and outputAttributeKey is missing', () => {
    const result = validateMessageMatching({
      messageMatching: {
        type: MessageMatchingType.CANONICAL,
        canonicalMessageMatchingConfiguration: {
          inputAttributeKey: 'input',
          outputAttributeKey: '',
        },
        flatMessageMatchingConfiguration: {
          flatInputMessageMatchingKeys: {},
          flatOutputMessageMatchingKeys: {},
        },
      },
    })
    expect(result).toBe(false)
  })

  it('returns false when type is CANONICAL and both keys are whitespace only', () => {
    const result = validateMessageMatching({
      messageMatching: {
        type: MessageMatchingType.CANONICAL,
        canonicalMessageMatchingConfiguration: {
          inputAttributeKey: '   ',
          outputAttributeKey: '   ',
        },
        flatMessageMatchingConfiguration: {
          flatInputMessageMatchingKeys: {},
          flatOutputMessageMatchingKeys: {},
        },
      },
    })
    expect(result).toBe(false)
  })

  it('returns true when type is CANONICAL and both keys are provided', () => {
    const result = validateMessageMatching({
      messageMatching: {
        type: MessageMatchingType.CANONICAL,
        canonicalMessageMatchingConfiguration: {
          inputAttributeKey: 'input',
          outputAttributeKey: 'output',
        },
        flatMessageMatchingConfiguration: {
          flatInputMessageMatchingKeys: {},
          flatOutputMessageMatchingKeys: {},
        },
      },
    })
    expect(result).toBe(true)
  })

  it('returns true when type is FLAT (optional)', () => {
    const result = validateMessageMatching({
      messageMatching: {
        type: MessageMatchingType.FLAT,
        canonicalMessageMatchingConfiguration: {
          inputAttributeKey: '',
          outputAttributeKey: '',
        },
        flatMessageMatchingConfiguration: {
          flatInputMessageMatchingKeys: {},
          flatOutputMessageMatchingKeys: {},
        },
      },
    })
    expect(result).toBe(true)
  })
})

describe('validateStep1', () => {
  it('returns false when stepName is CUSTOM_ENTITY_STEP and customType is missing', () => {
    const result = validateStep1({
      stepName: CUSTOM_ENTITY_STEP,
      formData: {
        name: 'Test',
        customType: undefined,
        iconId: 'icon1',
      } as FormData,
    })
    expect(result).toBe(false)
  })

  it('returns false when stepName is CUSTOM_ENTITY_STEP and iconId is missing', () => {
    const result = validateStep1({
      stepName: CUSTOM_ENTITY_STEP,
      formData: {
        name: 'Test',
        customType: 'type1',
        iconId: undefined,
      } as FormData,
    })
    expect(result).toBe(false)
  })

  it('returns false when stepName is CUSTOM_ENTITY_STEP and customType is empty', () => {
    const result = validateStep1({
      stepName: CUSTOM_ENTITY_STEP,
      formData: {
        name: 'Test',
        customType: '',
        iconId: 'icon1',
      } as FormData,
    })
    expect(result).toBe(false)
  })

  it('returns true when stepName is CUSTOM_ENTITY_STEP and both are provided', () => {
    const result = validateStep1({
      stepName: CUSTOM_ENTITY_STEP,
      formData: {
        name: 'Test',
        customType: 'type1',
        iconId: 'icon1',
      } as FormData,
    })
    expect(result).toBe(true)
  })

  it('returns false when stepName is not CUSTOM_ENTITY_STEP and name is empty', () => {
    const result = validateStep1({
      stepName: 'Basic Info',
      formData: {
        name: '',
      } as FormData,
    })
    expect(result).toBe(false)
  })

  it('returns true when stepName is not CUSTOM_ENTITY_STEP and name is provided', () => {
    const result = validateStep1({
      stepName: 'Basic Info',
      formData: {
        name: 'Test',
      } as FormData,
    })
    expect(result).toBe(true)
  })
})

describe('validateStep2', () => {
  it('returns false when entityType is CUSTOM and name is empty', () => {
    const result = validateStep2({
      entityType: EntityType.CUSTOM,
      formData: {
        name: '',
        attributeName: 'attr',
        matchPatternType: MatchPatternType.VALUE,
        matchValue: 'value',
      } as FormData,
    })
    expect(result).toBe(false)
  })

  it('returns true when entityType is CUSTOM and name is provided', () => {
    const result = validateStep2({
      entityType: EntityType.CUSTOM,
      formData: {
        name: 'Test',
        attributeName: 'attr',
        matchPatternType: MatchPatternType.VALUE,
        matchValue: 'value',
      } as FormData,
    })
    expect(result).toBe(true)
  })

  it('validates matching when entityType is not CUSTOM', () => {
    const result = validateStep2({
      entityType: EntityType.MODEL,
      formData: {
        name: 'Test',
        attributeName: '',
        matchPatternType: MatchPatternType.VALUE,
        matchValue: 'value',
      } as FormData,
    })
    expect(result).toBe(false)
  })
})

describe('validateStep3', () => {
  it('validates matching when entityType is CUSTOM', () => {
    const result = validateStep3({
      entityType: EntityType.CUSTOM,
      formData: {
        attributeName: '',
        matchPatternType: MatchPatternType.VALUE,
        matchValue: 'value',
      } as FormData,
    })
    expect(result).toBe(false)
  })

  it('validates highlights when entityType is not CUSTOM', () => {
    const result = validateStep3({
      entityType: EntityType.MODEL,
      formData: {
        entityHighlights: [],
      } as FormData,
    })
    expect(result).toBe(false)
  })

  it('returns true when entityType is not CUSTOM and highlights are valid', () => {
    const result = validateStep3({
      entityType: EntityType.MODEL,
      formData: {
        entityHighlights: [{ title: 'Title', key: 'key1', valueType: 'STRING' }],
      } as FormData,
    })
    expect(result).toBe(true)
  })
})

describe('validateStep4', () => {
  it('validates highlights when entityType is CUSTOM', () => {
    const result = validateStep4({
      stepName: 'Highlights',
      entityType: EntityType.CUSTOM,
      formData: {
        entityHighlights: [],
      } as FormData,
    })
    expect(result).toBe(false)
  })

  it('validates message matching when stepName is MESSAGE_MATCHING_STEP and entityType is MODEL', () => {
    const result = validateStep4({
      stepName: MESSAGE_MATCHING_STEP,
      entityType: EntityType.MODEL,
      formData: {
        messageMatching: {
          type: MessageMatchingType.CANONICAL,
          canonicalMessageMatchingConfiguration: {
            inputAttributeKey: '',
            outputAttributeKey: 'output',
          },
          flatMessageMatchingConfiguration: {
            flatInputMessageMatchingKeys: {},
            flatOutputMessageMatchingKeys: {},
          },
        },
      } as FormData,
    })
    expect(result).toBe(false)
  })

  it('returns true when stepName is not MESSAGE_MATCHING_STEP', () => {
    const result = validateStep4({
      stepName: 'Highlights',
      entityType: EntityType.MODEL,
      formData: {} as FormData,
    })
    expect(result).toBe(true)
  })
})

describe('validateStep5', () => {
  it('validates message matching when stepName is MESSAGE_MATCHING_STEP and entityType is MODEL', () => {
    const result = validateStep5({
      stepName: MESSAGE_MATCHING_STEP,
      entityType: EntityType.MODEL,
      formData: {
        messageMatching: {
          type: MessageMatchingType.CANONICAL,
          canonicalMessageMatchingConfiguration: {
            inputAttributeKey: 'input',
            outputAttributeKey: 'output',
          },
          flatMessageMatchingConfiguration: {
            flatInputMessageMatchingKeys: {},
            flatOutputMessageMatchingKeys: {},
          },
        },
      } as FormData,
    })
    expect(result).toBe(true)
  })

  it('returns true when stepName is not MESSAGE_MATCHING_STEP', () => {
    const result = validateStep5({
      stepName: 'Other',
      entityType: EntityType.MODEL,
      formData: {} as FormData,
    })
    expect(result).toBe(true)
  })

  it('returns true when entityType is not MODEL', () => {
    const result = validateStep5({
      stepName: MESSAGE_MATCHING_STEP,
      entityType: EntityType.CUSTOM,
      formData: {} as FormData,
    })
    expect(result).toBe(true)
  })
})

describe('validateEntityFormStep', () => {
  it('calls validateStep1 for step 1', () => {
    const result = validateEntityFormStep({
      step: 1,
      stepName: 'Basic Info',
      formData: { name: 'Test' } as FormData,
    })
    expect(result).toBe(true)
  })

  it('calls validateStep2 for step 2', () => {
    const result = validateEntityFormStep({
      step: 2,
      stepName: 'Matching',
      formData: {
        entityType: EntityType.MODEL,
        attributeName: 'attr',
        matchPatternType: MatchPatternType.VALUE,
        matchValue: 'value',
      } as FormData,
    })
    expect(result).toBe(true)
  })

  it('calls validateStep3 for step 3', () => {
    const result = validateEntityFormStep({
      step: 3,
      stepName: 'Highlights',
      formData: {
        entityType: EntityType.MODEL,
        entityHighlights: [{ title: 'Title', key: 'key1', valueType: 'STRING' }],
      } as FormData,
    })
    expect(result).toBe(true)
  })

  it('calls validateStep4 for step 4', () => {
    const result = validateEntityFormStep({
      step: 4,
      stepName: 'Highlights',
      formData: {
        entityType: EntityType.CUSTOM,
        entityHighlights: [{ title: 'Title', key: 'key1', valueType: 'STRING' }],
      } as FormData,
    })
    expect(result).toBe(true)
  })

  it('calls validateStep5 for step 5', () => {
    const result = validateEntityFormStep({
      step: 5,
      stepName: MESSAGE_MATCHING_STEP,
      formData: {
        entityType: EntityType.MODEL,
        messageMatching: {
          type: MessageMatchingType.FLAT,
          canonicalMessageMatchingConfiguration: {
            inputAttributeKey: '',
            outputAttributeKey: '',
          },
          flatMessageMatchingConfiguration: {
            flatInputMessageMatchingKeys: {},
            flatOutputMessageMatchingKeys: {},
          },
        },
      } as FormData,
    })
    expect(result).toBe(true)
  })

  it('returns true for default case', () => {
    const result = validateEntityFormStep({
      step: 99,
      stepName: 'Unknown',
      formData: {} as FormData,
    })
    expect(result).toBe(true)
  })
})

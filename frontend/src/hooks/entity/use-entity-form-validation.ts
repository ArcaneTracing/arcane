import { EntityType, MatchPatternType, MessageMatchingType } from '@/types/enums'
import type { FormData } from './use-entity-form'
import type { Highlight } from '@/types/entities'

const CUSTOM_ENTITY_STEP = 'Custom Entity'
const MESSAGE_MATCHING_STEP = 'Message Matching'

type ValidateMatchingParams = {
  attributeName: string
  matchPatternType: MatchPatternType
  matchPatttern?: string
  matchValue: string
}

export function validateMatching({
  attributeName,
  matchPatternType,
  matchPatttern,
  matchValue,
}: ValidateMatchingParams): boolean {
  if (!attributeName.trim()) return false
  if (matchPatternType === MatchPatternType.REGEX) {
    return !!matchPatttern?.trim()
  }
  return !!matchValue.trim()
}

type ValidateHighlightsParams = {
  entityHighlights: Highlight[]
}

export function validateHighlights({ entityHighlights }: ValidateHighlightsParams): boolean {
  return entityHighlights.some(
    (highlight) => highlight.title.trim().length > 0 && highlight.key.trim().length > 0
  )
}

type ValidateMessageMatchingParams = {
  messageMatching: FormData['messageMatching']
}

export function validateMessageMatching({
  messageMatching,
}: ValidateMessageMatchingParams): boolean {
  if (messageMatching.type === MessageMatchingType.CANONICAL) {
    const { canonicalMessageMatchingConfiguration } = messageMatching
    if (!canonicalMessageMatchingConfiguration) {
      return false
    }
    return (
      !!canonicalMessageMatchingConfiguration.inputAttributeKey?.trim() &&
      !!canonicalMessageMatchingConfiguration.outputAttributeKey?.trim()
    )
  }
  return true
}

type ValidateStep1Params = {
  stepName: string
  formData: FormData
}

export function validateStep1({ stepName, formData }: ValidateStep1Params): boolean {
  if (stepName === CUSTOM_ENTITY_STEP) {
    return !!(formData.customType?.trim() && formData.iconId)
  }
  return !!formData.name.trim()
}

type ValidateStep2Params = {
  entityType: EntityType
  formData: FormData
}

export function validateStep2({ entityType, formData }: ValidateStep2Params): boolean {
  if (entityType === EntityType.CUSTOM) {
    return !!formData.name.trim()
  }
  return validateMatching({
    attributeName: formData.attributeName,
    matchPatternType: formData.matchPatternType,
    matchPatttern: formData.matchPatttern,
    matchValue: formData.matchValue,
  })
}

type ValidateStep3Params = {
  entityType: EntityType
  formData: FormData
}

export function validateStep3({ entityType, formData }: ValidateStep3Params): boolean {
  if (entityType === EntityType.CUSTOM) {
    return validateMatching({
      attributeName: formData.attributeName,
      matchPatternType: formData.matchPatternType,
      matchPatttern: formData.matchPatttern,
      matchValue: formData.matchValue,
    })
  }
  return validateHighlights({ entityHighlights: formData.entityHighlights })
}

type ValidateStep4Params = {
  stepName: string
  entityType: EntityType
  formData: FormData
}

export function validateStep4({ stepName, entityType, formData }: ValidateStep4Params): boolean {
  if (entityType === EntityType.CUSTOM) {
    return validateHighlights({ entityHighlights: formData.entityHighlights })
  }
  if (stepName === MESSAGE_MATCHING_STEP && entityType === EntityType.MODEL) {
    return validateMessageMatching({ messageMatching: formData.messageMatching })
  }
  return true
}

type ValidateStep5Params = {
  stepName: string
  entityType: EntityType
  formData: FormData
}

export function validateStep5({ stepName, entityType, formData }: ValidateStep5Params): boolean {
  if (stepName === MESSAGE_MATCHING_STEP && entityType === EntityType.MODEL) {
    return validateMessageMatching({ messageMatching: formData.messageMatching })
  }
  return true
}

type ValidateStepParams = {
  step: number
  stepName: string
  formData: FormData
}

export function validateEntityFormStep({ step, stepName, formData }: ValidateStepParams): boolean {
  switch (step) {
    case 1:
      return validateStep1({ stepName, formData })
    case 2:
      return validateStep2({ entityType: formData.entityType, formData })
    case 3:
      return validateStep3({ entityType: formData.entityType, formData })
    case 4:
      return validateStep4({ stepName, entityType: formData.entityType, formData })
    case 5:
      return validateStep5({ stepName, entityType: formData.entityType, formData })
    default:
      return true
  }
}

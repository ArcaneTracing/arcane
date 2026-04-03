import { EntityResponse, MessageMatchingType } from '@/types'
import type { ExtractedMessage } from './shared'
import { extractCanonicalMessagesFromSpan } from './canonical-extraction'
import { extractFlatMessagesFromSingleSpan } from './flat-extraction'
import type { NormalizedSpan } from '@/types/traces'

export function extractMessagesFromSpan(
  span: NormalizedSpan,
  entity: EntityResponse | null | undefined
): ExtractedMessage[] {
  if (!entity?.messageMatching || !span) {
    return []
  }

  const { messageMatching } = entity

  if (messageMatching.type === MessageMatchingType.CANONICAL && messageMatching.canonicalMessageMatchingConfiguration) {
    return extractCanonicalMessagesFromSpan(span, messageMatching.canonicalMessageMatchingConfiguration)
  }

  if (messageMatching.type === MessageMatchingType.FLAT && messageMatching.flatMessageMatchingConfiguration) {
    return extractFlatMessagesFromSingleSpan(span, messageMatching.flatMessageMatchingConfiguration)
  }

  return []
}

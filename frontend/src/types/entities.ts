
import {
  MatchPatternType,
  EntityType,
  HighlightValueType,
  MessageMatchingType } from
'./enums';

export interface Highlight {
  title: string;
  key: string;
  valueType: HighlightValueType;
}

export interface FlatMessageMatchingPatterns {
  rolePattern: string;
  contentPattern: string;
  namePattern: string;
  toolMessageCallIdPattern: string;
  toolCallFunctionNamePattern: string;
  toolCallIdPattern: string;
  toolCallFunctionArgumentPattern: string;
}

export interface CanonicalMessageMatchingConfiguration {
  inputAttributeKey: string;
  outputAttributeKey: string;
}

export interface FlatMessageMatchingConfiguration {
  flatInputMessageMatchingKeys: FlatMessageMatchingPatterns;
  flatOutputMessageMatchingKeys: FlatMessageMatchingPatterns;
}

export interface MessageMatching {
  type: MessageMatchingType;
  canonicalMessageMatchingConfiguration: CanonicalMessageMatchingConfiguration | null;
  flatMessageMatchingConfiguration: FlatMessageMatchingConfiguration | null;
}

export interface EntityResponse {
  id: string;
  name: string;
  description?: string;
  type: string;
  matchingAttributeName: string;
  matchingPatternType: MatchPatternType;
  matchingPattern?: string | null;
  matchingValue?: string | null;
  entityType: EntityType;
  entityHighlights?: Highlight[];
  messageMatching: MessageMatching | null;
  iconId?: string;
  externalId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntityRequest {
  name: string;
  description?: string;
  type: string;
  matchingAttributeName: string;
  matchingPatternType: MatchPatternType;
  matchingPattern?: string;
  matchingValue?: string;
  entityType: EntityType;
  entityHighlights?: Highlight[];
  messageMatching?: MessageMatching;
  iconId?: string;
  externalId?: string;
}

export interface UpdateEntityRequest {
  name?: string;
  description?: string;
  type?: string;
  matchingAttributeName?: string;
  matchingPatternType?: MatchPatternType;
  matchingPattern?: string;
  matchingValue?: string;
  entityType?: EntityType;
  entityHighlights?: Highlight[];
  messageMatching?: MessageMatching;
  iconId?: string;
}

export interface EntityMessageResponse {
  message: string;
}
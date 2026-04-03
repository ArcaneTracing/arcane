import React from "react";
import { EntityResponse } from "@/types/entities";
import { EntityType, MatchPatternType } from "@/types/enums";
import type { NonObjectPrimitive } from "@/lib/utils";

interface SpanWithAttributes {
  attributes?: Array<{
    key: string;
    value: unknown;
  }>;
}
import * as LucideIcons from "lucide-react";
import { getIconColor } from "@/components/entities/forms/icon-picker";
export function getEntityIconColor(entityType: EntityType | string, iconId?: string): string {

  if (entityType === EntityType.CUSTOM && iconId) {
    return getIconColor(iconId);
  }


  if (entityType === EntityType.MODEL) {
    return "text-blue-600 dark:text-blue-400";
  }
  if (entityType === EntityType.TOOL) {
    return "text-orange-600 dark:text-orange-400";
  }
  if (entityType === EntityType.EMBEDDING) {
    return "text-purple-600 dark:text-purple-400";
  }
  if (entityType === EntityType.RETRIEVER) {
    return "text-green-600 dark:text-green-400";
  }
  if (entityType === EntityType.GUARDRAIL) {
    return "text-red-600 dark:text-red-400";
  }
  if (entityType === EntityType.EVALUATOR) {
    return "text-green-600 dark:text-green-400";
  }
  if (entityType === EntityType.AGENT) {
    return "text-teal-600 dark:text-teal-400";
  }
  return "";
}
export function getEntityBorderColor(entityType: EntityType): string {

  if (entityType === EntityType.MODEL) {
    return "border-blue-300 dark:border-blue-700";
  }
  if (entityType === EntityType.TOOL) {
    return "border-orange-300 dark:border-orange-700";
  }
  if (entityType === EntityType.EMBEDDING) {
    return "border-purple-300 dark:border-purple-700";
  }
  if (entityType === EntityType.RETRIEVER) {
    return "border-green-300 dark:border-green-700";
  }
  if (entityType === EntityType.GUARDRAIL) {
    return "border-red-300 dark:border-red-700";
  }
  if (entityType === EntityType.EVALUATOR) {
    return "border-green-300 dark:border-green-700";
  }
  if (entityType === EntityType.AGENT) {
    return "border-teal-300 dark:border-teal-700";
  }
  return "";
}

export function getEntityBackgroundColor(entityType: EntityType | string, iconId?: string): string {

  if (entityType === EntityType.CUSTOM && iconId) {
    return "bg-gray-600 dark:bg-gray-400";
  }


  if (entityType === EntityType.MODEL) {
    return "bg-blue-600 dark:bg-blue-400";
  }
  if (entityType === EntityType.TOOL) {
    return "bg-orange-600 dark:bg-orange-400";
  }
  if (entityType === EntityType.EMBEDDING) {
    return "bg-purple-600 dark:bg-purple-400";
  }
  if (entityType === EntityType.RETRIEVER) {
    return "bg-green-600 dark:bg-green-400";
  }
  if (entityType === EntityType.GUARDRAIL) {
    return "bg-red-600 dark:bg-red-400";
  }
  if (entityType === EntityType.EVALUATOR) {
    return "bg-green-600 dark:bg-green-400";
  }
  if (entityType === EntityType.AGENT) {
    return "bg-teal-600 dark:bg-teal-400";
  }
  return "";
}
export function getEntityIcon(entityType: EntityType, className?: string, iconId?: string): React.ReactElement {


  const defaultClasses = "h-4 w-4";
  const iconProps = { className: className || defaultClasses };


  if (entityType === EntityType.CUSTOM && iconId) {

    const pascalCaseName = iconId.
    split('-').
    map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).
    join('');

    const IconComponent = (LucideIcons as any)[pascalCaseName];
    if (IconComponent) {
      return React.createElement(IconComponent, iconProps);
    }

    return React.createElement(LucideIcons.Circle, iconProps);
  }


  if (entityType === EntityType.MODEL) {
    return React.createElement(LucideIcons.Brain, iconProps);
  }
  if (entityType === EntityType.TOOL) {
    return React.createElement(LucideIcons.Wrench, iconProps);
  }
  if (entityType === EntityType.EMBEDDING) {
    return React.createElement(LucideIcons.Layers, iconProps);
  }
  if (entityType === EntityType.RETRIEVER) {
    return React.createElement(LucideIcons.Database, iconProps);
  }
  if (entityType === EntityType.GUARDRAIL) {

    const ShieldIcon = (LucideIcons as any).ShieldAlert || LucideIcons.Shield;
    return React.createElement(ShieldIcon, iconProps);
  }
  if (entityType === EntityType.EVALUATOR) {

    const CheckIcon = (LucideIcons as any).CheckCircle2 || (LucideIcons as any).CheckCircle || LucideIcons.Check;
    return React.createElement(CheckIcon, iconProps);
  }
  if (entityType === EntityType.AGENT) {

    const BotIcon = (LucideIcons as any).Bot || (LucideIcons as any).UserCog || LucideIcons.Users;
    return React.createElement(BotIcon, iconProps);
  }
  return React.createElement(React.Fragment);
}
export function getEntityTypeName(entityType: EntityType, customType?: string): string {
  if (entityType === EntityType.CUSTOM && customType) {
    return customType;
  }

  switch (entityType) {
    case EntityType.MODEL:
      return "Model";
    case EntityType.TOOL:
      return "Tool";
    case EntityType.EMBEDDING:
      return "Embedding";
    case EntityType.RETRIEVER:
      return "Retriever";
    case EntityType.GUARDRAIL:
      return "Guardrail";
    case EntityType.EVALUATOR:
      return "Evaluator";
    case EntityType.AGENT:
      return "Agent";
    case EntityType.CUSTOM:
      return "Custom";
    default:
      return "Model";
  }
}
export function getPatternMatchTypeLabel(patternType: MatchPatternType): string {
  switch (patternType) {
    case MatchPatternType.VALUE:
      return "value";
    case MatchPatternType.REGEX:
      return "regex";
    default:
      return "value";
  }
}
export function matchSpanToEntity(span: SpanWithAttributes, entity: EntityResponse): boolean {
  if (!span?.attributes || !Array.isArray(span.attributes)) {
    return false;
  }


  const matchingAttribute = span.attributes.find(
    (attr) => attr.key === entity.matchingAttributeName
  );

  if (!matchingAttribute) {
    return false;
  }

  const rawValue = matchingAttribute.value;
  const attributeValue = (() => {
    if (rawValue == null) return '';
    if (typeof rawValue === 'object') return JSON.stringify(rawValue);
    if (typeof rawValue === 'string') return rawValue;
    return String(rawValue as NonObjectPrimitive);
  })();


  const patternType = entity.matchingPatternType as MatchPatternType | string;
  if (patternType === MatchPatternType.VALUE || patternType === "value") {

    return attributeValue === (entity.matchingValue ?? "");
  } else if (patternType === MatchPatternType.REGEX || patternType === "regex") {

    const pattern = entity.matchingPattern;
    if (!pattern) {
      return false;
    }
    try {
      const regex = new RegExp(pattern);
      return regex.test(attributeValue);
    } catch (error) {
      console.error('Invalid regex pattern:', pattern, error);
      return false;
    }
  }

  return false;
}

export function findMatchingEntity(span: SpanWithAttributes, entities: EntityResponse[]): EntityResponse | null {
  if (!entities || entities.length === 0) {
    return null;
  }


  for (const entity of entities) {
    if (matchSpanToEntity(span, entity)) {

      return entity;
    }
  }

  return null;
}
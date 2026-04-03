"use client";

import { useEffect, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Highlight } from "@/types/entities";
import { EntityType, HighlightValueType } from "@/types/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { InfoButton } from "@/components/shared/info-button";
import { entityTooltips } from "@/constants/entity-tooltips";

interface EntitySpecificStepProps {
  entityType: EntityType;
  attributes: Highlight[];
  onAttributesChange: (attributes: Highlight[]) => void;
  disabled?: boolean;
}

const valueTypeOptions = [
{ value: HighlightValueType.STRING, label: "String" },
{ value: HighlightValueType.NUMBER, label: "Number" },
{ value: HighlightValueType.BOOLEAN, label: "Boolean" }];


const getDefaultEntityAttributes = (entityType: EntityType): Highlight[] => {
  switch (entityType) {
    case EntityType.MODEL:
      return [
      { title: "Request Model", key: "gen_ai.request.model", valueType: HighlightValueType.STRING },
      { title: "Response Model", key: "gen_ai.response.model", valueType: HighlightValueType.STRING },
      { title: "Input Tokens", key: "gen_ai.usage.input_tokens", valueType: HighlightValueType.NUMBER },
      { title: "Output Tokens", key: "gen_ai.usage.output_tokens", valueType: HighlightValueType.NUMBER }];

    case EntityType.AGENT:
      return [
      { title: "Agent Name", key: "gen_ai.agent.name", valueType: HighlightValueType.STRING }];

    case EntityType.TOOL:
      return [
      { title: "Tool highlight", key: "gen_ai.tool.name", valueType: HighlightValueType.STRING }];

    case EntityType.EMBEDDING:
      return [
      { title: "Dimension count", key: "gen_ai.embeddings.dimension.count", valueType: HighlightValueType.NUMBER },
      { title: "Model", key: "gen_ai.embeddings.model", valueType: HighlightValueType.STRING },
      { title: "Input Tokens", key: "gen_ai.usage.input_tokens", valueType: HighlightValueType.NUMBER },
      { title: "Output Tokens", key: "gen_ai.usage.output_tokens", valueType: HighlightValueType.NUMBER }];

    case EntityType.RETRIEVER:
      return [
      { title: "Data Source ID", key: "gen_ai.data_source.id", valueType: HighlightValueType.STRING }];

    case EntityType.GUARDRAIL:
      return [
      { title: "Guardrail highlight", key: "gen_ai.guardrail.id", valueType: HighlightValueType.STRING },
      { title: "Guardrail name highlight", key: "gen_ai.guardrail.name", valueType: HighlightValueType.STRING }];

    case EntityType.EVALUATOR:
      return [
      { title: "Evaluator Score Label", key: "gen_ai.evaluation.score.label", valueType: HighlightValueType.STRING },
      { title: "Evaluator Score Value", key: "gen_ai.evaluation.score.value", valueType: HighlightValueType.STRING },
      { title: "Evaluator Name", key: "gen_ai.evaluator.name", valueType: HighlightValueType.STRING }];

    default:
      return [
      { title: "Primary highlight", key: "gen_ai.request.model", valueType: HighlightValueType.STRING }];

  }
};

export { getDefaultEntityAttributes };

export function EntitySpecificStep({
  entityType,
  attributes,
  onAttributesChange,
  disabled
}: Readonly<EntitySpecificStepProps>) {
  const defaults = useMemo(() => getDefaultEntityAttributes(entityType), [entityType]);
  const prevEntityTypeRef = useRef<EntityType | undefined>(undefined);


  useEffect(() => {
    const isEntityTypeChanged =
    prevEntityTypeRef.current !== undefined &&
    prevEntityTypeRef.current !== entityType;

    prevEntityTypeRef.current = entityType;

    if (attributes.length === 0 || isEntityTypeChanged) {
      onAttributesChange(defaults);
    }
  }, [attributes.length, defaults, entityType, onAttributesChange]);


  const isDefaultAttribute = (key: string) => {
    return defaults.some((defaultAttr) => defaultAttr.key === key);
  };

  const handleAttributeChange = (index: number, updates: Partial<Highlight>) => {
    const next = attributes.map((attr, attrIndex) =>
    attrIndex === index ? { ...attr, ...updates } : attr
    );
    onAttributesChange(next);
  };

  const handleAddAttribute = () => {
    onAttributesChange([
    ...attributes,
    { title: "", key: "", valueType: HighlightValueType.STRING }]
    );
  };

  const handleRemoveAttribute = (index: number) => {
    const next = attributes.filter((_, attrIndex) => attrIndex !== index);
    onAttributesChange(next.length === 0 ? [] : next);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-sm font-medium dark:text-gray-200">
          Highlights <span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Configure span highlights for this entity. Each highlight has a title (display label), span attribute key, and value type.
        </p>
      </div>

      <div className="space-y-4">
        {attributes.map((attribute, index) =>
        <div key={`${attribute.title}-${attribute.key}`} className="rounded-xl border border-gray-200 dark:border-[#2A2A2A] p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Highlight {index + 1}
              </Label>
              <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveAttribute(index)}
              disabled={disabled}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 h-8 w-8">

                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove highlight</span>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Highlight title <span className="text-red-500">*</span>
                  </Label>
                  <InfoButton content={entityTooltips.highlights.title} iconSize="sm" />
                </div>
                <Input
                value={attribute.title}
                placeholder="Highlight title"
                onChange={(e) => handleAttributeChange(index, { title: e.target.value })}
                className="h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white text-sm"
                disabled={disabled || isDefaultAttribute(attribute.key)}
                required />

              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Span attribute key <span className="text-red-500">*</span>
                  </Label>
                  <InfoButton content={entityTooltips.highlights.spanAttributeKey} iconSize="sm" />
                </div>
                <Input
                value={attribute.key}
                placeholder="gen_ai.request.model"
                onChange={(e) => handleAttributeChange(index, { key: e.target.value })}
                className="h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                disabled={disabled}
                required />

              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Value type
                </Label>
                <InfoButton content={entityTooltips.highlights.valueType} iconSize="sm" />
              </div>
              <Select
              value={attribute.valueType || HighlightValueType.STRING}
              onValueChange={(value) =>
              handleAttributeChange(index, { valueType: value as HighlightValueType })
              }
              disabled={disabled || isDefaultAttribute(attribute.key)}>

                <SelectTrigger className="h-9 border-gray-200 dark:border-[#2A2A2A] dark:bg-[#0D0D0D] dark:text-white text-sm">
                  <SelectValue placeholder="Select value type" />
                </SelectTrigger>
                <SelectContent>
                  {valueTypeOptions.map((option) =>
                <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleAddAttribute}
        disabled={disabled}
        className="h-9 px-3 text-sm">

        <Plus className="h-4 w-4 mr-2" />
        Add highlight
      </Button>
    </div>);

}
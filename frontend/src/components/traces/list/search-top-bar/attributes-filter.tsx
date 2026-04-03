"use client";

import { useState, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useTraceAttributeNames, useTraceAttributeValues } from "@/hooks/traces/use-trace-attributes";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import type { TracesSearchConfig } from "@/types/traces";
import { isForbiddenError } from "@/lib/error-handling";

interface AttributesFilterProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  config: TracesSearchConfig;
  projectId?: string;
  datasourceId?: string;
}

function parseAttributes(attributesString: string): Array<{key: string;value: string;}> {
  if (!attributesString.trim()) return [];

  return attributesString.
  split(/\s+/).
  filter(Boolean).
  map((pair) => {
    const [key, ...valueParts] = pair.split('=');
    return {
      key: key || '',
      value: valueParts.join('=') || ''
    };
  }).
  filter((pair) => pair.key && pair.value);
}
function formatAttributes(attributes: Array<{key: string;value: string;}>): string {
  return attributes.map((attr) => `${attr.key}=${attr.value}`).join(' ');
}
export function AttributesFilter({
  value,
  onChange,
  onKeyDown,
  config,
  projectId: propProjectId,
  datasourceId: propDatasourceId
}: Readonly<AttributesFilterProps>) {
  const params = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/traces", strict: false });
  const organisationId = useOrganisationIdOrNull();
  const projectId = propProjectId ?? params?.projectId;
  const datasourceId = propDatasourceId ?? params?.datasourceId;

  const [attributeInput, setAttributeInput] = useState('');
  const [selectedAttributeName, setSelectedAttributeName] = useState<string>('');
  const [valueInput, setValueInput] = useState('');


  const attributes = useMemo(() => parseAttributes(value), [value]);


  const {
    data: attributeNames = [],
    isLoading: isLoadingNames,
    error: namesError
  } = useTraceAttributeNames({
    organisationId,
    projectId,
    datasourceId,
    enabled: config.loadAttributeNames
  });


  const {
    data: attributeValues = [],
    isLoading: isLoadingValues,
    error: valuesError
  } = useTraceAttributeValues({
    organisationId,
    projectId,
    datasourceId,
    attributeName: selectedAttributeName,
    enabled: config.loadAttributeValues && !!selectedAttributeName
  });

  const hasPermissionError =
  namesError && isForbiddenError(namesError) ||
  valuesError && isForbiddenError(valuesError);


  if (!config.showAttributesFilter) {
    return null;
  }

  if (!config.loadAttributeNames && !config.loadAttributeValues) {

    return (
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <Label htmlFor="attributes-input" className="text-sm font-medium">
          Attributes
        </Label>
        <Input
          id="attributes-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='e.g., service.name=my-service span.kind=server'
          className="w-full" />

        <p className="text-xs text-muted-foreground">
          Format: key=value key2=value2 (space-separated)
        </p>
      </div>);

  }


  const handleAddAttribute = () => {
    if (!selectedAttributeName || !valueInput.trim()) return;

    const newAttributes = [
    ...attributes.filter((attr) => attr.key !== selectedAttributeName),
    { key: selectedAttributeName, value: valueInput.trim() }];

    onChange(formatAttributes(newAttributes));
    setSelectedAttributeName('');
    setValueInput('');
    setAttributeInput('');
  };

  const handleRemoveAttribute = (key: string) => {
    const newAttributes = attributes.filter((attr) => attr.key !== key);
    onChange(formatAttributes(newAttributes));
  };

  const handleAttributeNameSelect = (name: string) => {
    setSelectedAttributeName(name);

    const existing = attributes.find((attr) => attr.key === name);
    if (existing) {
      setValueInput(existing.value);
    } else {
      setValueInput('');
    }
  };

  const handleValueSelect = (selectedValue: string) => {
    setValueInput(selectedValue);
    handleAddAttribute();
  };

  return (
    <div className="flex-1 flex flex-col gap-2 min-w-0">
      <Label className="text-sm font-medium">Attributes</Label>

      {}
      {attributes.length > 0 &&
      <div className="flex flex-wrap gap-2">
          {attributes.map((attr) =>
        <Badge key={attr.key} variant="secondary" className="px-2 py-1">
              {attr.key}={attr.value}
              <button
            type="button"
            onClick={() => handleRemoveAttribute(attr.key)}
            className="ml-2 hover:text-destructive"
            aria-label={`Remove ${attr.key}`}>

                <X className="h-3 w-3" />
              </button>
            </Badge>
        )}
        </div>
      }

      {}
      <div className="flex items-start gap-2">
        {config.loadAttributeNames ?
        <div className="flex-1 min-w-[200px]">
            <Autocomplete
            value={attributeInput}
            onChange={setAttributeInput}
            onSelect={handleAttributeNameSelect}
            fetchSuggestions={async (query: string) => {
              if (!query.trim()) return [];
              const lowerQuery = query.toLowerCase();
              return attributeNames.filter((name) =>
              name.toLowerCase().includes(lowerQuery)
              );
            }}
            placeholder={
            hasPermissionError ?
            "No permission to view attributes" :
            "Select attribute name..."
            }
            disabled={hasPermissionError}
            isLoading={isLoadingNames} />

          </div> :

        <Input
          value={selectedAttributeName || attributeInput}
          onChange={(e) => {
            setAttributeInput(e.target.value);
            setSelectedAttributeName(e.target.value);
          }}
          placeholder="Attribute name"
          className="flex-1 min-w-[200px]" />

        }

        {selectedAttributeName &&
        <>
            <span className="self-center text-muted-foreground">=</span>
            {config.loadAttributeValues ?
          <div className="flex-1 min-w-[200px]">
                <Autocomplete
              value={valueInput}
              onChange={setValueInput}
              onSelect={handleValueSelect}
              fetchSuggestions={async (query: string) => {
                if (!query.trim() || !selectedAttributeName) return [];
                const lowerQuery = query.toLowerCase();
                return attributeValues.filter((value) =>
                value.toLowerCase().includes(lowerQuery)
                );
              }}
              placeholder={
              (() => {
                if (hasPermissionError) return "No permission to view values";
                if (isLoadingValues) return "Loading values...";
                return "Select value...";
              })()
              }
              disabled={hasPermissionError || isLoadingValues}
              isLoading={isLoadingValues} />

              </div> :

          <Input
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && valueInput.trim()) {
                e.preventDefault();
                handleAddAttribute();
              }
            }}
            placeholder="Attribute value"
            className="flex-1 min-w-[200px]" />

          }
            <button
            type="button"
            onClick={handleAddAttribute}
            disabled={!valueInput.trim()}
            className="px-3 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed">

              Add
            </button>
          </>
        }
      </div>

      <p className="text-xs text-muted-foreground">
        {config.loadAttributeNames && config.loadAttributeValues ?
        "Select attribute name and value, or type manually" :
        "Format: key=value key2=value2 (space-separated)"}
      </p>
    </div>);

}
"use client";

import { useState, useEffect } from "react";
import { Autocomplete } from "@/components/ui/autocomplete";
import { TagBadge } from "./tag-badge";
import { useTraceAttributeValues } from "@/hooks/traces/use-trace-attributes";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { isForbiddenError } from "@/lib/error-handling";

interface AttributeValuesSelectorProps {
  projectId?: string;
  datasourceId?: string;
  selectedAttribute: string;
  selectedValues: string[];
  onValueSelect: (attribute: string, value: string) => void;
  onRemoveValue: (attribute: string, value: string) => void;
  enabled?: boolean;
}

export function AttributeValuesSelector({
  projectId,
  datasourceId,
  selectedAttribute,
  selectedValues,
  onValueSelect,
  onRemoveValue,
  enabled = true
}: Readonly<AttributeValuesSelectorProps>) {
  const [valueInput, setValueInput] = useState('');
  const organisationId = useOrganisationIdOrNull();


  const { data: attributeValues = [], isLoading, error } = useTraceAttributeValues({
    organisationId,
    projectId,
    datasourceId,
    attributeName: selectedAttribute,
    enabled: enabled && !!organisationId && !!projectId && !!datasourceId && !!selectedAttribute
  });

  const hasPermissionError = error && isForbiddenError(error);


  useEffect(() => {
    setValueInput('');
  }, [selectedAttribute]);

  const handleValueSelect = (value: string) => {
    if (!selectedAttribute || !value) return;
    onValueSelect(selectedAttribute, value);
    setValueInput('');
  };


  const fetchSuggestions = async (query: string): Promise<string[]> => {
    if (!query.trim()) {

      return attributeValues;
    }
    const queryLower = query.toLowerCase();
    return attributeValues.filter((value) =>
    value.toLowerCase().includes(queryLower)
    );
  };

  return (
    <div className="flex items-start gap-2 flex-1">
      <div className="flex-1 min-w-[400px]">
        {}
        {selectedValues.length > 0 &&
        <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedValues.map((val) =>
          <TagBadge
            key={`${selectedAttribute}-${val}`}
            label={`${selectedAttribute}=${val}`}
            onRemove={() => onRemoveValue(selectedAttribute, val)} />

          )}
          </div>
        }
        
        {}
        <Autocomplete
          value={valueInput}
          onChange={setValueInput}
          onSelect={handleValueSelect}
          fetchSuggestions={fetchSuggestions}
          placeholder={hasPermissionError ? "No permission to view values" : "Select value..."}
          disabled={!selectedAttribute || hasPermissionError}
          isLoading={isLoading} />

      </div>
    </div>);

}
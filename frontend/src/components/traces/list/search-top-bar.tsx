"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { DatasourceType, DatasourceSource } from "@/types/enums";
import { useParams } from "@tanstack/react-router";
import { DatasourceSelector } from "./search-top-bar/datasource-selector";
import { SearchModeSelector } from "./search-top-bar/search-mode-selector";
import { QueryInput } from "./search-top-bar/query-input";
import { SpanNameInput } from "./search-top-bar/span-name-input";
import { AttributesInput } from "./search-top-bar/attributes-input";
import { AttributeSelector } from "./search-top-bar/attribute-selector";
import { AttributeValuesSelector } from "./search-top-bar/attribute-values-selector";
import { SearchFiltersBar } from "./search-top-bar/search-filters";
import { SearchMode, SearchTopBarProps } from "./search-top-bar/types";
import { getSearchModeFromConfig, isSearchModeSupported } from "./search-top-bar/search-mode";
import { useDatasourcesListQuery } from "@/hooks/datasources/use-datasources-query";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { datasourceTooltips } from "@/constants/datasource-tooltips";

export type { SearchTopBarProps, SearchFilters } from "./search-top-bar/types";

export function SearchTopBar({
  filters,
  startDate,
  endDate,
  isSearchLoading,
  onFiltersChange,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  config
}: Readonly<SearchTopBarProps>) {
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/traces", strict: false });


  const searchConfig = config || {
    showQueryEditor: false,
    showAttributesFilter: false,
    loadAttributeNames: false,
    loadAttributeValues: false
  };

  const correctSearchMode = useMemo(
    () => getSearchModeFromConfig(searchConfig),
    [
    searchConfig.showQueryEditor,
    searchConfig.showAttributesFilter,
    searchConfig.loadAttributeNames,
    searchConfig.loadAttributeValues]

  );

  const [searchMode, setSearchMode] = useState<SearchMode>(() =>
  getSearchModeFromConfig(searchConfig)
  );
  const [searchInput, setSearchInput] = useState('');
  const [selectedAttribute, setSelectedAttribute] = useState<string>('');
  const prevDatasourceIdRef = useRef<string | undefined>(filters.datasourceId);

  const effectiveSearchMode = useMemo(() => {
    if (!isSearchModeSupported(searchMode, searchConfig)) {
      return correctSearchMode;
    }
    return searchMode;
  }, [
  searchMode,
  correctSearchMode,
  searchConfig.showQueryEditor,
  searchConfig.showAttributesFilter,
  searchConfig.loadAttributeNames,
  searchConfig.loadAttributeValues]
  );

  const { hasPermission, isLoading: permissionsLoading } = usePermissions({
    organisationId,
    projectId
  });
  const canReadDatasources = !permissionsLoading && hasPermission(PERMISSIONS.DATASOURCE.READ);


  const {
    data: datasources = [],
    isLoading: isDatasourcesLoading,
    error: datasourcesError
  } = useDatasourcesListQuery({ enabled: canReadDatasources });


  const traceDatasources = datasources.filter((ds) => ds.type === DatasourceType.TRACES);


  const selectedDatasource = useMemo(() => {
    if (!filters.datasourceId || typeof filters.datasourceId !== 'string') return null;
    return traceDatasources.find((ds) => ds.id === filters.datasourceId) || null;
  }, [filters.datasourceId, traceDatasources]);


  const queryTooltipContent = useMemo(() => {
    if (!selectedDatasource) return undefined;

    switch (selectedDatasource.source) {
      case DatasourceSource.TEMPO:
        return datasourceTooltips.form.queryLanguage.tempo;
      case DatasourceSource.CLICKHOUSE:
        return datasourceTooltips.form.queryLanguage.clickhouse;
      case DatasourceSource.CUSTOM_API:
        return datasourceTooltips.form.queryLanguage.customApi;
      default:
        return undefined;
    }
  }, [selectedDatasource]);


  const attributesArray = useMemo(() => {
    if (!filters.attributes) return [];
    return filters.attributes.split(/\s+/).filter(Boolean);
  }, [filters.attributes]);


  const selectedAttributeValues = useMemo(() => {
    if (!selectedAttribute) return [];
    return attributesArray.
    filter((attr) => attr.startsWith(`${selectedAttribute}=`)).
    map((attr) => attr.split('=').slice(1).join('='));
  }, [attributesArray, selectedAttribute]);


  useEffect(() => {
    if (effectiveSearchMode === 'query') {
      setSearchInput(filters.q);
    } else if (effectiveSearchMode === 'span-name') {
      setSearchInput(filters.spanName ?? '');
    } else {
      setSearchInput('');
    }
  }, [effectiveSearchMode, filters.q, filters.spanName]);


  useEffect(() => {
    if (
      filters.spanName &&
      isSearchModeSupported('span-name', searchConfig) &&
      searchMode !== 'span-name'
    ) {
      setSearchMode('span-name');
    }
  }, [filters.spanName, searchConfig, searchMode]);

  useEffect(() => {
    const datasourceChanged = prevDatasourceIdRef.current !== filters.datasourceId;
    if (datasourceChanged) {
      prevDatasourceIdRef.current = filters.datasourceId;
      setSearchInput('');
      setSelectedAttribute('');
      if (correctSearchMode !== searchMode) {
        setSearchMode(correctSearchMode);
      }
    } else if (
    correctSearchMode !== searchMode &&
    !isSearchModeSupported(searchMode, searchConfig))
    {
      setSearchMode(correctSearchMode);
      setSearchInput('');
      setSelectedAttribute('');
    }
  }, [
  correctSearchMode,
  filters.datasourceId,
  searchMode,
  searchConfig.showQueryEditor,
  searchConfig.showAttributesFilter,
  searchConfig.loadAttributeNames,
  searchConfig.loadAttributeValues]
  );

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (effectiveSearchMode === 'tag' && searchInput) {
        const newAttributes = [...attributesArray.filter((a) => a !== searchInput), searchInput];
        onFiltersChange({ attributes: newAttributes.join(' ') });
        setSearchInput('');
      } else if (effectiveSearchMode === 'query') {
        onFiltersChange({ q: searchInput });
        handleSearch();
      } else if (effectiveSearchMode === 'span-name') {
        onFiltersChange({ spanName: searchInput });
        handleSearch();
      }
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    if (effectiveSearchMode === 'query') {
      onFiltersChange({ q: value });
    } else if (effectiveSearchMode === 'span-name') {
      onFiltersChange({ spanName: value });
    }
  };

  const handleSearch = () => {
    if (effectiveSearchMode === 'query') {
      onFiltersChange({ q: searchInput });
    } else if (effectiveSearchMode === 'span-name') {
      onFiltersChange({ spanName: searchInput });
    }
    onSearch();
  };

  const removeAttribute = (attributeToRemove: string) => {
    const newAttributes = attributesArray.filter((a) => a !== attributeToRemove);
    onFiltersChange({ attributes: newAttributes.join(' ') });
  };

  const handleAttributeValueSelect = (attribute: string, value: string) => {
    if (!attribute || !value) return;


    const attributeString = `${attribute}=${value}`;
    const newAttributes = [
    ...attributesArray.filter((a) => !a.startsWith(`${attribute}=`)),
    attributeString];

    onFiltersChange({ attributes: newAttributes.join(' ') });
  };

  const removeAttributeValue = (attribute: string, value: string) => {
    const attributeString = `${attribute}=${value}`;
    const newAttributes = attributesArray.filter((a) => a !== attributeString);
    onFiltersChange({ attributes: newAttributes.join(' ') });
  };


  const showModeSelector = searchConfig.showQueryEditor && searchConfig.showAttributesFilter;

  return (
    <div className="border-b px-10 py-6 space-y-4">
      {}
      <div className="flex items-start gap-3">
        <DatasourceSelector
          datasources={traceDatasources}
          value={filters.datasourceId}
          onValueChange={(value) => onFiltersChange({ datasourceId: value })}
          error={datasourcesError}
          isLoading={isDatasourcesLoading} />


        {}
        {(searchConfig.showQueryEditor || searchConfig.showAttributesFilter) &&
        <div className={`flex items-start gap-2 ${effectiveSearchMode === 'tag-values' ? '' : 'flex-1'} min-w-[250px]`}>
            {showModeSelector &&
          <SearchModeSelector
            value={effectiveSearchMode}
            onValueChange={(value) => {
              setSearchMode(value);
              setSearchInput('');
              if (value !== 'tag-values') {
                setSelectedAttribute('');
              }
              if (value === 'query') {
                onFiltersChange({ attributes: '', spanName: '' });
              } else if (value === 'span-name') {
                onFiltersChange({ q: '', attributes: '' });
              } else {
                onFiltersChange({ q: '', spanName: '' });
              }
            }} />

          }
            
            {effectiveSearchMode === 'tag-values' ?

          <div className="flex items-start gap-2 flex-1">
                {projectId && filters.datasourceId && typeof filters.datasourceId === 'string' && filters.datasourceId.trim() !== '' ?
            <>
                    <AttributeSelector
                projectId={projectId}
                datasourceId={filters.datasourceId}
                value={selectedAttribute}
                onValueChange={(newAttribute) => {
                  setSelectedAttribute(newAttribute);

                  const newAttributes = attributesArray.filter((a) => !a.startsWith(`${newAttribute}=`));
                  onFiltersChange({ attributes: newAttributes.join(' ') });
                }}
                enabled={searchConfig.loadAttributeNames} />

                    {selectedAttribute && typeof selectedAttribute === 'string' && selectedAttribute.trim() !== '' ?
              <AttributeValuesSelector
                projectId={projectId}
                datasourceId={filters.datasourceId}
                selectedAttribute={selectedAttribute}
                selectedValues={selectedAttributeValues}
                onValueSelect={handleAttributeValueSelect}
                onRemoveValue={removeAttributeValue}
                enabled={searchConfig.loadAttributeValues} /> :

              null}
                  </> :
            null}
              </div> :

          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                {(() => {
              if (effectiveSearchMode === 'query' && searchConfig.showQueryEditor) {
                return (
                  <QueryInput
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchInputKeyDown}
                    tooltipContent={queryTooltipContent} />
                );
              }
              if (effectiveSearchMode === 'span-name') {
                return (
                  <SpanNameInput
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchInputKeyDown} />
                );
              }
              if (searchConfig.showAttributesFilter) {
                return (
                  <AttributesInput
                    attributes={attributesArray}
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchInputKeyDown}
                    onRemoveAttribute={removeAttribute} />
                );
              }
              return null;
            })()}
              </div>
          }
          </div>
        }

        {}
        {!searchConfig.showQueryEditor && searchConfig.showAttributesFilter && !showModeSelector &&
        <div className="flex items-start gap-2 flex-1 min-w-[250px]">
            <AttributesInput
            attributes={attributesArray}
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchInputKeyDown}
            onRemoveAttribute={removeAttribute} />

          </div>
        }
      </div>

      {}
      <SearchFiltersBar
        filters={filters}
        startDate={startDate}
        endDate={endDate}
        isSearchLoading={isSearchLoading}
        onFiltersChange={onFiltersChange}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSearch={handleSearch} />

    </div>);

}
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearch } from "@tanstack/react-router";
import { searchToState, useTracesUrlState } from "@/hooks/traces/use-traces-url-state";
import { useTracesSearch } from "@/hooks/traces/use-traces-search";
import { useTracesFilters } from "@/hooks/traces/use-traces-filters";
import { TracesPageView } from "./view";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { PermissionError } from "@/components/shared/permission-error";
import { isForbiddenError } from "@/lib/error-handling";
import { useDatasourcesListQuery } from "@/hooks/datasources/use-datasources-query";
import type { TracesSearchConfig } from "@/types/traces";
import { syncTracesStateFromUrl } from "./sync-traces-url-state";

export function TracesPageContainer() {
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/traces", strict: false });
  const search = useSearch({ strict: false });
  const { updateUrlParams, isUpdatingFromUrlRef } = useTracesUrlState();

  const { hasPermission, isLoading: permissionsLoading } = usePermissions({
    organisationId,
    projectId
  });

  const [startDate, setStartDate] = useState<Date | undefined>(() => searchToState(search).startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(() => searchToState(search).endDate);
  const [filters, setFilters] = useState(() => searchToState(search).filters);


  const prevSearchRef = useRef<string>(JSON.stringify({
    start: search.start,
    end: search.end,
    datasourceId: search.datasourceId,
    q: search.q,
    attributes: search.attributes,
    min_duration: search.min_duration,
    max_duration: search.max_duration,
    lookback: search.lookback,
    limit: search.limit,
    spanName: search.spanName,
  }));

  const canReadDatasources = !permissionsLoading && hasPermission(PERMISSIONS.DATASOURCE.READ);
  const {
    data: datasources = [],
    isLoading: isFetchLoading,
    error: fetchError
  } = useDatasourcesListQuery({ enabled: canReadDatasources });

  const { traces, isSearchLoading, searchError, handleSearch } = useTracesSearch({
    projectId,
    filters,
    startDate,
    endDate,
    isFetchLoading,
    datasourcesLength: datasources.length
  });

  const { updateFilters, handleStartDateChange, handleEndDateChange } = useTracesFilters({
    filters,
    setFilters,
    setStartDate,
    setEndDate,
    updateUrlParams
  });


  const selectedDatasource = useMemo(() => {
    const found = datasources.find((ds) => ds.id === filters.datasourceId);
    return found;
  }, [datasources, filters.datasourceId]);

  const tracesSearchConfig: TracesSearchConfig = useMemo(() => {
    if (!selectedDatasource) {
      return {
        showQueryEditor: false,
        showAttributesFilter: false,
        loadAttributeNames: false,
        loadAttributeValues: false
      };
    }
    const config = {
      showQueryEditor: selectedDatasource.isSearchByQueryEnabled,
      showAttributesFilter: selectedDatasource.isSearchByAttributesEnabled,
      loadAttributeNames: selectedDatasource.isGetAttributeNamesEnabled,
      loadAttributeValues: selectedDatasource.isGetAttributeValuesEnabled
    };
    return config;
  }, [selectedDatasource]);

  useEffect(() => {
    syncTracesStateFromUrl(
      search,
      { startDate, endDate, filters },
      {
        setStartDate,
        setEndDate,
        setFilters,
        isUpdatingFromUrlRef
      },
      prevSearchRef
    );

  }, [search.start, search.end, search.datasourceId, search.q, search.attributes, search.min_duration, search.max_duration, search.lookback, search.limit, search.spanName]);

  if (fetchError && isForbiddenError(fetchError)) {
    return <PermissionError error={fetchError} resourceName="datasources" action="view" />;
  }

  return (
    <TracesPageView
      filters={filters}
      startDate={startDate}
      endDate={endDate}
      isSearchLoading={isSearchLoading}
      onFiltersChange={updateFilters}
      onStartDateChange={handleStartDateChange}
      onEndDateChange={handleEndDateChange}
      onSearch={handleSearch}
      traces={traces}
      datasourceId={filters.datasourceId ?? ''}
      isFetchLoading={isFetchLoading}
      searchError={searchError}
      config={tracesSearchConfig} />);


}
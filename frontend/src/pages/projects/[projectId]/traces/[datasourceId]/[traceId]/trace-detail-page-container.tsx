"use client"

import { useParams, useNavigate, useLocation } from "@tanstack/react-router"
import { useCallback, useMemo } from "react"
import { Loader } from "@/components/ui/loader"
import { useTraceQuery } from "@/hooks/traces/use-traces-query"
import { useTraceDetailUrlState } from "@/hooks/traces/use-trace-detail-url-state"
import { useDatasourcesQuery } from "@/hooks/datasources/use-datasources-query"
import { getParentSpanName, getAllServiceNamesFromTrace } from "@/lib/trace-utils"
import { TraceDetailPageView } from "./trace-detail-page-view"

const ROUTE_FROM =
  "/appLayout/organisations/$organisationId/projects/$projectId/traces/$datasourceId/$traceId"

const TRACES_LIST_SEARCH_KEYS = [
  "datasourceId",
  "lookback",
  "limit",
  "q",
  "attributes",
  "min_duration",
  "max_duration",
  "spanName",
  "start",
  "end",
] as const

export function TraceDetailPageContainer() {
  const { projectId, organisationId, datasourceId, traceId } = useParams({
    from: ROUTE_FROM,
    strict: false,
  })
  const navigate = useNavigate()
  const location = useLocation()

  const returnSearchParams = useMemo(() => {
    let searchStr: string
    if (typeof location.search === "string") {
      searchStr = location.search
    } else if (typeof globalThis.window === "undefined") {
      searchStr = ""
    } else {
      searchStr = globalThis.window.location.search
    }
    const params = new URLSearchParams(searchStr)
    const result: Record<string, string> = {}
    for (const key of TRACES_LIST_SEARCH_KEYS) {
      const val = params.get(key)
      if (val != null && val !== "") {
        result[key] = val
      }
    }
    if (Object.keys(result).length === 0 && datasourceId) {
      result.datasourceId = datasourceId
    }
    return result
  }, [location.search, datasourceId])

  const { visualizationType, onVisualizationChange } = useTraceDetailUrlState()

  const { data: datasources = [], isLoading: isFetchLoading, error: fetchError } =
    useDatasourcesQuery()
  const { data: trace, isLoading: isTraceLoading, error: traceError } = useTraceQuery(
    projectId,
    datasourceId,
    traceId
  )

  const onBack = useCallback(() => {
    if (!organisationId || !projectId) return
    if (typeof globalThis.window === "undefined" || globalThis.window.history.length <= 1) {
      navigate({
        to: "/organisations/$organisationId/projects/$projectId/traces",
        params: { organisationId, projectId },
        search: returnSearchParams,
      })
    } else {
      globalThis.window.history.back()
    }
  }, [navigate, organisationId, projectId, returnSearchParams])

  if (isTraceLoading || isFetchLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size="lg" />
      </div>
    )
  }

  if (trace == null || !traceId || fetchError || datasources.length === 0) {
    return <div>Trace not found</div>
  }

  if (traceError) {
    return <div>Error: {traceError.message || "Failed to load trace"}</div>
  }

  const parentSpanName = getParentSpanName(trace)
  const allServiceNames = getAllServiceNamesFromTrace(trace)

  return (
    <TraceDetailPageView
      trace={trace}
      traceId={traceId}
      parentSpanName={parentSpanName}
      allServiceNames={allServiceNames}
      visualizationType={visualizationType}
      onVisualizationChange={onVisualizationChange}
      onBack={onBack}
    />
  )
}

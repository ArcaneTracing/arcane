"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearch } from "@tanstack/react-router";

export type TraceDetailVisualization = "graph" | "viewer" | "conversation" | "trace-events";

export interface UseTraceDetailUrlStateReturn {
  visualizationType: TraceDetailVisualization;
  onVisualizationChange: (value: TraceDetailVisualization) => void;
}

const DEFAULT_VISUALIZATION: TraceDetailVisualization = "graph";

function readVisualizationFromUrl(search: Record<string, unknown> | undefined): string | null {
  const v = search?.visualization;
  if (typeof v === "string" && (v === "graph" || v === "viewer" || v === "conversation" || v === "trace-events")) {
    return v;
  }
  return null;
}

export function useTraceDetailUrlState(): UseTraceDetailUrlStateReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const search = useSearch({ strict: false });

  const fromSearch = readVisualizationFromUrl(search);
  const fromQuery = typeof location.search === "string" && location.search ?
  new URLSearchParams(location.search).get("visualization") :
  null;
  const initial = fromSearch || fromQuery;

  const [visualizationType, setVisualizationType] = useState<TraceDetailVisualization>(
    initial && (initial === "graph" || initial === "viewer" || initial === "conversation" || initial === "trace-events") ?
    initial :
    DEFAULT_VISUALIZATION
  );


  useEffect(() => {
    const fromUrl = readVisualizationFromUrl(search);
    const fromQueryString =
    typeof location.search === "string" && location.search ?
    new URLSearchParams(location.search).get("visualization") :
    null;
    if (!fromUrl && !fromQueryString) {
      const prevParams = typeof location.search === "string" && location.search
        ? Object.fromEntries(new URLSearchParams(location.search))
        : {};
      navigate({
        to: pathname as any,
        search: { ...prevParams, visualization: DEFAULT_VISUALIZATION },
        replace: true
      });
    }
  }, [search?.visualization, location.search, pathname, navigate]);

  const onVisualizationChange = useCallback(
    (value: TraceDetailVisualization) => {
      setVisualizationType(value);
      const prevParams = typeof location.search === "string" && location.search
        ? Object.fromEntries(new URLSearchParams(location.search))
        : {};
      navigate({
        to: pathname as any,
        search: { ...prevParams, visualization: value },
        replace: true
      });
    },
    [navigate, pathname, location.search]
  );

  return { visualizationType, onVisualizationChange };
}
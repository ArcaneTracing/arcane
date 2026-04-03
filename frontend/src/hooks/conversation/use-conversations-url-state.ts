"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, useSearch } from "@tanstack/react-router";
import { calculateDatesFromLookback } from "@/lib/lookback";
import {
  syncDatesFromUrl,
  syncStringParamFromUrl,
  syncLookbackFromUrl } from
"./use-conversations-url-state-utils";

export interface ConversationsUrlStateUpdates {
  datasourceId?: string;
  conversationConfigId?: string;
  lookback?: string;
  start?: Date;
  end?: Date;
}

export interface UseConversationsUrlStateReturn {
  startDate: Date | undefined;
  endDate: Date | undefined;
  datasourceId: string;
  lookback: string;
  conversationConfigId: string;
  handleStartDateChange: (date: Date | undefined) => void;
  handleEndDateChange: (date: Date | undefined) => void;
  handleDatasourceChange: (value: string) => void;
  handleConversationConfigChange: (value: string) => void;
  handleLookbackChange: (value: string) => void;
  isSearchEnabled: boolean;
  updateUrlParams: (updates: ConversationsUrlStateUpdates) => void;
}


export { calculateDatesFromLookback } from "@/lib/lookback";

export function useConversationsUrlState(): UseConversationsUrlStateReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const search = useSearch({ strict: false });

  const isUpdatingFromUrl = useRef(false);
  const isUpdatingFromLookback = useRef(false);

  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const start = search?.start as string | undefined;
    return start ? new Date(start) : undefined;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    const end = search?.end as string | undefined;
    return end ? new Date(end) : undefined;
  });
  const [datasourceId, setDatasourceId] = useState<string>(
    () => search?.datasourceId as string || ""
  );
  const [lookback, setLookback] = useState<string>(() => search?.lookback as string || "custom");
  const [conversationConfigId, setConversationConfigId] = useState<string>(
    () => search?.conversationConfigId as string || ""
  );

  const applyConversationsUrlUpdates = useCallback(
    (prev: Record<string, unknown>, updates: ConversationsUrlStateUpdates): Record<string, string> => {
      const newSearch: Record<string, string> = { ...(prev as Record<string, string>) };
      const setOrDeleteStr = (key: string, val: string | undefined) => {
        if (val) newSearch[key] = val;else
        delete newSearch[key];
      };
      const setOrDeleteDate = (key: string, val: Date | undefined) => {
        if (val) newSearch[key] = val.toISOString();else
        delete newSearch[key];
      };
      if (updates.datasourceId !== undefined) setOrDeleteStr('datasourceId', updates.datasourceId);
      if (updates.conversationConfigId !== undefined) setOrDeleteStr('conversationConfigId', updates.conversationConfigId);
      if (updates.lookback !== undefined) setOrDeleteStr('lookback', updates.lookback);
      if (updates.start !== undefined) setOrDeleteDate('start', updates.start);
      if (updates.end !== undefined) setOrDeleteDate('end', updates.end);
      return newSearch;
    },
    []
  );

  const updateUrlParams = useCallback(
    (updates: ConversationsUrlStateUpdates) => {
      isUpdatingFromUrl.current = true;
      navigate({
        to: pathname as any,
        search: (prev: Record<string, unknown>) => applyConversationsUrlUpdates(prev, updates),
        replace: true
      });
      setTimeout(() => {
        isUpdatingFromUrl.current = false;
      }, 100);
    },
    [navigate, pathname, applyConversationsUrlUpdates]
  );


  useEffect(() => {
    if (lookback && lookback !== "custom" && !isUpdatingFromUrl.current) {
      isUpdatingFromLookback.current = true;
      const { startDate: calculatedStart, endDate: calculatedEnd } =
      calculateDatesFromLookback(lookback);
      setStartDate(calculatedStart);
      setEndDate(calculatedEnd);
      updateUrlParams({ start: calculatedStart, end: calculatedEnd });
      setTimeout(() => {
        isUpdatingFromLookback.current = false;
      }, 100);
    }

  }, [lookback]);


  useEffect(() => {
    if (isUpdatingFromUrl.current) return;

    const searchStart = search?.start as string | undefined;
    const searchEnd = search?.end as string | undefined;
    const searchDatasourceId = search?.datasourceId as string | undefined;
    const searchLookback = search?.lookback as string | undefined;
    const searchConversationConfigId = search?.conversationConfigId as string | undefined;

    if (!isUpdatingFromLookback.current) {
      syncDatesFromUrl({
        searchStart,
        searchEnd,
        currentStartDate: startDate,
        currentEndDate: endDate,
        setStartDate,
        setEndDate
      });
    }

    syncStringParamFromUrl({
      searchValue: searchDatasourceId,
      currentValue: datasourceId,
      setValue: setDatasourceId
    });

    syncLookbackFromUrl({
      searchLookback,
      currentLookback: lookback,
      setLookback,
      setIsUpdatingFromUrl: (value) => {
        isUpdatingFromUrl.current = value;
      }
    });

    syncStringParamFromUrl({
      searchValue: searchConversationConfigId,
      currentValue: conversationConfigId,
      setValue: setConversationConfigId
    });

  }, [search?.start, search?.end, search?.datasourceId, search?.lookback, search?.conversationConfigId]);

  const handleStartDateChange = useCallback(
    (date: Date | undefined) => {
      setStartDate(date);
      updateUrlParams({ start: date });
      if (date && lookback !== "custom") {
        setLookback("custom");
        updateUrlParams({ lookback: "custom" });
      }
    },
    [updateUrlParams, lookback]
  );

  const handleEndDateChange = useCallback(
    (date: Date | undefined) => {
      setEndDate(date);
      updateUrlParams({ end: date });
      if (date && lookback !== "custom") {
        setLookback("custom");
        updateUrlParams({ lookback: "custom" });
      }
    },
    [updateUrlParams, lookback]
  );

  const handleDatasourceChange = useCallback(
    (value: string) => {
      setDatasourceId(value);
      updateUrlParams({ datasourceId: value });
    },
    [updateUrlParams]
  );

  const handleConversationConfigChange = useCallback(
    (value: string) => {
      setConversationConfigId(value);
      updateUrlParams({ conversationConfigId: value });
    },
    [updateUrlParams]
  );

  const handleLookbackChange = useCallback(
    (value: string) => {
      setLookback(value);
      updateUrlParams({ lookback: value });
    },
    [updateUrlParams]
  );

  const isSearchEnabled =
  datasourceId !== "" &&
  conversationConfigId !== "" && (
  lookback !== "custom" || startDate !== undefined && endDate !== undefined);

  return {
    startDate,
    endDate,
    datasourceId,
    lookback,
    conversationConfigId,
    handleStartDateChange,
    handleEndDateChange,
    handleDatasourceChange,
    handleConversationConfigChange,
    handleLookbackChange,
    isSearchEnabled,
    updateUrlParams
  };
}
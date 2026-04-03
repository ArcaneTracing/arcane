"use client";

import { useSearch, useNavigate, useLocation } from '@tanstack/react-router';
import { useCallback, useMemo, useRef, useEffect } from 'react';

export interface UrlTableStateOptions {
  search?: string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
}

export function useUrlTableState(defaults?: UrlTableStateOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const search = useSearch({ strict: false });
  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);
  const searchString = useMemo(() => JSON.stringify(search), [search]);

  const searchValue = useMemo(
    () => search.search || defaults?.search || '',
    [searchString, defaults?.search]
  );

  const sortKey = useMemo(
    () => search.sortKey || defaults?.sortKey || '',
    [searchString, defaults?.sortKey]
  );

  const sortDirection = useMemo(
    () => search.sortDirection as 'asc' | 'desc' || defaults?.sortDirection || 'desc',
    [searchString, defaults?.sortDirection]
  );

  const page = useMemo(
    () => Number.parseInt(search.page || '1', 10) || defaults?.page || 1,
    [searchString, defaults?.page]
  );

  const updateSearch = useCallback((value: string) => {
    const currentSearch = { ...searchRef.current };
    if (value.trim()) {
      currentSearch.search = value;
    } else {
      delete currentSearch.search;
    }
    delete currentSearch.page;
    navigate({
      to: location.pathname,
      search: currentSearch,
      replace: true
    });
  }, [navigate, location.pathname]);

  const updateSort = useCallback((key: string, direction: 'asc' | 'desc') => {
    const currentSearch = { ...searchRef.current };
    if (key) {
      currentSearch.sortKey = key;
      currentSearch.sortDirection = direction;
    } else {
      delete currentSearch.sortKey;
      delete currentSearch.sortDirection;
    }
    delete currentSearch.page;
    navigate({
      to: location.pathname,
      search: currentSearch,
      replace: true
    });
  }, [navigate, location.pathname]);

  const updatePage = useCallback((newPage: number) => {
    const currentSearch = { ...searchRef.current };
    if (newPage > 1) {
      currentSearch.page = newPage.toString();
    } else {
      delete currentSearch.page;
    }
    navigate({
      to: location.pathname,
      search: currentSearch,
      replace: true
    });
  }, [navigate, location.pathname]);

  return {
    search: searchValue,
    sortKey,
    sortDirection,
    page,
    updateSearch,
    updateSort,
    updatePage
  };
}
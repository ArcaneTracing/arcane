"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { lookbackOptions } from "@/lib/lookback-utils";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { SearchFilters } from "./types";

interface SearchFiltersProps {
  filters: SearchFilters;
  startDate?: Date;
  endDate?: Date;
  isSearchLoading: boolean;
  onFiltersChange: (updates: Partial<SearchFilters>) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onSearch: () => void;
}

export function SearchFiltersBar({
  filters,
  startDate,
  endDate,
  isSearchLoading,
  onFiltersChange,
  onStartDateChange,
  onEndDateChange,
  onSearch
}: Readonly<SearchFiltersProps>) {

  const isSearchEnabled =
  filters.datasourceId !== "" && (
  filters.lookback !== "custom" || startDate !== undefined && endDate !== undefined);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {}
      <div className="flex items-center gap-2">
        <label htmlFor="traces-lookback-select" className="text-sm font-medium whitespace-nowrap">Lookback</label>
        <Select
          value={filters.lookback}
          onValueChange={(value) => onFiltersChange({ lookback: value })}>

          <SelectTrigger id="traces-lookback-select" className="h-9 w-[200px]">
            <SelectValue placeholder="Select lookback period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom</SelectItem>
            {lookbackOptions.map((option) =>
            <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {}
      <div className="flex items-center gap-2 min-w-0">
        <label htmlFor="start-date" className="text-sm font-medium whitespace-nowrap">
          Start Date:
        </label>
        <DateTimePicker
          value={startDate}
          onChange={onStartDateChange}
          placeholder="Pick start date and time" />

      </div>

      <div className="flex items-center gap-2 min-w-0">
        <label htmlFor="end-date" className="text-sm font-medium whitespace-nowrap">
          End Date:
        </label>
        <DateTimePicker
          value={endDate}
          onChange={onEndDateChange}
          placeholder="Pick end date and time" />

      </div>

      {}
      <div className="flex items-center gap-2">
        <Input
          className="h-9 w-[120px]"
          placeholder="Min duration"
          value={filters.min_duration}
          onChange={(e) => onFiltersChange({ min_duration: e.target.value })} />

        <Input
          className="h-9 w-[120px]"
          placeholder="Max duration"
          value={filters.max_duration}
          onChange={(e) => onFiltersChange({ max_duration: e.target.value })} />

      </div>

      {}
      <div className="flex items-center gap-2">
        <label htmlFor="traces-limit-input" className="text-sm font-medium whitespace-nowrap">Limit</label>
        <Input
          id="traces-limit-input"
          className="h-9 w-[80px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          placeholder="20"
          value={filters.limit}
          onChange={(e) => onFiltersChange({ limit: Number.parseInt(e.target.value) || 20 })} />

      </div>

      {}
      <Button
        className="h-9 px-4"
        onClick={onSearch}
        disabled={!isSearchEnabled || isSearchLoading}>

        {isSearchLoading ?
        <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </> :

        'Search'
        }
      </Button>
    </div>);

}
import { renderHook, act } from "@testing-library/react";
import {
  calculateDatesFromLookback,
  useConversationsUrlState } from
"../use-conversations-url-state";

const mockUseSearch = global.mockUseSearch as jest.Mock;
const mockUseLocation = global.mockUseLocation as jest.Mock;
const mockNavigate = global.mockNavigate as jest.Mock;

describe("calculateDatesFromLookback", () => {
  it("returns { startDate, endDate } with endDate=now for valid lookback", () => {
    const { startDate, endDate } = calculateDatesFromLookback("1h");
    expect(startDate).toBeInstanceOf(Date);
    expect(endDate).toBeInstanceOf(Date);
    expect(endDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
  });

  it("for 1m, startDate is ~1 minute before endDate", () => {
    const before = Date.now();
    const { startDate, endDate } = calculateDatesFromLookback("1m");
    const after = Date.now();
    const diffMs = endDate.getTime() - startDate.getTime();
    expect(diffMs).toBeGreaterThanOrEqual(59 * 1000);
    expect(diffMs).toBeLessThanOrEqual(61 * 1000);
  });

  it("for 1d, startDate is ~1 day before endDate", () => {
    const { startDate, endDate } = calculateDatesFromLookback("1d");
    const diffMs = endDate.getTime() - startDate.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    expect(diffMs).toBeGreaterThanOrEqual(oneDay - 1000);
    expect(diffMs).toBeLessThanOrEqual(oneDay + 1000);
  });

  it("for invalid format, returns startDate=endDate=now", () => {
    const { startDate, endDate } = calculateDatesFromLookback("invalid");
    expect(startDate.getTime()).toBe(endDate.getTime());
  });
});

describe("useConversationsUrlState", () => {
  beforeEach(() => {
    mockUseSearch.mockReturnValue({});
    mockUseLocation.mockReturnValue({ pathname: "/projects/p1/conversations" });
    mockNavigate.mockClear();
  });

  it("returns all state fields and handlers", () => {
    const { result } = renderHook(useConversationsUrlState);
    expect(result.current.startDate).toBeUndefined();
    expect(result.current.endDate).toBeUndefined();
    expect(result.current.datasourceId).toBe("");
    expect(result.current.lookback).toBe("custom");
    expect(result.current.conversationConfigId).toBe("");
    expect(typeof result.current.handleStartDateChange).toBe("function");
    expect(typeof result.current.handleEndDateChange).toBe("function");
    expect(typeof result.current.handleDatasourceChange).toBe("function");
    expect(typeof result.current.handleConversationConfigChange).toBe("function");
    expect(typeof result.current.handleLookbackChange).toBe("function");
    expect(typeof result.current.updateUrlParams).toBe("function");
  });

  it("initializes state from search", () => {

    mockUseSearch.mockReturnValue({
      start: "2024-01-15T10:00:00.000Z",
      end: "2024-01-15T12:00:00.000Z",
      datasourceId: "ds1",
      lookback: "custom",
      conversationConfigId: "cfg1"
    });
    const { result } = renderHook(useConversationsUrlState);
    expect(result.current.startDate?.toISOString()).toBe("2024-01-15T10:00:00.000Z");
    expect(result.current.endDate?.toISOString()).toBe("2024-01-15T12:00:00.000Z");
    expect(result.current.datasourceId).toBe("ds1");
    expect(result.current.lookback).toBe("custom");
    expect(result.current.conversationConfigId).toBe("cfg1");
  });

  it("isSearchEnabled is false when datasourceId or conversationConfigId empty", () => {
    mockUseSearch.mockReturnValue({ datasourceId: "ds1" });
    const { result } = renderHook(useConversationsUrlState);
    expect(result.current.isSearchEnabled).toBe(false);
  });

  it("isSearchEnabled is false when lookback is custom and dates missing", () => {
    mockUseSearch.mockReturnValue({
      datasourceId: "ds1",
      conversationConfigId: "cfg1",
      lookback: "custom"
    });
    const { result } = renderHook(useConversationsUrlState);
    expect(result.current.isSearchEnabled).toBe(false);
  });

  it("isSearchEnabled is true when datasource, config and (lookback preset or both dates) set", () => {
    mockUseSearch.mockReturnValue({
      datasourceId: "ds1",
      conversationConfigId: "cfg1",
      lookback: "1h"
    });
    const { result } = renderHook(useConversationsUrlState);
    expect(result.current.isSearchEnabled).toBe(true);
  });

  it("updateUrlParams calls navigate with replace and search function", () => {
    const { result } = renderHook(useConversationsUrlState);
    act(() => {
      result.current.updateUrlParams({ datasourceId: "ds-new" });
    });
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        replace: true,
        to: "/projects/p1/conversations",
        search: expect.any(Function)
      })
    );
    const searchFn = mockNavigate.mock.calls[0][0].search;
    const applied = searchFn({});
    expect(applied.datasourceId).toBe("ds-new");
  });

  it("updateUrlParams removes key when value is empty string", () => {
    const { result } = renderHook(useConversationsUrlState);
    act(() => {
      result.current.updateUrlParams({ datasourceId: "" });
    });
    const searchFn = mockNavigate.mock.calls[0][0].search;
    const applied = searchFn({ datasourceId: "old" });
    expect(applied.datasourceId).toBeUndefined();
  });

  it("handleDatasourceChange updates datasourceId and calls updateUrlParams", () => {
    const { result } = renderHook(useConversationsUrlState);
    act(() => {
      result.current.handleDatasourceChange("ds-x");
    });
    expect(result.current.datasourceId).toBe("ds-x");
    expect(mockNavigate).toHaveBeenCalled();
  });

  it("handleLookbackChange updates lookback and calls updateUrlParams", () => {
    const { result } = renderHook(useConversationsUrlState);
    act(() => {
      result.current.handleLookbackChange("5m");
    });
    expect(result.current.lookback).toBe("5m");
    expect(mockNavigate).toHaveBeenCalled();
  });
});
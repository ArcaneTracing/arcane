import { renderHook, act } from "@testing-library/react";
import { useTraceDetailUrlState } from "../use-trace-detail-url-state";

const mockUseSearch = global.mockUseSearch as jest.Mock;
const mockUseLocation = global.mockUseLocation as jest.Mock;
const mockNavigate = global.mockNavigate as jest.Mock;

describe("useTraceDetailUrlState", () => {
  beforeEach(() => {

    mockUseSearch.mockReturnValue({ visualization: "graph" });
    mockUseLocation.mockReturnValue({ pathname: "/projects/p1/traces/ds1/trace1", search: "?visualization=graph" });
    mockNavigate.mockClear();
  });

  it("returns visualizationType and onVisualizationChange", () => {
    const { result } = renderHook(useTraceDetailUrlState);
    expect(result.current.visualizationType).toBe("graph");
    expect(typeof result.current.onVisualizationChange).toBe("function");
  });

  it("initializes visualizationType from search when present", () => {
    mockUseSearch.mockReturnValue({ visualization: "viewer" });
    mockUseLocation.mockReturnValue({
      pathname: "/p/traces/ds/t1",
      search: "?visualization=viewer"
    });
    const { result } = renderHook(useTraceDetailUrlState);
    expect(result.current.visualizationType).toBe("viewer");
  });

  it("defaults to graph when search has invalid visualization", () => {
    mockUseSearch.mockReturnValue({ visualization: "invalid" });
    const { result } = renderHook(useTraceDetailUrlState);
    expect(result.current.visualizationType).toBe("graph");
  });

  it("onVisualizationChange updates type and calls navigate", () => {
    mockUseLocation.mockReturnValue({
      pathname: "/projects/p1/traces/ds1/t1",
      search: ""
    });
    const { result } = renderHook(useTraceDetailUrlState);
    act(() => {
      result.current.onVisualizationChange("conversation");
    });
    expect(result.current.visualizationType).toBe("conversation");
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "/projects/p1/traces/ds1/t1",
        search: { visualization: "conversation" },
        replace: true
      })
    );
  });
});
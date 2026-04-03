import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TraceDetailPageContainer } from "../trace-detail-page-container"
import { render as customRender } from "@/__tests__/test-utils"

const mockUseParams = global.mockUseParams as jest.Mock
const mockNavigate = global.mockNavigate as jest.Mock
const mockUseLocation = global.mockUseLocation as jest.Mock

jest.mock("@/hooks/traces/use-trace-detail-url-state", () => ({
  useTraceDetailUrlState: jest.fn(() => ({
    visualizationType: "graph",
    onVisualizationChange: jest.fn(),
  })),
}))

jest.mock("@/hooks/traces/use-traces-query", () => ({
  useTraceQuery: jest.fn(() => ({
    data: { spans: [] },
    isLoading: false,
    error: null,
  })),
}))

jest.mock("@/hooks/datasources/use-datasources-query", () => ({
  useDatasourcesQuery: jest.fn(() => ({
    data: [{ id: "ds1", name: "DS1", type: "traces" }],
    isLoading: false,
    error: null,
  })),
}))

jest.mock("../trace-detail-page-view", () => ({
  TraceDetailPageView: (props: { onBack?: () => void }) => {
    const React = require("react")
    return React.createElement(
      "div",
      { "data-testid": "trace-detail-view" },
      React.createElement("button", {
        "data-testid": "back-button",
        onClick: () => props.onBack?.(),
      }, "Back")
    )
  },
}))

describe("TraceDetailPageContainer", () => {
  const originalHistoryBack = window.history.back
  const originalHistoryLength = Object.getOwnPropertyDescriptor(window.history, "length")

  beforeEach(() => {
    mockUseParams.mockReturnValue({
      projectId: "p1",
      organisationId: "o1",
      datasourceId: "ds1",
      traceId: "trace1",
    })
    mockUseLocation.mockReturnValue({ pathname: "/traces/ds1/trace1", search: "?q=foo&datasourceId=ds1" })
    mockNavigate.mockClear()
    window.history.back = jest.fn()
  })

  afterEach(() => {
    window.history.back = originalHistoryBack
    if (originalHistoryLength) {
      Object.defineProperty(window.history, "length", originalHistoryLength)
    }
  })

  it("renders TraceDetailPageView when trace and datasources are loaded", () => {
    customRender(<TraceDetailPageContainer />)
    expect(screen.getByTestId("trace-detail-view")).toBeInTheDocument()
  })

  it("renders Trace not found when trace is null and not loading", () => {
    const { useTraceQuery } = require("@/hooks/traces/use-traces-query") as {
      useTraceQuery: jest.Mock
    }
    useTraceQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: null,
    })
    customRender(<TraceDetailPageContainer />)
    expect(screen.getByText("Trace not found")).toBeInTheDocument()
  })

  it("calls history.back when Back is clicked and history.length > 1", async () => {
    Object.defineProperty(window.history, "length", { value: 2, configurable: true })
    customRender(<TraceDetailPageContainer />)
    await userEvent.click(screen.getByTestId("back-button"))
    expect(window.history.back).toHaveBeenCalledTimes(1)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("calls navigate with search params when Back is clicked and history.length <= 1", async () => {
    Object.defineProperty(window.history, "length", { value: 1, configurable: true })
    customRender(<TraceDetailPageContainer />)
    await userEvent.click(screen.getByTestId("back-button"))
    expect(window.history.back).not.toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.stringContaining("/traces"),
        params: { organisationId: "o1", projectId: "p1" },
        search: expect.objectContaining({ q: "foo", datasourceId: "ds1" }),
      })
    )
  })
})

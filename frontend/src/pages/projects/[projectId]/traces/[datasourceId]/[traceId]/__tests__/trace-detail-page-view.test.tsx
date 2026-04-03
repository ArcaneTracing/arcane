import React from "react"
import { screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TraceDetailPageView } from "../trace-detail-page-view"
import { render as customRender } from "@/__tests__/test-utils"

jest.mock("@/components/traces/graph/trace-graph", () => ({
  TraceGraph: () => {
    const React = require("react")
    return React.createElement("div", { "data-testid": "trace-graph" }, "TraceGraph")
  },
}))

jest.mock("@/components/traces/tree/trace-viewer", () => ({
  TraceViewer: () => {
    const React = require("react")
    return React.createElement("div", { "data-testid": "trace-viewer" }, "TraceViewer")
  },
}))

jest.mock("@/components/traces/conversation/trace-conversation", () => ({
  TraceConversation: () => {
    const React = require("react")
    return React.createElement("div", { "data-testid": "trace-conversation" }, "TraceConversation")
  },
}))

const mockTrace = {
  batches: [{ instrumentationLibrarySpans: [] }],
  spans: [],
} as any

function getDefaultProps(overrides: Partial<Parameters<typeof TraceDetailPageView>[0]> = {}) {
  return {
    trace: mockTrace,
    traceId: "trace-123",
    parentSpanName: null as string | null,
    allServiceNames: [] as string[],
    visualizationType: "graph" as const,
    onVisualizationChange: jest.fn(),
    onBack: jest.fn(),
    ...overrides,
  }
}

describe("TraceDetailPageView", () => {
  it("renders Back to Traces button that calls onBack when clicked", async () => {
    const onBack = jest.fn()
    customRender(<TraceDetailPageView {...getDefaultProps({ onBack })} />)
    const btn = screen.getByRole("button", { name: /back to traces/i })
    expect(btn).toBeInTheDocument()
    await userEvent.click(btn)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it("renders title as Trace {traceId} when parentSpanName is null", () => {
    customRender(<TraceDetailPageView {...getDefaultProps({ traceId: "t1", parentSpanName: null })} />)
    expect(screen.getByText("Trace t1")).toBeInTheDocument()
  })

  it("renders title as {parentSpanName}: {traceId} when parentSpanName is set", () => {
    customRender(
      <TraceDetailPageView {...getDefaultProps({ traceId: "t1", parentSpanName: "MySpan" })} />
    )
    expect(screen.getByText("MySpan: t1")).toBeInTheDocument()
  })

  it("renders allServiceNames when non-empty", () => {
    customRender(
      <TraceDetailPageView {...getDefaultProps({ allServiceNames: ["svc-a", "svc-b"] })} />
    )
    expect(screen.getByText("svc-a, svc-b")).toBeInTheDocument()
  })

  it("renders tabs: Trace Graph, Trace Viewer, Conversation", () => {
    customRender(<TraceDetailPageView {...getDefaultProps()} />)
    expect(screen.getByRole("tab", { name: /graph/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /viewer/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /conversation/i })).toBeInTheDocument()
  })

  it("renders TraceGraph when visualizationType is graph", () => {
    customRender(<TraceDetailPageView {...getDefaultProps({ visualizationType: "graph" })} />)
    expect(screen.getByTestId("trace-graph")).toBeInTheDocument()
    expect(screen.queryByTestId("trace-viewer")).not.toBeInTheDocument()
    expect(screen.queryByTestId("trace-conversation")).not.toBeInTheDocument()
  })

  it("renders TraceViewer when visualizationType is viewer", () => {
    customRender(<TraceDetailPageView {...getDefaultProps({ visualizationType: "viewer" })} />)
    expect(screen.getByTestId("trace-viewer")).toBeInTheDocument()
    expect(screen.queryByTestId("trace-graph")).not.toBeInTheDocument()
    expect(screen.queryByTestId("trace-conversation")).not.toBeInTheDocument()
  })

  it("renders TraceConversation when visualizationType is conversation", () => {
    customRender(<TraceDetailPageView {...getDefaultProps({ visualizationType: "conversation" })} />)
    expect(screen.getByTestId("conversation-disclaimer")).toBeInTheDocument()
    expect(screen.getByText(/how conversations are built/i)).toBeInTheDocument()
    expect(screen.getByTestId("trace-conversation")).toBeInTheDocument()
    expect(screen.queryByTestId("trace-graph")).not.toBeInTheDocument()
    expect(screen.queryByTestId("trace-viewer")).not.toBeInTheDocument()
  })

  it("calls onVisualizationChange when Conversation tab is clicked", async () => {
    const onVisualizationChange = jest.fn()
    customRender(
      <TraceDetailPageView {...getDefaultProps({ onVisualizationChange, visualizationType: "graph" })} />
    )
    const conversationTab = screen.getByRole("tab", { name: /conversation/i })
    await act(async () => {
      await userEvent.click(conversationTab)
    })
    expect(onVisualizationChange).toHaveBeenCalledWith("conversation")
  })
})

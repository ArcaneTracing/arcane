import React from "react"
import { render, screen } from "@testing-library/react"
import { ConversationsPageView } from "../conversations-page-view"
import { render as customRender } from "@/__tests__/test-utils"

function createUrlStateMock(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    startDate: undefined,
    endDate: undefined,
    datasourceId: "",
    lookback: "custom",
    conversationConfigId: "",
    handleStartDateChange: () => {},
    handleEndDateChange: () => {},
    handleDatasourceChange: () => {},
    handleConversationConfigChange: () => {},
    handleLookbackChange: () => {},
    isSearchEnabled: false,
    updateUrlParams: () => {},
    ...overrides,
  }
}

jest.mock("@/components/conversations/conversations-list", () => ({
  ConversationsList: () => {
    const React = require("react")
    return React.createElement("div", { "data-testid": "conversations-list" }, "ConversationsList")
  },
}))

jest.mock("@/components/ui/date-time-picker", () => ({
  DateTimePicker: (props: any) => {
    const React = require("react")
    const id = props.placeholder === "Pick start date and time" ? "start-date" : "end-date"
    return React.createElement("input", { type: "text", id, ...props })
  },
}))

describe("ConversationsPageView", () => {
  const defaultProps = {
    traceDatasources: [],
    configurations: [],
    isFetchLoading: false,
    isConfigLoading: false,
    hasDatasourcesPermissionError: false,
    hasConfigsPermissionError: false,
    urlState: createUrlStateMock(),
    onSearch: () => {},
    isSearchLoading: false,
    conversations: [],
    searchError: null,
  }

  it("renders header and Search button", () => {
    customRender(<ConversationsPageView {...defaultProps} />)
    expect(screen.getByText("Conversations")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Search$/i })).toBeInTheDocument()
  })

  it("renders ConversationsList", () => {
    customRender(<ConversationsPageView {...defaultProps} />)
    expect(screen.getByTestId("conversations-list")).toBeInTheDocument()
  })
})

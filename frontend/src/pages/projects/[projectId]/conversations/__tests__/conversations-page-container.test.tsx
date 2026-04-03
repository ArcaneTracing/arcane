import React from "react"
import { render, screen } from "@testing-library/react"
import { ConversationsPageContainer } from "../conversations-page-container"
import { render as customRender } from "@/__tests__/test-utils"
import { usePermissions } from "@/hooks/usePermissions"
import { PERMISSIONS } from "@/lib/permissions"

const mockUseParams = global.mockUseParams as jest.Mock
const mockUseSearch = global.mockUseSearch as jest.Mock
const mockUseLocation = global.mockUseLocation as jest.Mock

jest.mock("@/hooks/datasources/use-datasources-query", () => ({
  useDatasourcesListQuery: jest.fn(() => ({
    data: [
      {
        id: "ds1",
        name: "DS 1",
        description: null,
        type: "traces",
        source: "TEMPO",
        isSearchByQueryEnabled: true,
        isSearchByAttributesEnabled: true,
        isGetAttributeNamesEnabled: true,
        isGetAttributeValuesEnabled: true,
      },
    ],
    isLoading: false,
    error: null,
  })),
}))

jest.mock("@/hooks/conversation/use-conversation-query", () => ({
  useConversationConfigurationsQuery: jest.fn(() => ({
    data: [{ id: "cfg1", name: "Config 1" }],
    isLoading: false,
    error: null,
  })),
}))

jest.mock("@/hooks/conversation/use-conversations", () => ({
  useConversations: jest.fn(() => ({
    conversations: [],
    isSearchLoading: false,
    searchError: null,
    searchConversations: jest.fn(),
  })),
}))

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

jest.mock("@/hooks/usePermissions", () => ({
  usePermissions: jest.fn(),
}))

describe("ConversationsPageContainer", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ projectId: "p1", organisationId: "o1" })
    mockUseSearch.mockReturnValue({})
    mockUseLocation.mockReturnValue({ pathname: "/projects/p1/conversations" })
    ;(usePermissions as jest.Mock).mockReturnValue({
      permissions: { instance: [], organisation: [], project: [], all: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      hasPermission: jest.fn((perm: string) =>
        perm === PERMISSIONS.CONVERSATION.READ || perm === PERMISSIONS.DATASOURCE.READ
      ),
      hasAnyPermission: jest.fn(() => true),
      hasAllPermissions: jest.fn(() => true),
      isSuperAdmin: jest.fn(() => false),
    })
  })

  it("renders the view with header and Search button", () => {
    customRender(<ConversationsPageContainer />)
    expect(screen.getByText("Conversations")).toBeInTheDocument()
    expect(screen.getByText(/View and filter conversations by date range/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Search$/i })).toBeInTheDocument()
  })

  it("renders filter controls", () => {
    customRender(<ConversationsPageContainer />)
    expect(screen.getByLabelText(/^Datasource:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Configuration:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Lookback:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Start Date:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^End Date:/i)).toBeInTheDocument()
  })
})

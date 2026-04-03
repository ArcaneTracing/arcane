import React from "react"
import { render, screen } from "@testing-library/react"
import { UsersRolesPageContainer } from "../users-roles-page-container"
import { render as customRender } from "@/__tests__/test-utils"

const mockUseParams = global.mockUseParams as jest.Mock

jest.mock("@/hooks/projects/use-projects-query", () => ({
  useProjectQuery: jest.fn(() => ({
    data: {
      id: "p1",
      name: "Test Project",
      description: "Test Description",
      organisationId: "o1",
    },
    isLoading: false,
    error: null,
  })),
}))

jest.mock("../users-roles-page-view", () => ({
  UsersRolesPageView: ({ project, organisationId, projectId }: any) => (
    <div data-testid="users-roles-page-view">
      <div>Project: {project?.name}</div>
      <div>Org: {organisationId}</div>
      <div>Project ID: {projectId}</div>
    </div>
  ),
}))

describe("UsersRolesPageContainer", () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({
      projectId: "p1",
      organisationId: "o1",
    })
  })

  it("renders the view with project data", () => {
    customRender(<UsersRolesPageContainer />)
    expect(screen.getByTestId("users-roles-page-view")).toBeInTheDocument()
    expect(screen.getByText("Project: Test Project")).toBeInTheDocument()
    expect(screen.getByText("Org: o1")).toBeInTheDocument()
    expect(screen.getByText("Project ID: p1")).toBeInTheDocument()
  })

  it("handles loading state", () => {
    const { useProjectQuery } = require("@/hooks/projects/use-projects-query")
    useProjectQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    customRender(<UsersRolesPageContainer />)
    expect(screen.getByTestId("users-roles-page-view")).toBeInTheDocument()
  })

  it("handles error state", () => {
    const { useProjectQuery } = require("@/hooks/projects/use-projects-query")
    useProjectQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load"),
    })

    customRender(<UsersRolesPageContainer />)
    expect(screen.getByTestId("users-roles-page-view")).toBeInTheDocument()
  })
})

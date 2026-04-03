import React from "react"
import { render, screen } from "@testing-library/react"
import { ConfigurationsPageContent } from "../page"
import { render as customRender } from "@/__tests__/test-utils"
import { PERMISSIONS } from "@/lib/permissions"

const mockUseSearch = global.mockUseSearch as jest.Mock
const mockUseOrganisationIdOrNull = jest.fn(() => "org-1")
const mockUsePermissions = jest.fn()

jest.mock("@/hooks/useOrganisation", () => ({
  useOrganisationIdOrNull: () => mockUseOrganisationIdOrNull(),
}))

jest.mock("@/hooks/usePermissions", () => ({
  usePermissions: (...args: unknown[]) => mockUsePermissions(...args),
}))

jest.mock("@/components/configurations/entities/entities-tab", () => {
  const React = require("react")
  return { EntitiesTab: () => React.createElement("div", { "data-testid": "entities-tab" }, "Entities") }
})
jest.mock("@/components/configurations/conversations/conversation-tab", () => {
  const React = require("react")
  return { ConversationTab: () => React.createElement("div", { "data-testid": "conversation-tab" }, "Conversation") }
})
jest.mock("@/components/configurations/model-configurations/model-configurations-tab", () => {
  const React = require("react")
  return { ModelConfigurationsTab: () => React.createElement("div", { "data-testid": "model-configurations-tab" }, "AI Models") }
})
jest.mock("@/components/configurations/datasources/datasources-tab", () => {
  const React = require("react")
  return { DatasourcesTab: () => React.createElement("div", { "data-testid": "datasources-tab" }, "Data Sources") }
})
jest.mock("@/components/configurations/users/users-tab", () => {
  const React = require("react")
  return { UsersTab: () => React.createElement("div", { "data-testid": "users-tab" }, "Users") }
})
jest.mock("@/components/configurations/roles/roles-tab", () => {
  const React = require("react")
  return { RolesTab: () => React.createElement("div", { "data-testid": "roles-tab" }, "Roles") }
})
jest.mock("@/components/configurations/audit/audit-tab", () => {
  const React = require("react")
  return { AuditTab: () => React.createElement("div", { "data-testid": "audit-tab" }, "Audit") }
})
jest.mock("@/components/configurations/retention/organisation-retention-tab", () => {
  const React = require("react")
  return { OrganisationRetentionTab: () => React.createElement("div", { "data-testid": "retention-tab" }, "Retention") }
})
jest.mock("@/components/ComponentErrorBoundary", () => ({
  ComponentErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock("lucide-react", () => {
  const React = require("react")
  const MockIcon = () => React.createElement("span", { "data-testid": "mock-icon" })
  return {
    Users: MockIcon,
    Shield: MockIcon,
    FileText: MockIcon,
    Brain: MockIcon,
    MessageCircle: MockIcon,
    Database: MockIcon,
    ComponentIcon: MockIcon,
    Clock: MockIcon,
  }
})

describe("ConfigurationsPageContent", () => {
  beforeEach(() => {
    mockUseSearch.mockReturnValue({})
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn((perm: string) =>
        [
          PERMISSIONS.ORGANISATION.MEMBERS_READ,
          PERMISSIONS.ORGANISATION.ROLES_READ,
          PERMISSIONS.ORGANISATION.READ,
          PERMISSIONS.ORGANISATION.UPDATE,
          PERMISSIONS.ORGANISATION.CONFIGURATIONS_READ,
        ].includes(perm)
      ),
      permissions: { features: { enterprise: true } },
    })
  })

  it("renders Configurations header", () => {
    customRender(<ConfigurationsPageContent />)
    expect(screen.getByText("Configurations")).toBeInTheDocument()
    expect(
      screen.getByText(/Manage and track your configurations efficiently/)
    ).toBeInTheDocument()
  })

  it("shows Audit and Roles tabs when enterprise is true", () => {
    customRender(<ConfigurationsPageContent />)
    expect(screen.getByRole("tab", { name: /audit/i })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /roles/i })).toBeInTheDocument()
  })

  it("hides Audit and Roles tabs when enterprise is false", () => {
    mockUsePermissions.mockReturnValue({
      hasPermission: jest.fn((perm: string) =>
        [
          PERMISSIONS.ORGANISATION.MEMBERS_READ,
          PERMISSIONS.ORGANISATION.ROLES_READ,
          PERMISSIONS.ORGANISATION.READ,
          PERMISSIONS.ORGANISATION.UPDATE,
        ].includes(perm)
      ),
      permissions: { features: { enterprise: false } },
    })
    customRender(<ConfigurationsPageContent />)
    expect(screen.queryByRole("tab", { name: /audit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("tab", { name: /roles/i })).not.toBeInTheDocument()
  })
})

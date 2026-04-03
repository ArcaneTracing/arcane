import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersRolesPageView } from "../users-roles-page-view";
import { render as customRender } from "@/__tests__/test-utils";
import { ProjectResponse } from "@/types/projects";

const mockProject: ProjectResponse = {
  id: "p1",
  name: "Test Project",
  description: "Test Description",
  organisationId: "o1",
  createdAt: new Date(),
  updatedAt: new Date()
};

jest.mock("@/components/projects/users-roles/tables/users-table", () => ({
  UsersTable: ({ projectId, organisationId }: any) =>
  <div data-testid="users-table">
      Users Table - Project: {projectId}, Org: {organisationId}
    </div>

}));

jest.mock("@/components/projects/users-roles/tables/roles-table", () => ({
  RolesTable: ({ projectId, organisationId, onEdit }: any) =>
  <div data-testid="roles-table">
      Roles Table - Project: {projectId}, Org: {organisationId}
      <button onClick={() => onEdit({ id: "r1", name: "Test Role" })}>
        Edit Role
      </button>
    </div>

}));

jest.mock("@/components/projects/users-roles/audit-tab", () => ({
  AuditTab: ({ projectId, organisationId }: any) =>
  <div data-testid="audit-tab">
      Audit Tab - Project: {projectId}, Org: {organisationId}
    </div>

}));

jest.mock("@/components/projects/users-roles/dialogs/invite-user-dialog", () => ({
  InviteUserDialog: ({ open, onOpenChange, projectId }: any) =>
  <div data-testid="invite-user-dialog" data-open={open}>
      Invite Dialog - Project: {projectId}
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>

}));

jest.mock("@/components/projects/users-roles/dialogs/create-role-dialog", () => ({
  CreateRoleDialog: ({ open, onOpenChange, role, projectId }: any) =>
  <div data-testid="create-role-dialog" data-open={open}>
      Create Role Dialog - Project: {projectId}, Role: {role?.name || "null"}
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>

}));

jest.mock("@/components/PermissionGuard", () => ({
  PermissionGuard: ({ children, permission }: any) =>
  <div data-testid={`permission-guard-${permission}`}>{children}</div>

}));

jest.mock("@/components/projects/users-roles/attribute-visibility-tab", () => ({
  AttributeVisibilityTab: ({ projectId, organisationId }: any) =>
  <div data-testid="attribute-visibility-tab">
      Attribute Visibility - Project: {projectId}, Org: {organisationId}
    </div>

}));

const mockHasAnyPermission = jest.fn(() => false);
const mockUsePermissions = jest.fn(() => ({
  hasAnyPermission: mockHasAnyPermission,
  permissions: { features: { enterprise: true } }
}));
jest.mock("@/hooks/usePermissions", () => ({
  usePermissions: (...args: unknown[]) => mockUsePermissions(...args)
}));

describe("UsersRolesPageView", () => {
  beforeEach(() => {
    mockUsePermissions.mockReturnValue({
      hasAnyPermission: mockHasAnyPermission,
      permissions: { features: { enterprise: true } }
    });
  });

  const defaultProps = {
    project: mockProject,
    organisationId: "o1",
    projectId: "p1",
    isProjectLoading: false,
    projectError: null
  };

  it("renders header with project name", () => {
    customRender(<UsersRolesPageView {...defaultProps} />);
    expect(screen.getByText("Project Management")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Manage users, roles, attribute visibility, and audit logs for Test Project/
      )
    ).toBeInTheDocument();
  });

  it("renders tabs", () => {
    customRender(<UsersRolesPageView {...defaultProps} />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Roles")).toBeInTheDocument();
    expect(screen.getByText("Audit")).toBeInTheDocument();
  });

  it("renders Users tab content by default", () => {
    customRender(<UsersRolesPageView {...defaultProps} />);
    expect(screen.getByTestId("users-table")).toBeInTheDocument();
  });

  it("switches to Roles tab when clicked", async () => {
    const user = userEvent.setup();
    customRender(<UsersRolesPageView {...defaultProps} />);
    const rolesTab = screen.getByRole("tab", { name: "Roles" });
    await user.click(rolesTab);
    await waitFor(() => {
      expect(screen.getByTestId("roles-table")).toBeInTheDocument();
    });
  });

  it("switches to Audit tab when clicked", async () => {
    const user = userEvent.setup();
    customRender(<UsersRolesPageView {...defaultProps} />);
    const auditTab = screen.getByRole("tab", { name: "Audit" });
    await user.click(auditTab);
    await waitFor(() => {
      expect(screen.getByTestId("audit-tab")).toBeInTheDocument();
    });
  });

  it("shows Invite User button when Users tab is active", () => {
    customRender(<UsersRolesPageView {...defaultProps} />);
    expect(screen.getByText("Invite User")).toBeInTheDocument();
    expect(screen.getByTestId("permission-guard-projects:members:create")).toBeInTheDocument();
  });

  it("opens invite dialog when Invite User button is clicked", () => {
    customRender(<UsersRolesPageView {...defaultProps} />);
    const inviteButton = screen.getByText("Invite User");
    fireEvent.click(inviteButton);
    expect(screen.getByTestId("invite-user-dialog")).toHaveAttribute("data-open", "true");
  });

  it("shows Create Role button when Roles tab is active", async () => {
    const user = userEvent.setup();
    customRender(<UsersRolesPageView {...defaultProps} />);
    const rolesTab = screen.getByRole("tab", { name: "Roles" });
    await user.click(rolesTab);
    await waitFor(() => {
      expect(screen.getByText("Create Role")).toBeInTheDocument();
    });
    expect(screen.getByTestId("permission-guard-projects:roles:create")).toBeInTheDocument();
  });

  it("opens create role dialog when Create Role button is clicked", async () => {
    const user = userEvent.setup();
    customRender(<UsersRolesPageView {...defaultProps} />);
    const rolesTab = screen.getByRole("tab", { name: "Roles" });
    await user.click(rolesTab);
    await waitFor(() => {
      expect(screen.getByText("Create Role")).toBeInTheDocument();
    });
    const createButton = screen.getByText("Create Role");
    await user.click(createButton);
    expect(screen.getByTestId("create-role-dialog")).toHaveAttribute("data-open", "true");
  });

  it("handles edit role callback", async () => {
    const user = userEvent.setup();
    customRender(<UsersRolesPageView {...defaultProps} />);
    const rolesTab = screen.getByRole("tab", { name: "Roles" });
    await user.click(rolesTab);
    await waitFor(() => {
      expect(screen.getByText("Edit Role")).toBeInTheDocument();
    });
    const editButton = screen.getByText("Edit Role");
    await user.click(editButton);
    expect(screen.getByTestId("create-role-dialog")).toHaveAttribute("data-open", "true");
    expect(screen.getByText(/Role: Test Role/)).toBeInTheDocument();
  });

  it("shows loading state", () => {
    customRender(<UsersRolesPageView {...defaultProps} isProjectLoading={true} />);
    expect(screen.queryByText("Project Management")).not.toBeInTheDocument();

  });

  it("shows error state", () => {
    customRender(<UsersRolesPageView {...defaultProps} project={null} projectError={new Error("Failed")} />);
    expect(screen.getByText(/Failed to load project/)).toBeInTheDocument();
  });

  it("handles null project", () => {
    customRender(<UsersRolesPageView {...defaultProps} project={null} />);
    expect(screen.getByText(/Failed to load project/)).toBeInTheDocument();
  });

  it("shows Attribute Visibility tab when user has permission", async () => {
    mockHasAnyPermission.mockReturnValue(true);
    const user = userEvent.setup();
    customRender(<UsersRolesPageView {...defaultProps} />);
    expect(screen.getByText("Attribute Visibility")).toBeInTheDocument();
    const attributeVisibilityTab = screen.getByRole("tab", {
      name: "Attribute Visibility"
    });
    await user.click(attributeVisibilityTab);
    await waitFor(() => {
      expect(screen.getByTestId("attribute-visibility-tab")).toBeInTheDocument();
    });
    mockHasAnyPermission.mockReturnValue(false);
  });

  it("hides Audit and Attribute Visibility tabs when enterprise is false", () => {
    mockUsePermissions.mockReturnValue({
      hasAnyPermission: mockHasAnyPermission,
      permissions: { features: { enterprise: false } }
    });
    customRender(<UsersRolesPageView {...defaultProps} />);
    expect(screen.queryByRole("tab", { name: "Audit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Attribute Visibility" })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Roles" })).toBeInTheDocument();
  });

  it("hides Create Role button when enterprise is false", async () => {
    mockUsePermissions.mockReturnValue({
      hasAnyPermission: mockHasAnyPermission,
      permissions: { features: { enterprise: false } }
    });
    const user = userEvent.setup();
    customRender(<UsersRolesPageView {...defaultProps} />);
    const rolesTab = screen.getByRole("tab", { name: "Roles" });
    await user.click(rolesTab);
    await waitFor(() => {
      expect(screen.getByTestId("roles-table")).toBeInTheDocument();
    });
    expect(screen.queryByText("Create Role")).not.toBeInTheDocument();
  });
});
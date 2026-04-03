import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RolesTable } from "../roles-table";
import { render as customRender } from "@/__tests__/test-utils";
import { RoleResponse } from "@/types/rbac";

const mockProjectRoles = jest.fn();
const mockOnEdit = jest.fn();

jest.mock("@/hooks/projects/use-projects-query", () => ({
  useProjectRoles: () => mockProjectRoles()
}));

jest.mock("@/components/PermissionGuard", () => ({
  PermissionGuard: ({ children }: any) => <>{children}</>
}));

jest.mock("../../dialogs/delete-role-dialog", () => ({
  DeleteRoleDialog: ({ open, role, onOpenChange }: any) =>
  open ?
  <div data-testid="delete-role-dialog">
        Delete {role.name}
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div> :
  null
}));

describe("RolesTable", () => {
  const mockRoles: RoleResponse[] = [
  {
    id: "r1",
    name: "Member",
    description: "Member role",
    permissions: ["projects:read", "projects:update"],
    organisationId: "o1",
    projectId: "p1",
    isSystemRole: false,
    isInstanceLevel: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "r2",
    name: "Viewer",
    description: "Viewer role",
    permissions: ["projects:read"],
    organisationId: "o1",
    projectId: "p1",
    isSystemRole: false,
    isInstanceLevel: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }];


  beforeEach(() => {
    jest.clearAllMocks();
    mockProjectRoles.mockReturnValue({
      data: mockRoles,
      isLoading: false
    });
  });

  it("renders roles table", () => {
    customRender(
      <RolesTable
        projectId="p1"
        organisationId="o1"
        onEdit={mockOnEdit} />

    );
    expect(screen.getByText("Member")).toBeInTheDocument();
    expect(screen.getByText("Member role")).toBeInTheDocument();
    expect(screen.getByText("Viewer")).toBeInTheDocument();
  });

  it("displays role permissions", () => {
    customRender(
      <RolesTable
        projectId="p1"
        organisationId="o1"
        onEdit={mockOnEdit} />

    );
    expect(screen.getAllByText("projects:read").length).toBeGreaterThan(0);
    expect(screen.getByText("projects:update")).toBeInTheDocument();
  });

  it("shows '+X more' when role has more than 3 permissions", () => {
    const roleWithManyPermissions: RoleResponse = {
      id: "r3",
      name: "Admin",
      description: "Admin role",
      permissions: [
      "projects:read",
      "projects:update",
      "projects:delete",
      "projects:create",
      "datasets:read"],

      organisationId: "o1",
      projectId: "p1",
      isSystemRole: false,
      isInstanceLevel: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockProjectRoles.mockReturnValue({
      data: [roleWithManyPermissions],
      isLoading: false
    });

    customRender(
      <RolesTable
        projectId="p1"
        organisationId="o1"
        onEdit={mockOnEdit} />

    );
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("shows '-' when role has no description", () => {
    const roleWithoutDescription: RoleResponse = {
      id: "r4",
      name: "No Desc Role",
      description: null,
      permissions: ["projects:read"],
      organisationId: "o1",
      projectId: "p1",
      isSystemRole: false,
      isInstanceLevel: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockProjectRoles.mockReturnValue({
      data: [roleWithoutDescription],
      isLoading: false
    });

    customRender(
      <RolesTable
        projectId="p1"
        organisationId="o1"
        onEdit={mockOnEdit} />

    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("calls onEdit when Edit button is clicked", () => {
    customRender(
      <RolesTable
        projectId="p1"
        organisationId="o1"
        onEdit={mockOnEdit} />

    );

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockRoles[0]);
  });

  it("opens delete dialog when Delete button is clicked", () => {
    customRender(
      <RolesTable
        projectId="p1"
        organisationId="o1"
        onEdit={mockOnEdit} />

    );

    const deleteButtons = screen.getAllByRole("button", { name: /delete role/i });
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByTestId("delete-role-dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete Member")).toBeInTheDocument();
  });

  it("does not show Edit or Delete buttons for roles that cannot be deleted", () => {
    const nonDeletableRole: RoleResponse = {
      id: "r5",
      name: "System Role",
      description: "Cannot delete",
      permissions: ["projects:read"],
      organisationId: "o1",
      projectId: "p1",
      isSystemRole: true,
      isInstanceLevel: false,
      canDelete: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockProjectRoles.mockReturnValue({
      data: [nonDeletableRole],
      isLoading: false
    });

    customRender(
      <RolesTable
        projectId="p1"
        organisationId="o1"
        onEdit={mockOnEdit} />

    );

    expect(screen.queryByRole("button", { name: /delete role/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockProjectRoles.mockReturnValue({
      data: [],
      isLoading: true
    });

    customRender(
      <RolesTable
        projectId="p1"
        organisationId="o1"
        onEdit={mockOnEdit} />

    );

  });

  it("shows empty state when no roles", () => {
    mockProjectRoles.mockReturnValue({
      data: [],
      isLoading: false
    });

    customRender(
      <RolesTable
        projectId="p1"
        organisationId="o1"
        onEdit={mockOnEdit} />

    );
    expect(screen.getByText(/No roles created yet/)).toBeInTheDocument();
  });
});
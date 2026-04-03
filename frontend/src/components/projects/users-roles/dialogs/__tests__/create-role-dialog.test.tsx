import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateRoleDialog } from "../create-role-dialog";
import { render as customRender } from "@/__tests__/test-utils";
import { RoleResponse } from "@/types/rbac";

const mockCreateRole = jest.fn();
const mockUpdateRole = jest.fn();
const mockUseProjectRoles = jest.fn();

jest.mock("@/hooks/projects/use-projects-query", () => ({
  useCreateProjectRole: () => ({
    mutateAsync: mockCreateRole,
    isPending: false
  }),
  useUpdateProjectRole: () => ({
    mutateAsync: mockUpdateRole,
    isPending: false
  }),
  useProjectRoles: () => mockUseProjectRoles()
}));

jest.mock("@/hooks/shared/use-action-error", () => ({
  useActionError: () => ({
    message: null,
    clear: jest.fn(),
    handleError: jest.fn()
  })
}));

jest.mock("@/lib/toast", () => ({
  showSuccessToast: jest.fn()
}));

describe("CreateRoleDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders create dialog when open", () => {
    customRender(
      <CreateRoleDialog
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );

    const createRoleTexts = screen.getAllByText("Create Role");
    expect(createRoleTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/Create a new role with custom permissions/)).toBeInTheDocument();
  });

  it("renders edit dialog when role is provided", () => {
    const role: RoleResponse = {
      id: "r1",
      name: "Test Role",
      description: "Test Description",
      permissions: ["projects:read"],
      organisationId: "o1",
      projectId: "p1",
      isSystemRole: false,
      isInstanceLevel: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    customRender(
      <CreateRoleDialog
        projectId="p1"
        role={role}
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText("Edit Role")).toBeInTheDocument();
    expect(screen.getByText(/Update role details and permissions/)).toBeInTheDocument();
  });

  it("has role name input field", () => {
    customRender(
      <CreateRoleDialog
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByLabelText("Role Name")).toBeInTheDocument();
  });

  it("has description textarea field", () => {
    customRender(
      <CreateRoleDialog
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
  });

  it("pre-fills form when editing role", () => {
    const role: RoleResponse = {
      id: "r1",
      name: "Test Role",
      description: "Test Description",
      permissions: ["projects:read"],
      organisationId: "o1",
      projectId: "p1",
      isSystemRole: false,
      isInstanceLevel: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    customRender(
      <CreateRoleDialog
        projectId="p1"
        role={role}
        open={true}
        onOpenChange={jest.fn()} />

    );

    const nameInput = screen.getByLabelText("Role Name") as HTMLInputElement;
    const descriptionInput = screen.getByLabelText(/Description/) as HTMLTextAreaElement;

    expect(nameInput.value).toBe("Test Role");
    expect(descriptionInput.value).toBe("Test Description");
  });

  it("creates role when form is submitted", async () => {
    const onOpenChange = jest.fn();
    mockCreateRole.mockResolvedValue({});

    customRender(
      <CreateRoleDialog
        projectId="p1"
        open={true}
        onOpenChange={onOpenChange} />

    );

    const nameInput = screen.getByLabelText("Role Name");
    fireEvent.change(nameInput, { target: { value: "New Role" } });


    const permissionCheckbox = screen.getByLabelText(/projects:read/);
    fireEvent.click(permissionCheckbox);


    const createButton = screen.getByRole('button', { name: /Create Role/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateRole).toHaveBeenCalledWith({
        projectId: "p1",
        data: {
          name: "New Role",
          description: undefined,
          permissions: expect.arrayContaining(["projects:read"])
        }
      });
    });
  });

  it("updates role when editing", async () => {
    const onOpenChange = jest.fn();
    const role: RoleResponse = {
      id: "r1",
      name: "Test Role",
      description: "Test Description",
      permissions: ["projects:read"],
      organisationId: "o1",
      projectId: "p1",
      isSystemRole: false,
      isInstanceLevel: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUpdateRole.mockResolvedValue({});

    customRender(
      <CreateRoleDialog
        projectId="p1"
        role={role}
        open={true}
        onOpenChange={onOpenChange} />

    );

    const nameInput = screen.getByLabelText("Role Name");
    fireEvent.change(nameInput, { target: { value: "Updated Role" } });

    const updateButton = screen.getByText("Update Role");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith({
        projectId: "p1",
        roleId: "r1",
        data: {
          name: "Updated Role",
          description: "Test Description",
          permissions: ["projects:read"]
        }
      });
    });
  });

  it("disables submit button when name is empty", () => {
    customRender(
      <CreateRoleDialog
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );


    const createButton = screen.getByRole('button', { name: /Create Role/i });
    expect(createButton).toBeDisabled();
  });

  it("disables submit button when no permissions are selected", () => {
    customRender(
      <CreateRoleDialog
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );

    const nameInput = screen.getByLabelText("Role Name");
    fireEvent.change(nameInput, { target: { value: "New Role" } });


    const createButton = screen.getByRole('button', { name: /Create Role/i });
    expect(createButton).toBeDisabled();
  });

  it("closes dialog on cancel", () => {
    const onOpenChange = jest.fn();
    customRender(
      <CreateRoleDialog
        projectId="p1"
        open={true}
        onOpenChange={onOpenChange} />

    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("resets form when dialog closes", () => {
    const onOpenChange = jest.fn();
    const { rerender } = customRender(
      <CreateRoleDialog
        projectId="p1"
        open={true}
        onOpenChange={onOpenChange} />

    );

    const nameInput = screen.getByLabelText("Role Name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Test Role" } });
    expect(nameInput.value).toBe("Test Role");


    rerender(
      <CreateRoleDialog
        projectId="p1"
        open={false}
        onOpenChange={onOpenChange} />

    );


    rerender(
      <CreateRoleDialog
        projectId="p1"
        open={true}
        onOpenChange={onOpenChange} />

    );

    const newNameInput = screen.getByLabelText("Role Name") as HTMLInputElement;
    expect(newNameInput.value).toBe("");
  });
});
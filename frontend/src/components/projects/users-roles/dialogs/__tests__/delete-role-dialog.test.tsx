import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteRoleDialog } from "../delete-role-dialog";
import { render as customRender } from "@/__tests__/test-utils";
import { RoleResponse } from "@/types/rbac";

const mockDeleteRole = jest.fn();
const mockUseDeleteProjectRole = jest.fn();

jest.mock("@/hooks/projects/use-projects-query", () => ({
  useDeleteProjectRole: () => mockUseDeleteProjectRole()
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

describe("DeleteRoleDialog", () => {
  const mockRole: RoleResponse = {
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeleteProjectRole.mockReturnValue({
      mutateAsync: mockDeleteRole,
      isPending: false
    });
  });

  it("renders dialog when open", () => {
    customRender(
      <DeleteRoleDialog
        role={mockRole}
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );

    const deleteRoleTexts = screen.getAllByText("Delete Role");
    expect(deleteRoleTexts.length).toBeGreaterThan(0);
    expect(screen.getByText(/Are you sure you want to delete the role "Test Role"/)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    customRender(
      <DeleteRoleDialog
        role={mockRole}
        projectId="p1"
        open={false}
        onOpenChange={jest.fn()} />

    );
    expect(screen.queryByText("Delete Role")).not.toBeInTheDocument();
  });

  it("displays role name in confirmation message", () => {
    customRender(
      <DeleteRoleDialog
        role={mockRole}
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByText(/Test Role/)).toBeInTheDocument();
  });

  it("deletes role when confirmed", async () => {
    const onOpenChange = jest.fn();
    mockDeleteRole.mockResolvedValue({});

    customRender(
      <DeleteRoleDialog
        role={mockRole}
        projectId="p1"
        open={true}
        onOpenChange={onOpenChange} />

    );


    const deleteButtons = screen.getAllByText("Delete Role");
    const deleteButton = deleteButtons[deleteButtons.length - 1];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteRole).toHaveBeenCalledWith({
        projectId: "p1",
        roleId: "r1"
      });
    });

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("closes dialog on cancel", () => {
    const onOpenChange = jest.fn();
    customRender(
      <DeleteRoleDialog
        role={mockRole}
        projectId="p1"
        open={true}
        onOpenChange={onOpenChange} />

    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows loading state when deleting", () => {
    mockUseDeleteProjectRole.mockReturnValue({
      mutateAsync: mockDeleteRole,
      isPending: true
    });

    customRender(
      <DeleteRoleDialog
        role={mockRole}
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );

    expect(screen.getByText(/Deleting.../)).toBeInTheDocument();
    const deleteButton = screen.getByText(/Deleting.../);
    expect(deleteButton).toBeDisabled();
  });
});
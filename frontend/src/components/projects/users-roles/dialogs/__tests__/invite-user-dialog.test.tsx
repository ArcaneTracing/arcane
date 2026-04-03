import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InviteUserDialog } from "../invite-user-dialog";
import { render as customRender } from "@/__tests__/test-utils";

const mockInviteUser = jest.fn();
const mockUseProjectRoles = jest.fn();
const mockUseAvailableUsers = jest.fn();

jest.mock("@/hooks/projects/use-projects-query", () => ({
  useInviteUser: () => ({
    mutateAsync: mockInviteUser,
    isPending: false
  }),
  useProjectRoles: () => mockUseProjectRoles(),
  useAvailableUsers: () => mockUseAvailableUsers()
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

describe("InviteUserDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProjectRoles.mockReturnValue({
      data: [
      { id: "r1", name: "Member" },
      { id: "r2", name: "Viewer" }]

    });
    mockUseAvailableUsers.mockReturnValue({
      data: [
      { email: "user1@example.com", name: "User One" },
      { email: "user2@example.com", name: "User Two" }],

      isLoading: false
    });
  });

  it("renders dialog when open", () => {
    customRender(
      <InviteUserDialog
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByRole("heading", { name: "Invite User" })).toBeInTheDocument();
    expect(screen.getByText(/Add a new user to this project/)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    customRender(
      <InviteUserDialog
        projectId="p1"
        open={false}
        onOpenChange={jest.fn()} />

    );
    expect(screen.queryByRole("heading", { name: "Invite User" })).not.toBeInTheDocument();
  });

  it("renders with trigger", () => {
    customRender(
      <InviteUserDialog
        projectId="p1"
        open={false}
        onOpenChange={jest.fn()}
        trigger={<button>Open Dialog</button>} />

    );
    expect(screen.getByText("Open Dialog")).toBeInTheDocument();
  });

  it("has email input field", () => {
    customRender(
      <InviteUserDialog
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("has role select field", () => {
    customRender(
      <InviteUserDialog
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );
    expect(screen.getByLabelText(/Assign Role/)).toBeInTheDocument();
  });

  it("invites user when form is submitted", async () => {
    const onOpenChange = jest.fn();
    mockInviteUser.mockResolvedValue({});

    customRender(
      <InviteUserDialog
        projectId="p1"
        open={true}
        onOpenChange={onOpenChange} />

    );

    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });

    const inviteButton = screen.getByRole("button", { name: "Invite User" });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(mockInviteUser).toHaveBeenCalledWith({
        projectId: "p1",
        data: {
          email: "newuser@example.com"
        }
      });
    });
  });

  it("invites user with role when role is selected", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    mockInviteUser.mockResolvedValue({});

    customRender(
      <InviteUserDialog
        projectId="p1"
        open={true}
        onOpenChange={onOpenChange} />

    );

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "newuser@example.com");


    const roleSelect = screen.getByLabelText(/Assign Role/);
    await user.click(roleSelect);
    const memberOption = await screen.findByText("Member");
    await user.click(memberOption);

    const inviteButton = screen.getByRole("button", { name: "Invite User" });
    await user.click(inviteButton);

    await waitFor(() => {
      expect(mockInviteUser).toHaveBeenCalledWith({
        projectId: "p1",
        data: {
          email: "newuser@example.com",
          roleId: "r1"
        }
      });
    });
  });

  it("disables invite button when email is empty", () => {
    customRender(
      <InviteUserDialog
        projectId="p1"
        open={true}
        onOpenChange={jest.fn()} />

    );

    const inviteButton = screen.getByRole("button", { name: "Invite User" });
    expect(inviteButton).toBeDisabled();
  });

  it("closes dialog on cancel", () => {
    const onOpenChange = jest.fn();
    customRender(
      <InviteUserDialog
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
      <InviteUserDialog
        projectId="p1"
        open={true}
        onOpenChange={onOpenChange} />

    );

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");


    rerender(
      <InviteUserDialog
        projectId="p1"
        open={false}
        onOpenChange={onOpenChange} />

    );


    rerender(
      <InviteUserDialog
        projectId="p1"
        open={true}
        onOpenChange={onOpenChange} />

    );

    const newEmailInput = screen.getByLabelText("Email") as HTMLInputElement;
    expect(newEmailInput.value).toBe("");
  });
});
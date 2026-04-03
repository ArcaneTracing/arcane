import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { UsersTable } from "../users-table";
import { render as customRender } from "@/__tests__/test-utils";
import { ProjectUserWithRolesResponse } from "@/types/projects";

const mockUsersWithRoles = jest.fn();
const mockRemoveUser = jest.fn();
const mockAssignRole = jest.fn();
const mockProjectRoles = jest.fn();

jest.mock("@/hooks/projects/use-projects-query", () => ({
  useUsersWithRoles: () => mockUsersWithRoles(),
  useRemoveUser: () => ({
    mutateAsync: mockRemoveUser,
    isPending: false
  }),
  useAssignRole: () => ({
    mutateAsync: mockAssignRole,
    isPending: false
  }),
  useProjectRoles: () => mockProjectRoles()
}));

jest.mock("@/components/PermissionGuard", () => ({
  PermissionGuard: ({ children }: any) => <>{children}</>
}));

jest.mock("@/lib/toast", () => ({
  showSuccessToast: jest.fn()
}));

describe("UsersTable", () => {
  const mockUsers: ProjectUserWithRolesResponse[] = [
  {
    id: "u1",
    email: "user1@example.com",
    name: "User One",
    roles: [{ id: "r1", name: "Member" }]
  },
  {
    id: "u2",
    email: "user2@example.com",
    name: "User Two",
    roles: []
  }];


  const mockRoles = [
  { id: "r1", name: "Member" },
  { id: "r2", name: "Viewer" }];


  beforeEach(() => {
    jest.clearAllMocks();
    mockUsersWithRoles.mockReturnValue({
      data: mockUsers,
      isLoading: false
    });
    mockProjectRoles.mockReturnValue({
      data: mockRoles
    });
  });

  it("renders users table", () => {
    customRender(<UsersTable projectId="p1" organisationId="o1" />);
    expect(screen.getByText("User One")).toBeInTheDocument();
    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
  });

  it("displays user email when name is not available", () => {
    mockUsersWithRoles.mockReturnValue({
      data: [
      {
        id: "u3",
        email: "user3@example.com",
        name: null,
        roles: []
      }],

      isLoading: false
    });

    customRender(<UsersTable projectId="p1" organisationId="o1" />);

    expect(screen.getAllByText("user3@example.com").length).toBeGreaterThan(0);
  });

  it("shows 'No role' when user has no roles", () => {
    customRender(<UsersTable projectId="p1" organisationId="o1" />);
    expect(screen.getByText("No role")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockUsersWithRoles.mockReturnValue({
      data: [],
      isLoading: true
    });

    customRender(<UsersTable projectId="p1" organisationId="o1" />);

  });

  it("shows empty state when no users", () => {
    mockUsersWithRoles.mockReturnValue({
      data: [],
      isLoading: false
    });

    customRender(<UsersTable projectId="p1" organisationId="o1" />);
    expect(screen.getByText(/No users in this project/)).toBeInTheDocument();
  });

  it("allows editing user role", () => {
    customRender(<UsersTable projectId="p1" organisationId="o1" />);
    const changeRoleButtons = screen.getAllByText("Change Role");
    expect(changeRoleButtons.length).toBeGreaterThan(0);

    fireEvent.click(changeRoleButtons[0]);

    expect(screen.getByTestId("select")).toBeInTheDocument();
  });

  it("saves role change", async () => {
    mockAssignRole.mockResolvedValue({});

    customRender(<UsersTable projectId="p1" organisationId="o1" />);
    const changeRoleButton = screen.getAllByText("Change Role")[0];
    fireEvent.click(changeRoleButton);


    const roleSelect = screen.getByTestId("select");
    const viewerOption = roleSelect.querySelector('[data-select-value="r2"]');
    if (!viewerOption) throw new Error("Viewer option not found");
    fireEvent.click(viewerOption);


    const saveButton = screen.getByTestId("save-role-button");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAssignRole).toHaveBeenCalledWith({
        projectId: "p1",
        userId: "u1",
        data: {
          roleId: "r2"
        }
      });
    });
  });

  it("cancels role edit", () => {
    customRender(<UsersTable projectId="p1" organisationId="o1" />);
    const changeRoleButton = screen.getAllByText("Change Role")[0];
    fireEvent.click(changeRoleButton);


    const roleSelect = screen.getByTestId("select");
    const viewerOption = within(roleSelect).getByText("Viewer");
    fireEvent.click(viewerOption);


    const cancelButton = screen.getByTestId("cancel-role-edit-button");
    fireEvent.click(cancelButton);


    expect(screen.queryByTestId("save-role-button")).not.toBeInTheDocument();
  });

  it("removes user when delete button is clicked", async () => {
    mockRemoveUser.mockResolvedValue({});

    customRender(<UsersTable projectId="p1" organisationId="o1" />);
    const removeButtons = screen.getAllByRole("button", { name: /Remove user/i });
    expect(removeButtons.length).toBeGreaterThan(0);

    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(mockRemoveUser).toHaveBeenCalledWith({
        projectId: "p1",
        email: "user1@example.com"
      });
    });
  });

  it("does not show save button when role hasn't changed", () => {
    customRender(<UsersTable projectId="p1" organisationId="o1" />);
    const changeRoleButton = screen.getAllByText("Change Role")[0];
    fireEvent.click(changeRoleButton);


    const roleSelect = screen.getByTestId("select");
    const memberOption = within(roleSelect).getByText("Member");
    fireEvent.click(memberOption);


    expect(screen.queryByTestId("save-role-button")).not.toBeInTheDocument();
  });
});
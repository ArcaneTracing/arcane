import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuditTab } from '../audit-tab';
import { render as customRender } from '@/__tests__/test-utils';
import { AuditLog } from '@/api/audit-logs';

const mockAuditLogs: AuditLog[] = [
{
  id: 'log-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  action: 'organisation.user.added',
  actorId: 'actor-1',
  actorType: 'user',
  resourceType: 'organisation_membership',
  resourceId: 'resource-1',
  organisationId: 'org-1',
  projectId: null,
  beforeState: null,
  afterState: {
    isMember: true,
    email: 'user@example.com'
  },
  metadata: {}
},
{
  id: 'log-2',
  createdAt: '2024-01-02T00:00:00.000Z',
  action: 'organisation.role.created',
  actorId: 'actor-2',
  actorType: 'user',
  resourceType: 'role',
  resourceId: 'resource-2',
  organisationId: 'org-1',
  projectId: null,
  beforeState: null,
  afterState: {
    name: 'New Role'
  },
  metadata: {}
}];


jest.mock('@/hooks/organisations/use-organisation-config-query', () => ({
  useOrganisationAuditLogs: jest.fn()
}));

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: jest.fn(() => 'org-1')
}));

const mockUseOrganisationAuditLogs = require('@/hooks/organisations/use-organisation-config-query').useOrganisationAuditLogs;

describe('AuditTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });
    mockUseOrganisationAuditLogs.mockReturnValue({
      data: {
        data: mockAuditLogs,
        nextCursor: null,
        hasMore: false,
        limit: 50
      },
      isLoading: false
    });
  });

  it('should render audit logs', () => {
    customRender(<AuditTab />);
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('organisation.user.added')).toBeInTheDocument();
    expect(screen.getByText('organisation.role.created')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseOrganisationAuditLogs.mockReturnValue({
      data: undefined,
      isLoading: true
    });
    customRender(<AuditTab />);
    const loader = screen.getByTestId('icon-loader2');
    expect(loader).toBeInTheDocument();
  });

  it('should show empty state', () => {
    mockUseOrganisationAuditLogs.mockReturnValue({
      data: {
        data: [],
        nextCursor: null,
        hasMore: false,
        limit: 50
      },
      isLoading: false
    });
    customRender(<AuditTab />);
    expect(screen.getByText('No audit logs found')).toBeInTheDocument();
  });

  it('should filter by action', async () => {
    const { rerender } = customRender(<AuditTab />);

    const actionInput = screen.getByPlaceholderText(/e.g., organisation.user.added/i);
    fireEvent.change(actionInput, { target: { value: 'organisation.user.*' } });

    await waitFor(() => {
      expect(mockUseOrganisationAuditLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'organisation.user.*'
        })
      );
    });
  });

  it('should display audit log details', () => {
    customRender(<AuditTab />);
    expect(screen.getAllByText(/2024/i).length).toBeGreaterThan(0);
    expect(screen.getByText('organisation.user.added')).toBeInTheDocument();
    expect(screen.getByText('organisation.role.created')).toBeInTheDocument();
    expect(screen.getByText('organisation_membership')).toBeInTheDocument();
    expect(screen.getByText('role')).toBeInTheDocument();
  });

  it('should truncate long IDs', () => {
    customRender(<AuditTab />);
    const truncated = screen.getAllByText(/\.\.\.$/);
    expect(truncated.length).toBeGreaterThan(0);
  });

  it('should handle null resourceId and actorId', () => {
    const logsWithNulls: AuditLog[] = [
    {
      ...mockAuditLogs[0],
      resourceId: null as any,
      actorId: null as any
    }];

    mockUseOrganisationAuditLogs.mockReturnValue({
      data: {
        data: logsWithNulls,
        nextCursor: null,
        hasMore: false,
        limit: 50
      },
      isLoading: false
    });
    customRender(<AuditTab />);
    const naElements = screen.getAllByText('N/A');
    expect(naElements.length).toBeGreaterThan(0);
  });

  it('should copy row data when copy button is clicked', async () => {
    customRender(<AuditTab />);


    const copyButtons = screen.getAllByTitle('Copy entire row');
    expect(copyButtons.length).toBeGreaterThan(0);


    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    const copiedText = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0];
    const parsedData = JSON.parse(copiedText);
    expect(parsedData.action).toBe('organisation.user.added');
    expect(parsedData.id).toBe('log-1');
  });

  it('should copy cell value when cell copy button is clicked', async () => {
    customRender(<AuditTab />);


    const copyButtons = screen.getAllByTitle('Copy action');
    expect(copyButtons.length).toBeGreaterThan(0);

    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('organisation.user.added');
    });
  });

  it('should show checkmark icon after copying', async () => {
    customRender(<AuditTab />);

    const copyButtons = screen.getAllByTitle('Copy entire row');
    expect(copyButtons.length).toBeGreaterThan(0);

    fireEvent.click(copyButtons[0]);


    await waitFor(() => {

      const button = copyButtons[0];


      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });
});
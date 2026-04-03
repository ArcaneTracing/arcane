import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrganisationRetentionTab } from '../organisation-retention-tab';
import { render as customRender } from '@/__tests__/test-utils';

const mockUpdateRetention = jest.fn();
const mockUseOrganisationRetention = jest.fn();
const mockUseOrganisationIdOrNull = jest.fn();

jest.mock('@/hooks/retention/use-organisation-retention', () => ({
  useOrganisationRetention: () => mockUseOrganisationRetention()
}));

jest.mock('@/hooks/useOrganisation', () => ({
  useOrganisationIdOrNull: () => mockUseOrganisationIdOrNull()
}));

jest.mock('@/hooks/shared/use-action-error', () => ({
  useActionError: () => ({
    handleError: jest.fn()
  })
}));

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn()
}));

describe('OrganisationRetentionTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrganisationIdOrNull.mockReturnValue('org-1');
    mockUseOrganisationRetention.mockReturnValue({
      data: { auditLogRetentionDays: 365 },
      isLoading: false,
      updateRetention: mockUpdateRetention,
      isUpdating: false
    });
  });

  it('renders retention settings form', () => {
    customRender(<OrganisationRetentionTab />);

    expect(screen.getByText('Data Retention Settings')).toBeInTheDocument();
    expect(
      screen.getByText(/Configure how long data is retained before automatic deletion/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Audit Log Retention/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseOrganisationRetention.mockReturnValue({
      data: null,
      isLoading: true,
      updateRetention: mockUpdateRetention,
      isUpdating: false
    });

    customRender(<OrganisationRetentionTab />);

    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('displays current retention value', () => {
    customRender(<OrganisationRetentionTab />);

    const input = screen.getByLabelText(/Audit Log Retention/i) as HTMLInputElement;
    expect(input.value).toBe('365');
  });

  it('displays default value when retention is null', () => {
    mockUseOrganisationRetention.mockReturnValue({
      data: { auditLogRetentionDays: null },
      isLoading: false,
      updateRetention: mockUpdateRetention,
      isUpdating: false
    });

    customRender(<OrganisationRetentionTab />);

    const input = screen.getByLabelText(/Audit Log Retention/i) as HTMLInputElement;
    expect(input.value).toBe('365');
  });

  it('updates input value when user types', () => {
    customRender(<OrganisationRetentionTab />);

    const input = screen.getByLabelText(/Audit Log Retention/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '730' } });

    expect(input.value).toBe('730');
  });

  it('shows save button when value changes', () => {
    customRender(<OrganisationRetentionTab />);

    const input = screen.getByLabelText(/Audit Log Retention/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '730' } });

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls updateRetention when form is submitted', async () => {
    customRender(<OrganisationRetentionTab />);

    const input = screen.getByLabelText(/Audit Log Retention/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '730' } });

    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockUpdateRetention).toHaveBeenCalledWith({ auditLogRetentionDays: 730 });
    });
  });

  it('does not submit invalid values', () => {
    customRender(<OrganisationRetentionTab />);

    const input = screen.getByLabelText(/Audit Log Retention/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '10' } });

    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(mockUpdateRetention).not.toHaveBeenCalled();
  });

  it('resets value when cancel is clicked', () => {
    customRender(<OrganisationRetentionTab />);

    const input = screen.getByLabelText(/Audit Log Retention/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '730' } });
    expect(input.value).toBe('730');

    fireEvent.click(screen.getByText('Cancel'));

    expect(input.value).toBe('365');
  });

  it('shows loading state on save button when updating', () => {
    mockUseOrganisationRetention.mockReturnValue({
      data: { auditLogRetentionDays: 365 },
      isLoading: false,
      updateRetention: mockUpdateRetention,
      isUpdating: true
    });

    customRender(<OrganisationRetentionTab />);

    const input = screen.getByLabelText(/Audit Log Retention/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '730' } });

    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).toBeDisabled();
  });

  it('displays current settings section', () => {
    customRender(<OrganisationRetentionTab />);

    expect(screen.getByText('Current Settings')).toBeInTheDocument();
    expect(screen.getByText(/Audit Logs:/)).toBeInTheDocument();
    expect(screen.getByText('365 days')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RetentionTab } from '../retention-tab';
import { render as customRender } from '@/__tests__/test-utils';

const mockUpdateRetention = jest.fn();
const mockUseProjectRetention = jest.fn();

jest.mock('@/hooks/retention/use-project-retention', () => ({
  useProjectRetention: () => mockUseProjectRetention()
}));

jest.mock('@/hooks/shared/use-action-error', () => ({
  useActionError: () => ({
    handleError: jest.fn()
  })
}));

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn()
}));

describe('RetentionTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProjectRetention.mockReturnValue({
      data: {
        evaluationRetentionDays: 90,
        experimentRetentionDays: 90
      },
      isLoading: false,
      updateRetention: mockUpdateRetention,
      isUpdating: false
    });
  });

  it('renders retention settings form', () => {
    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    expect(screen.getByText('Data Retention Settings')).toBeInTheDocument();
    expect(
      screen.getByText(/Configure how long evaluations and experiments are retained/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Evaluation Retention/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Experiment Retention/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseProjectRetention.mockReturnValue({
      data: null,
      isLoading: true,
      updateRetention: mockUpdateRetention,
      isUpdating: false
    });

    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    expect(screen.getByTestId('icon-loader2')).toBeInTheDocument();
  });

  it('displays current retention values', () => {
    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    const evalInput = screen.getByLabelText(/Evaluation Retention/i) as HTMLInputElement;
    const expInput = screen.getByLabelText(/Experiment Retention/i) as HTMLInputElement;

    expect(evalInput.value).toBe('90');
    expect(expInput.value).toBe('90');
  });

  it('displays default values when retention is null', () => {
    mockUseProjectRetention.mockReturnValue({
      data: {
        evaluationRetentionDays: null,
        experimentRetentionDays: null
      },
      isLoading: false,
      updateRetention: mockUpdateRetention,
      isUpdating: false
    });

    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    const evalInput = screen.getByLabelText(/Evaluation Retention/i) as HTMLInputElement;
    const expInput = screen.getByLabelText(/Experiment Retention/i) as HTMLInputElement;

    expect(evalInput.value).toBe('90');
    expect(expInput.value).toBe('90');
  });

  it('updates input values when user types', () => {
    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    const evalInput = screen.getByLabelText(/Evaluation Retention/i) as HTMLInputElement;
    fireEvent.change(evalInput, { target: { value: '180' } });

    expect(evalInput.value).toBe('180');
  });

  it('shows save button when values change', () => {
    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    const evalInput = screen.getByLabelText(/Evaluation Retention/i) as HTMLInputElement;
    fireEvent.change(evalInput, { target: { value: '180' } });

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls updateRetention when form is submitted', async () => {
    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    const evalInput = screen.getByLabelText(/Evaluation Retention/i) as HTMLInputElement;
    const expInput = screen.getByLabelText(/Experiment Retention/i) as HTMLInputElement;

    fireEvent.change(evalInput, { target: { value: '180' } });
    fireEvent.change(expInput, { target: { value: '180' } });

    const form = evalInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockUpdateRetention).toHaveBeenCalledWith({
        evaluationRetentionDays: 180,
        experimentRetentionDays: 180
      });
    });
  });

  it('does not submit invalid values', () => {
    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    const evalInput = screen.getByLabelText(/Evaluation Retention/i) as HTMLInputElement;
    fireEvent.change(evalInput, { target: { value: '5' } });

    const form = evalInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(mockUpdateRetention).not.toHaveBeenCalled();
  });

  it('resets values when cancel is clicked', () => {
    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    const evalInput = screen.getByLabelText(/Evaluation Retention/i) as HTMLInputElement;
    fireEvent.change(evalInput, { target: { value: '180' } });
    expect(evalInput.value).toBe('180');

    fireEvent.click(screen.getByText('Cancel'));

    expect(evalInput.value).toBe('90');
  });

  it('shows warning alert about experiment deletion', () => {
    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    expect(
      screen.getByText(/Deleting experiments will also delete all evaluations/)
    ).toBeInTheDocument();
  });

  it('shows loading state on save button when updating', () => {
    mockUseProjectRetention.mockReturnValue({
      data: {
        evaluationRetentionDays: 90,
        experimentRetentionDays: 90
      },
      isLoading: false,
      updateRetention: mockUpdateRetention,
      isUpdating: true
    });

    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    const evalInput = screen.getByLabelText(/Evaluation Retention/i) as HTMLInputElement;
    fireEvent.change(evalInput, { target: { value: '180' } });

    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).toBeDisabled();
  });

  it('displays current settings section', () => {
    customRender(
      <RetentionTab organisationId="org-1" projectId="project-1" />
    );

    expect(screen.getByText('Current Settings')).toBeInTheDocument();
    expect(screen.getByText(/Evaluations:/)).toBeInTheDocument();
    expect(screen.getByText(/Experiments:/)).toBeInTheDocument();

    const daysTexts = screen.getAllByText('90 days');
    expect(daysTexts.length).toBeGreaterThan(0);
  });
});
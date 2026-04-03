import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileModal } from '../profile-modal';
import { useAuthProfile } from '@/store/authStore';
import { updateProfile } from '@/lib/profile';

jest.mock('@/store/authStore');
jest.mock('@/lib/profile');


let mockErrorState: string | null = null;
let mockErrorObject: {message: string | null;} = { message: null };

jest.mock('@/hooks/shared/use-action-error', () => {
  return {
    useActionError: jest.fn(() => {


      return {
        get message() {
          return mockErrorObject.message;
        },
        handleError: jest.fn((error: unknown) => {

          let errorMessage: string;
          if (error instanceof Error) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else {
            errorMessage = 'An error occurred';
          }
          mockErrorState = errorMessage;
          mockErrorObject.message = errorMessage;
        }),
        clear: jest.fn(() => {
          mockErrorState = null;
          mockErrorObject.message = null;
        })
      };
    })
  };
});

const mockUseActionError = require('@/hooks/shared/use-action-error').useActionError;

jest.mock('@/lib/toast', () => ({
  showSuccessToast: jest.fn(),
  showErrorToast: jest.fn()
}));

const mockUseAuthProfile = useAuthProfile as jest.MockedFunction<typeof useAuthProfile>;
const mockUpdateProfile = updateProfile as jest.MockedFunction<typeof updateProfile>;

describe('ProfileModal', () => {
  const mockOnOpenChange = jest.fn();
  const mockProfile = {
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockErrorState = null;
    mockErrorObject.message = null;
    mockUseAuthProfile.mockReturnValue(mockProfile as any);
  });

  it('should not render when closed', () => {
    render(<ProfileModal open={false} onOpenChange={mockOnOpenChange} />);
    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Update your profile information')).toBeInTheDocument();
  });

  it('should populate form with user data when opened', () => {
    render(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    expect(nameInput.value).toBe('Test User');
  });

  it('should not show profile picture field', () => {
    render(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);
    expect(screen.queryByLabelText('Profile Picture URL')).not.toBeInTheDocument();
  });

  it('should update name input', () => {
    render(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(nameInput.value).toBe('New Name');
  });

  it('should show error when name is empty', async () => {
    mockUpdateProfile.mockResolvedValue({ success: false, error: 'Name is required' });
    const { rerender } = render(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: '' } });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);


    await waitFor(() => {
      expect(mockErrorObject.message).toBe('Name is required');
    }, { timeout: 1000 });


    rerender(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);


    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should call updateProfile on submit', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true });
    render(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });

  it('should close modal on successful update', async () => {
    mockUpdateProfile.mockResolvedValue({ success: true });
    render(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should show error message on update failure', async () => {
    mockUpdateProfile.mockResolvedValue({ success: false, error: 'Update failed' });
    render(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);


    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should close modal when cancel is clicked', () => {
    render(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable inputs when loading', async () => {
    mockUpdateProfile.mockImplementation(() => new Promise(() => {}));
    render(<ProfileModal open={true} onOpenChange={mockOnOpenChange} />);

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
      expect(nameInput.disabled).toBe(true);
    });
  });
});
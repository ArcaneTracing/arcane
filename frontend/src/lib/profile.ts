"use client";

import { Profile } from '@/types/auth';
import { updateUserProfile } from '@/api/users';
import useAuthStore from '@/store/authStore';

export async function updateProfile(
updatedData: Profile)
: Promise<{success: boolean;data?: Profile;error?: string;}> {
  try {
    const data = await updateUserProfile(updatedData);


    useAuthStore.getState().setProfile(data);

    return { success: true, data };
  } catch (err: any) {
    console.error('Update error:', err);
    const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update profile';
    return { success: false, error: errorMessage };
  }
}
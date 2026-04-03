import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSetAuthProfile } from '@/store/authStore';
import { useSetOrganisations, useSetCurrentOrganisation } from '@/store/organisationStore';
import { validateSetupForm, performSetup } from './setup-utils';
import { SetupSuccessView } from './setup-success-view';
import { SetupFormView } from './setup-form-view';

export default function SetupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const setProfile = useSetAuthProfile();
  const setOrganisations = useSetOrganisations();
  const setCurrentOrganisation = useSetCurrentOrganisation();
  
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [createdOrganisationId, setCreatedOrganisationId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const validationError = validateSetupForm(password, confirmPassword, organisationName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setIsSigningUp(true);

    try {
      const result = await performSetup(email, password, name, organisationName, {
        setProfile,
        setOrganisations,
        setCurrentOrganisation,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['setup-status'] });
      setCreatedOrganisationId(result.organisationId);
      setSetupComplete(true);
    } catch (err: unknown) {
      const errObj = err as { message?: string; data?: { message?: string } };
      setError(errObj?.message || errObj?.data?.message || 'Failed to complete setup');
    } finally {
      setIsLoading(false);
      setIsSigningUp(false);
    }
  };

  if (setupComplete) {
    return <SetupSuccessView createdOrganisationId={createdOrganisationId} />;
  }

  return (
    <SetupFormView
      name={name}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      organisationName={organisationName}
      error={error}
      isLoading={isLoading}
      isSigningUp={isSigningUp}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onOrganisationNameChange={setOrganisationName}
      onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
      onToggleConfirmPasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
      onSubmit={handleSubmit}
    />
  );
}

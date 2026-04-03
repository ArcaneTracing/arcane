import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SetupPasswordInput } from './setup-password-input'
import { SetupFeatureImage } from './setup-feature-image'

type SetupFormViewProps = {
  name: string
  email: string
  password: string
  confirmPassword: string
  organisationName: string
  error: string
  isLoading: boolean
  isSigningUp: boolean
  showPassword: boolean
  showConfirmPassword: boolean
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onOrganisationNameChange: (value: string) => void
  onTogglePasswordVisibility: () => void
  onToggleConfirmPasswordVisibility: () => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function SetupFormView({
  name,
  email,
  password,
  confirmPassword,
  organisationName,
  error,
  isLoading,
  isSigningUp,
  showPassword,
  showConfirmPassword,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onOrganisationNameChange,
  onTogglePasswordVisibility,
  onToggleConfirmPasswordVisibility,
  onSubmit,
}: Readonly<SetupFormViewProps>) {
  return (
    <div className="flex h-screen max-w-screen-2xl mx-auto">
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <img
              src="/images/logo.webp"
              alt="Arcane Logo"
              width={64}
              height={64}
              className="mx-auto mb-6"
            />
            <h2 className="text-[24px] font-semibold text-gray-900 dark:text-gray-100">Welcome to Arcane</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Create your account and organization to get started.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 px-4">
            <div className="space-y-1">
              <label htmlFor="setup-name" className="block text-gray-700 dark:text-gray-300">Full Name</label>
              <Input
                id="setup-name"
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                required
                placeholder="Enter your full name"
                className="w-full h-10 border border-gray-200 dark:border-[#2A2A2A] placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1F1F1F] dark:text-gray-100"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="setup-email" className="block text-gray-700 dark:text-gray-300">Email address</label>
              <Input
                id="setup-email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full h-10 border border-gray-200 dark:border-[#2A2A2A] placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1F1F1F] dark:text-gray-100"
              />
            </div>

            <SetupPasswordInput
              id="setup-password"
              label="Password"
              value={password}
              onChange={onPasswordChange}
              showPassword={showPassword}
              onToggleVisibility={onTogglePasswordVisibility}
              placeholder="Enter your password"
            />

            <SetupPasswordInput
              id="setup-confirm-password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={onConfirmPasswordChange}
              showPassword={showConfirmPassword}
              onToggleVisibility={onToggleConfirmPasswordVisibility}
              placeholder="Confirm your password"
            />

            <div className="space-y-1">
              <label htmlFor="setup-organisation-name" className="block text-gray-700 dark:text-gray-300">Organization Name</label>
              <Input
                id="setup-organisation-name"
                type="text"
                value={organisationName}
                onChange={(e) => onOrganisationNameChange(e.target.value)}
                required
                placeholder="Enter your organization name"
                className="w-full h-10 border border-gray-200 dark:border-[#2A2A2A] placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1F1F1F] dark:text-gray-100"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full h-10 bg-[#F93647] hover:bg-[#F93647]/90 text-white"
              disabled={isLoading || isSigningUp}
            >
              {isLoading || isSigningUp ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </div>
      </div>

      <SetupFeatureImage />
    </div>
  )
}

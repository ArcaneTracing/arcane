import { useNavigate } from '@tanstack/react-router';
import { createNavigationPath } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { SetupFeatureImage } from './setup-feature-image';

type SetupSuccessViewProps = {
  createdOrganisationId: string | null;
};

export function SetupSuccessView({ createdOrganisationId }: Readonly<SetupSuccessViewProps>) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen max-w-screen-2xl mx-auto">
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-[400px] px-4 text-center">
          <img
            src="/images/logo.webp"
            alt="Arcane Logo"
            width={64}
            height={64}
            className="mx-auto mb-6" />

          <div className="mb-2 flex justify-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
          </div>
          <h2 className="text-[24px] font-semibold text-gray-900 dark:text-gray-100">Setup completed</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">
            Your account and organization are ready. Sign in to get started.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate({ to: '/login' })}
              className="w-full h-10 bg-[#F93647] hover:bg-[#F93647]/90 text-white">

              Go to Login
            </Button>
            {createdOrganisationId &&
            <Button
              variant="outline"
              onClick={() =>
              navigate({ to: createNavigationPath(`/organisations/${createdOrganisationId}/projects`) })
              }
              className="w-full h-10">

                Continue to app
              </Button>
            }
          </div>
        </div>
      </div>
      <SetupFeatureImage />
    </div>);

}
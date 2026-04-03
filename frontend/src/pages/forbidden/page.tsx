import { useNavigate } from '@tanstack/react-router';
import { createNavigationPath } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const fallbackPath = '/projects';

  const handleGoBack = () => {


    if (document.referrer && globalThis.history.length > 1) {

      globalThis.history.back();
    } else {

      navigate({ to: createNavigationPath(fallbackPath) });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md px-4">
        <div className="mb-6">
          <div className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">403</div>
          <h1 className="text-2xl font-semibold mb-2">Access Forbidden</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
          </p>
        </div>
        <Button onClick={handleGoBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>);

}
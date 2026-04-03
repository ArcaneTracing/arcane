import { useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { checkSetupStatus } from '@/api/setup';

interface SetupGuardProps {
  children: React.ReactNode;
}
export function SetupGuard({ children }: Readonly<SetupGuardProps>) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSetupPage = location.pathname === '/setup';


  const publicRoutes = ['/health', '/ready'];
  const isPublicRoute = publicRoutes.includes(location.pathname);


  const { data: setupStatus, isLoading, error } = useQuery({
    queryKey: ['setup-status'],
    queryFn: () => checkSetupStatus(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false
  });

  useEffect(() => {

    if (!isLoading && !error && setupStatus?.shouldSetup && !isSetupPage && !isPublicRoute) {
      navigate({ to: '/setup' });
    }


    if (!isLoading && !error && !setupStatus?.shouldSetup && isSetupPage) {
      navigate({ to: '/' });
    }
  }, [setupStatus, isLoading, error, isSetupPage, isPublicRoute, navigate]);


  if (isLoading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>);

  }
  if (error && !isPublicRoute) {

    return <>{children}</>;
  }


  if (!isLoading && !error && setupStatus?.shouldSetup && !isSetupPage && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
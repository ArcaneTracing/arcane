import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useSetAuthProfile } from "@/store/authStore";
import { authClient } from "@/lib/better-auth";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
};

export default function AuthGuard({
  children,
  requireAuth = true,
  fallback,
  redirectTo = "/login"
}: Readonly<AuthGuardProps>) {
  const { data: auth, isLoading } = useAuth();
  const setProfile = useSetAuthProfile();
  const location = useLocation();
  const currentPath = location.pathname;
  const sessionResult = authClient.useSession();
  const session = sessionResult?.data ?? sessionResult;
  const sessionPending = sessionResult?.isPending ?? sessionResult?.isLoading;

  useEffect(() => {
    if (auth?.loggedIn && auth.profile) {
      setProfile(auth.profile);
    }
  }, [auth, setProfile]);

  useEffect(() => {
    const isLoginPage = currentPath === redirectTo;
    const isRegisterPage = currentPath === '/register';
    const isSessionLoaded = session !== undefined;
    const isStillLoading = isLoading || !isSessionLoaded || sessionPending === true;
    const shouldRedirect = requireAuth && !isStillLoading && !auth?.loggedIn && !isLoginPage && !isRegisterPage;

    if (shouldRedirect) {
      const shouldPreserveRedirect = currentPath !== '/' && currentPath !== '/no-organisation';
      const loginUrl = shouldPreserveRedirect ?
      `${redirectTo}?redirect=${encodeURIComponent(currentPath)}` :
      redirectTo;
      globalThis.location.href = loginUrl;
    }
  }, [auth, isLoading, sessionPending, session, requireAuth, redirectTo, currentPath]);

  const isSessionLoaded = session !== undefined;
  if (isLoading || !isSessionLoaded || sessionPending === true) {
    return fallback ||
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>;

  }


  if (requireAuth && !auth?.loggedIn) {
    const isLoginPage = currentPath === redirectTo;
    const isRegisterPage = currentPath === '/register';

    if (isLoginPage || isRegisterPage) {
      return <>{children}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please log in to continue.
          </p>
          <a
            href={
            currentPath !== '/' && currentPath !== '/no-organisation' ?
            `${redirectTo}?redirect=${encodeURIComponent(currentPath)}` :
            redirectTo
            }
            className="text-blue-600 hover:underline">

            Go to Login
          </a>
        </div>
      </div>);

  }

  return <>{children}</>;
}
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { authClient } from "@/lib/better-auth";
import { AuthResponse } from "@/types/auth";
import { QueryConfig } from "@/api/authApi";


export function useAuth(options?: QueryConfig<AuthResponse>) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const sessionResult = authClient.useSession();
  const session = sessionResult?.data ?? sessionResult;
  const sessionPending = sessionResult?.isPending ?? sessionResult?.isLoading;
  const isSessionLoaded = session !== undefined;

  const query = useQuery({
    queryKey: ["auth", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) {
        return {
          loggedIn: false,
          profile: null
        };
      }

      return {
        loggedIn: true,
        profile: {
          name: session.user.name || "",
          email: session.user.email || "",
          picture: session.user.image || undefined
        }
      };
    },
    enabled: isSessionLoaded && !sessionPending && !isLoginPage && !isRegisterPage && options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: !isLoginPage && !isRegisterPage,
    retry: false,
    ...options
  });

  const isLoading = query.isLoading || !isSessionLoaded || sessionPending === true;

  return {
    ...query,
    isLoading
  };
}


export function useIsAuthenticated() {
  const { data: auth, isLoading, error } = useAuth();
  return {
    isAuthenticated: !!auth?.loggedIn,
    isLoading,
    profile: auth?.profile,
    error
  };
}
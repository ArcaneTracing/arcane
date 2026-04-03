import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
const BASE_API_URL = import.meta.env.MODE === 'development' ? "/api" : import.meta.env.VITE_BACKEND_URL || "/api";

export const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true
});


api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {_retry?: boolean;};
    if (error.response?.status === 401) {
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
      const isLoginPage = globalThis.window?.location?.pathname === '/login';
      const isRegisterPage = globalThis.window?.location?.pathname === '/register';
      const isSetupPage = globalThis.window?.location?.pathname === '/setup';
      const isPublicRoute = ['/health', '/ready'].includes(globalThis.window?.location?.pathname || '');

      if (isLoginPage || isRegisterPage || isSetupPage || isPublicRoute || isAuthEndpoint || !globalThis.window) {
        throw error;
      }

      try {
        const { authClient } = await import('@/lib/better-auth');
        const session = await authClient.getSession();
        if (session?.user) {
          throw error;
        }
      } catch {
        /* Session unavailable, proceed to redirect to login */
      }

      const currentPath = globalThis.window.location.pathname;
      const shouldPreserveRedirect = currentPath !== '/' && currentPath !== '/no-organisation';
      const loginUrl = shouldPreserveRedirect ?
      `/login?redirect=${encodeURIComponent(currentPath)}` :
      '/login';
      globalThis.window.location.href = loginUrl;
    }
    if (error.response?.status === 404) {
      const url = originalRequest?.url || '';
      const isCommonEndpoint = url.includes('/scores') ||
      url.includes('/evaluations') ||
      url.includes('/prompts') ||
      url.includes('/experiments') ||
      url.includes('/conversation-config');
      if (!isCommonEndpoint) {
        console.warn('[API] 404 Not Found:', url);
      }
    }

    throw error;
  }
);

export default api;
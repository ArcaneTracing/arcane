import axios from "axios";
import { UseQueryOptions } from "@tanstack/react-query";
const BASE_API_URL = import.meta.env.MODE === 'development' ? "/api" : import.meta.env.VITE_BACKEND_URL || "/api";

export const authApi = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true
});


authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = globalThis.window === undefined ? '' : globalThis.window.location.pathname;
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const isLoginPage = currentPath === '/login';
      const isRegisterPage = currentPath === '/register';

      if (!isLoginPage && !isRegisterPage && !isAuthEndpoint) {
        const shouldPreserveRedirect = currentPath !== '/' && currentPath !== '/no-organisation';
        const loginUrl = shouldPreserveRedirect ?
        `/login?redirect=${encodeURIComponent(currentPath)}` :
        '/login';
        if (globalThis.window !== undefined) {
          globalThis.window.location.href = loginUrl;
        }
      }
    }
    return Promise.reject(error);
  }
);


export type QueryConfig<TQueryFnData, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, Error, TData, [string, Record<string, unknown>, ...string[]]>,
  "queryKey" | "queryFn">;


export default authApi;
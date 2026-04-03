import { createAuthClient } from "better-auth/react";
import { ssoClient } from "@better-auth/sso/client";


const getBaseURL = () => {
  if (import.meta.env.MODE === 'development') {

    if (globalThis.window !== undefined) {
      return globalThis.window.location.origin;
    }

    return "http://localhost:3000";
  }

  return import.meta.env.VITE_BACKEND_URL || (globalThis.window === undefined ? "http://localhost:3000" : globalThis.window.location.origin);
};
export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: "/api/auth",
  plugins: [ssoClient()],
  fetchOptions: {
    credentials: "include"
  }
});
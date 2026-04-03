import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { createNavigationPath } from '@/lib/navigation';
import { useTheme } from 'next-themes';
import { authClient } from '@/lib/better-auth';
import { useAuth } from '@/hooks/useAuth';
import { useSetAuthProfile } from '@/store/authStore';
import { useSetOrganisations, useSetCurrentOrganisation } from '@/store/organisationStore';
import { organisationsApi } from '@/api/organisations';
import { clearPermissionsCache } from '@/api/permissions';
import { useConfig } from '@/hooks/useConfig';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();
  const { data: auth } = useAuth({
    refetchOnWindowFocus: false
  });
  const setProfile = useSetAuthProfile();
  const setOrganisations = useSetOrganisations();
  const setCurrentOrganisation = useSetCurrentOrganisation();


  const [isSigningIn, setIsSigningIn] = useState(false);

  const { config } = useConfig();
  const oktaEnabled = config?.oktaEnabled ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {

    if (auth?.loggedIn && auth.profile) {

      const storedOrgs = JSON.parse(localStorage.getItem('organisation-storage') || '{}')?.state?.organisations || [];
      const storedCurrentOrg = JSON.parse(localStorage.getItem('organisation-storage') || '{}')?.state?.currentOrganisation;

      if (storedCurrentOrg) {
        const search = new URLSearchParams(globalThis.location.search);
        const redirect = search.get('redirect') || `/organisations/${storedCurrentOrg.id}/projects`;
        navigate({ to: createNavigationPath(redirect) });
      } else if (storedOrgs.length > 0) {

        setCurrentOrganisation(storedOrgs[0]);
        const search = new URLSearchParams(globalThis.location.search);
        const redirect = search.get('redirect') || `/organisations/${storedOrgs[0].id}/projects`;
        navigate({ to: createNavigationPath(redirect) });
      } else {

        organisationsApi.getAll().
        then((orgs) => {
          setOrganisations(orgs);
          if (orgs.length > 0) {
            setCurrentOrganisation(orgs[0]);
            const search = new URLSearchParams(globalThis.location.search);
            const redirect = search.get('redirect') || `/organisations/${orgs[0].id}/projects`;
            navigate({ to: createNavigationPath(redirect) });
          } else {

            navigate({ to: createNavigationPath('/no-organisation') });
          }
        }).
        catch(() => {

          navigate({ to: createNavigationPath('/no-organisation') });
        });
      }
    }
  }, [auth, navigate, setOrganisations, setCurrentOrganisation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      setIsSigningIn(true);

      const { error } = await authClient.signIn.email({
        email,
        password
      });

      if (error) {
        throw new Error(error.message || 'Failed to login');
      }


      clearPermissionsCache();


      await new Promise((resolve) => setTimeout(resolve, 100));


      const session = await authClient.getSession();
      if (session?.user) {
        setProfile({
          name: session.user.name || "",
          email: session.user.email || "",
          picture: session.user.image || undefined
        });
      }


      let organisations: any[] = [];
      try {
        organisations = await organisationsApi.getAll();
        setOrganisations(organisations);


        if (organisations.length > 0) {
          setCurrentOrganisation(organisations[0]);
        }
      } catch (error_: unknown) {
        console.error('Failed to fetch organisations:', error_);

      }


      const search = new URLSearchParams(globalThis.location.search);
      let redirect = search.get('redirect');

      if (!redirect) {

        if (organisations.length > 0) {
          redirect = `/organisations/${organisations[0].id}/projects`;
        } else {

          redirect = '/no-organisation';
        }
      } else if (!redirect.includes('/organisations/') && organisations.length > 0) {

        redirect = `/organisations/${organisations[0].id}${redirect.startsWith('/') ? redirect : '/' + redirect}`;
      } else if (!redirect.includes('/organisations/') && organisations.length === 0) {

        redirect = '/no-organisation';
      }

      navigate({ to: createNavigationPath(redirect) });
    } catch (err: any) {
      setError(err.message || err.data?.message || 'Failed to login');
      setIsLoading(false);
    } finally {
      setIsSigningIn(false);
      setIsLoading(false);
    }
  };

  const handleSSOSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const search = new URLSearchParams(globalThis.location.search);
      const redirectParam = search.get("redirect");
      const callbackURL = redirectParam || "/organisations";

      const { error } = await authClient.signIn.sso({
        providerId: "okta",
        callbackURL
      });
      if (error) throw new Error(error.message);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "SSO sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen max-w-screen-2xl mx-auto">
      {}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <img
              src="/images/logo.webp"
              alt="Arcane Logo"
              width={64}
              height={64}
              className="mx-auto mb-6" />

            <h2 className="text-[24px] font-semibold text-gray-900 dark:text-gray-100">Welcome Back to Arcane</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {oktaEnabled ? "Sign in with your organisation account." : "Enter your email and password to continue."}
            </p>
          </div>

          <div className="space-y-4 px-4">
            {!oktaEnabled &&
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="login-email" className="block text-gray-700 dark:text-gray-300">Email address</label>
                  <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full h-10 border border-gray-200 dark:border-[#2A2A2A] placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1F1F1F] dark:text-gray-100" />

                </div>

                <div className="space-y-1">
                  <label htmlFor="login-password" className="block text-gray-700 dark:text-gray-300">Password</label>
                  <div className="relative">
                    <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full h-10 border border-gray-200 dark:border-[#2A2A2A] pr-10 placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:bg-[#1F1F1F] dark:text-gray-100" />

                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">

                      {showPassword ?
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg> :

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                    </button>
                  </div>
                </div>

                {error &&
              <div className="text-red-500 text-sm text-center">{error}</div>
              }

                <Button
                type="submit"
                className="w-full h-10 bg-[#F93647] hover:bg-[#F93647]/90 text-white"
                disabled={isLoading || isSigningIn}>

                  {isLoading || isSigningIn ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            }

            {oktaEnabled &&
            <>
                {error &&
              <div className="text-red-500 text-sm text-center">{error}</div>
              }
                <Button
                type="button"
                className="w-full h-10 bg-[#F93647] hover:bg-[#F93647]/90 text-white"
                disabled={isLoading || isSigningIn}
                onClick={handleSSOSignIn}>

                  {isLoading || isSigningIn ? "Signing in..." : "Sign in with SSO"}
                </Button>
              </>
            }
          </div>
        </div>
      </div>

      {}
      <div className="w-1/2 flex items-center justify-center h-full">
        <div className="text-white w-full max-w-2xl text-center flex items-center justify-center h-full">
          <div className="relative overflow-hidden">
            {mounted && resolvedTheme ?
            <img
              src={resolvedTheme === 'dark' ? '/images/arcane_dark.png' : '/images/arcane_light.png'}
              alt="Data Analytics Dashboard"
              className="rounded-lg max-w-[500px] max-h-[500px] object-contain mx-auto" /> :


            <div className="rounded-lg max-w-[500px] max-h-[500px] mx-auto bg-transparent" />
            }
          </div>
        </div>
      </div>
    </div>);

}
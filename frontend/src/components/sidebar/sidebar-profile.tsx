import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight, LogOut, Settings } from "lucide-react";
import { authClient } from "@/lib/better-auth";
import { useLogout } from "@/store/authStore";
import { useClearOrganisation } from "@/store/organisationStore";
import { useQueryClient } from "@tanstack/react-query";
import { clearPermissionsCache } from "@/api/permissions";
import { useState } from "react";

interface SidebarProfileProps {
  isCollapsed: boolean;
  profile: {name?: string;email?: string;picture?: string;} | null;
  profileLoading: boolean;
  onSettingsClick: () => void;
}

function ProfileAvatar({
  profileImage,
  profileInitial,
  profileName,
  className

}: Readonly<{profileImage: string | undefined;profileInitial: string | undefined;profileName?: string;className?: string;}>) {
  return (
    <div className={cn("h-8 w-8 rounded-full bg-gray-100 dark:bg-[#1F1F1F] flex items-center justify-center relative", className)}>
      {profileImage ?
      <img
        src={profileImage}
        alt={profileName ?? ''}
        width={32}
        height={32}
        className="rounded-full" /> :


      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {profileInitial}
        </span>
      }
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
    </div>);

}

export function SidebarProfile({
  isCollapsed,
  profile,
  profileLoading,
  onSettingsClick
}: Readonly<SidebarProfileProps>) {
  const logout = useLogout();
  const clearOrganisation = useClearOrganisation();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {

    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {

      await authClient.signOut();
    } catch (error) {
      console.error("Logout failed:", error);

    } finally {

      queryClient.clear();


      clearPermissionsCache();


      logout();
      clearOrganisation();


      globalThis.location.href = "/login";
    }
  };

  const profileImage = profile?.picture;
  const profileInitial = profile?.name?.charAt(0);

  if (profileLoading) {
    return (
      <div className={cn(
        "flex items-center gap-3",
        isCollapsed ? "justify-center" : "p-2 bg-white dark:bg-[#1F1F1F] rounded-lg border border-gray-100 dark:border-[#2A2A2A] shadow-sm"
      )}>
        <Skeleton className="h-8 w-8 rounded-full" />
        {!isCollapsed &&
        <div className="flex flex-col gap-2 flex-1 items-start">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        }
      </div>);

  }

  if (!profile) return null;

  if (isCollapsed) {
    return (
      <div className="flex justify-center">
        <ProfileAvatar
          profileImage={profileImage}
          profileInitial={profileInitial}
          profileName={profile.name}
          className="cursor-pointer hover:ring-2 hover:ring-gray-200 dark:hover:ring-[#F93647]/30" />

      </div>);

  }

  return (
    <>
      {!isCollapsed &&
      <div className="mb-3 px-3">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Profile
          </span>
        </div>
      }
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="w-full focus:outline-none">
          <div className={cn(
            "flex items-center gap-3 py-2.5 px-3 rounded-md transition-colors",
            "hover:bg-gray-100 dark:hover:bg-[#1F1F1F]"
          )}>
            <ProfileAvatar profileImage={profileImage} profileInitial={profileInitial} profileName={profile?.name} />
            {!isCollapsed &&
            <>
                <div className="flex flex-col min-w-0 flex-1 items-start">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {profile.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {profile.email}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              </>
            }
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={onSettingsClick}>
            <Settings className="h-4 w-4 mr-2" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isLoggingOut}>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center w-full disabled:opacity-50 disabled:cursor-not-allowed">

              <LogOut className="h-4 w-4 mr-2" />
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>);

}
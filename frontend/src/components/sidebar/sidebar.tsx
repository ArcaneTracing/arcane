import { ProfileModal } from "@/components/sidebar/profile-modal";
import { SidebarLogo } from "@/components/sidebar/sidebar-logo";
import { SidebarNavigation } from "@/components/sidebar/sidebar-navigation";
import { SidebarProfile } from "@/components/sidebar/sidebar-profile";
import { SidebarProjects } from "@/components/sidebar/sidebar-projects";
import { SidebarSettings } from "@/components/sidebar/sidebar-settings";
import { SidebarToggle } from "@/components/sidebar/sidebar-toggle";
import { useAuthProfile } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useProjectsQuery } from "@/hooks/projects/use-projects-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { useQueryClient } from "@tanstack/react-query";
import { createNavigationPath } from "@/lib/navigation";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const params = useParams({ strict: false });
  const organisationId = useOrganisationIdOrNull();
  const { isLoading: authLoading } = useAuth();
  const profile = useAuthProfile();
  const profileLoading = authLoading;
  const { data: projects = [] } = useProjectsQuery();
  const queryClient = useQueryClient();
  const urlProjectId = params?.projectId;
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const prevProjectIdRef = useRef<string | null>(null);
  const prevOrganisationIdRef = useRef<string | null>(null);


  useEffect(() => {
    if (organisationId !== prevOrganisationIdRef.current && prevOrganisationIdRef.current !== null) {

      setSelectedProjectId(null);
      prevProjectIdRef.current = null;
    }
    prevOrganisationIdRef.current = organisationId;
  }, [organisationId]);


  useEffect(() => {
    if (urlProjectId) {
      setSelectedProjectId(urlProjectId);
    } else if (projects?.length > 0 && !selectedProjectId) {

      setSelectedProjectId(projects[0].id ?? '');
    } else if (projects?.length === 0 && selectedProjectId) {

      setSelectedProjectId(null);
    }
  }, [urlProjectId, projects, selectedProjectId]);


  useEffect(() => {
    const currentProjectId = selectedProjectId;
    const prevProjectId = prevProjectIdRef.current;

    if (currentProjectId && currentProjectId !== prevProjectId && organisationId) {


      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;

          return (
            Array.isArray(queryKey) &&
            queryKey.includes(currentProjectId) &&

            queryKey.includes(organisationId));

        }
      });

      prevProjectIdRef.current = currentProjectId;
    }
  }, [selectedProjectId, organisationId, queryClient]);

  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value);

    if (!organisationId) return;


    const currentProjectId = urlProjectId || selectedProjectId;


    if (currentProjectId && pathname.includes(`/projects/${currentProjectId}`)) {

      const newPath = pathname.replace(`/projects/${currentProjectId}`, `/projects/${value}`);
      navigate({
        to: createNavigationPath(newPath),
        params: { organisationId, projectId: value },
        replace: true
      });
    } else {

      navigate({
        to: '/organisations/$organisationId/projects/$projectId/conversations',
        params: { organisationId, projectId: value },
        replace: true
      });
    }
  };


  if (pathname.includes('/login') || pathname.includes('/register')) {
    return null;
  }
  if (!profile && !profileLoading) return null;

  return (
    <>
      <aside className={cn(
        "flex flex-col h-screen border-r border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#181818] relative transition-all duration-300",
        isCollapsed ? "w-[60px]" : "w-[250px]"
      )}>
        <SidebarToggle
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)} />


        <SidebarLogo isCollapsed={isCollapsed} />
        <nav className="flex-1 px-4 py-4 overflow-y-scroll">
          <div className="space-y-3">
            {!profileLoading &&
            <>
                <SidebarProjects
                isCollapsed={isCollapsed}
                projects={projects || []}
                selectedProjectId={selectedProjectId}
                onProjectChange={handleProjectChange} />

                <SidebarNavigation
                isCollapsed={isCollapsed}
                selectedProjectId={selectedProjectId} />

              </>
            }
          </div>
          <SidebarSettings isCollapsed={isCollapsed} />

          <div className="py-4">
            <SidebarProfile
              isCollapsed={isCollapsed}
              profile={profile}
              profileLoading={profileLoading}
              onSettingsClick={() => setIsModalOpen(true)} />

          </div>
        </nav>


      </aside>

      <ProfileModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen} />

    </>);

}

export default Sidebar;
import { DocumentationIcon } from "@/components/icons/documentation-icon";
import { MoonIcon } from "@/components/icons/moon-icon";
import { SunIcon } from "@/components/icons/sun-icon";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface SidebarSettingsProps {
  isCollapsed: boolean;
}

export function SidebarSettings({ isCollapsed }: Readonly<SidebarSettingsProps>) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="mt-auto">
        <div className="space-y-1">
          {!isCollapsed &&
        <div className="px-3 py-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Support
              </span>
            </div>
        }
          <Link
          to="/docs"
          className={cn(
            "flex items-center gap-3 py-2.5 text-xs text-gray-800 dark:text-gray-200 rounded-md transition-colors group",
            "hover:bg-gray-100 dark:hover:bg-[#1F1F1F]",
            isCollapsed ? "justify-center px-2" : "px-3"
          )}
          title={isCollapsed ? "Documentation" : undefined}>

            <DocumentationIcon className="flex-shrink-0 h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-[#F93647]" />
            {!isCollapsed && <span>Documentation</span>}
          </Link>
          <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={cn(
            "flex items-center gap-3 py-2.5 text-xs text-gray-800 dark:text-gray-200 rounded-md transition-colors group w-full",
            "hover:bg-gray-100 dark:hover:bg-[#1F1F1F]",
            isCollapsed ? "justify-center px-2" : "px-3"
          )}
          title={(() => {
            if (isCollapsed) return mounted && theme === 'dark' ? "Light mode" : "Dark mode";
            return undefined;
          })()}
          suppressHydrationWarning>

            {(() => {
            if (!mounted) {
              return (
                <>
                    <MoonIcon className="flex-shrink-0 h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-[#F93647]" />
                    {!isCollapsed && <span>Dark mode</span>}
                  </>);

            }
            if (theme === 'dark') {
              return (
                <>
                    <SunIcon className="flex-shrink-0 h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-[#F93647]" />
                    {!isCollapsed && <span>Light mode</span>}
                  </>);

            }
            return (
              <>
                  <MoonIcon className="flex-shrink-0  h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-[#F93647]" />
                  {!isCollapsed && <span>Dark mode</span>}
                </>);

          })()}
          </button>
        </div>
    </div>);

}
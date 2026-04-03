import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface SidebarLogoProps {
  isCollapsed: boolean;
}

export function SidebarLogo({ isCollapsed }: Readonly<SidebarLogoProps>) {
  return (
    <div className="px-4 py-6 pb-2">
      <Link to="/" className={cn(
        "flex items-center",
        isCollapsed ? "justify-center" : "justify-start"
      )}>
        <div className="h-10 w-10 flex items-center justify-center">
          <img
            src="/images/logo.webp"
            alt="Arcane Logo"
            width={24}
            height={24}
            className="rounded"
          />
        </div>
        {!isCollapsed && (
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">Arcane</span>
        )}
      </Link>
    </div>
  );
}


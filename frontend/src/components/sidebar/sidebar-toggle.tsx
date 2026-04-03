"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isCollapsed, onToggle }: Readonly<SidebarToggleProps>) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-[#E5E7EB] dark:border-[#2A2A2A] bg-white dark:bg-[#1F1F1F] shadow-sm hover:bg-gray-50 dark:hover:bg-[#2A2A2A] hover:border-[#F93647]/20 dark:hover:border-[#F93647]/30 transition-colors"
      onClick={onToggle}
    >
      {isCollapsed ? (
        <ChevronRight className="h-3 w-3" />
      ) : (
        <ChevronLeft className="h-3 w-3" />
      )}
    </Button>
  );
}


import { Outlet } from '@tanstack/react-router';
import { TooltipProvider } from '@/components/ui/tooltip';

export function ProjectLayout() {
  return (
    <TooltipProvider>
      <Outlet />
    </TooltipProvider>);

}
import { Outlet } from '@tanstack/react-router'
import { Sidebar } from '@/components/sidebar/sidebar'
import { Navbar } from '@/components/navbar/navbar'
import AuthGuard from '@/components/AuthGuard'

export function AppLayout() {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto min-h-0">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}


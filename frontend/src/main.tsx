import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import './index.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { QueryClientProviderWrapper } from '@/components/QueryClientProvider'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { router } from './router'

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProviderWrapper>
          <TooltipProvider delayDuration={300} skipDelayDuration={0}>
            <AppErrorBoundary>
              <RouterProvider router={router} />
              <Toaster position="top-right" richColors />
            </AppErrorBoundary>
          </TooltipProvider>
        </QueryClientProviderWrapper>
      </ThemeProvider>
    </React.StrictMode>,
  );
} catch (error) {
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Application Error</h1>
      <p>Failed to initialize the application.</p>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
      <p>Check the browser console for more details.</p>
    </div>
  `;
}


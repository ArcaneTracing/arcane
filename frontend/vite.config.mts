import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM-compatible __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({
        routesDirectory: './src/routes',
        generatedRouteTree: './src/routeTree.gen.ts',
      }),
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        // Proxy API calls to backend to avoid CORS issues with cookies
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://0.0.0.0:8085',
          changeOrigin: true,
          secure: false,
          // Rewrite path: /api/v1/... -> /v1/... (but keep /api/auth for Better Auth)
          // Better Auth is mounted at /api/auth on backend, so don't strip /api for those routes
          rewrite: (path) => {
            // Keep /api/auth routes as-is (backend has Better Auth at /api/auth)
            if (path.startsWith('/api/auth')) {
              return path; // Keep /api/auth/...
            }
            // Strip /api for other routes: /api/v1/... -> /v1/...
            return path.replace(/^\/api/, '');
          },
          // Preserve cookies and rewrite domain to localhost
          cookieDomainRewrite: 'localhost',
          // Log proxy requests for debugging
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('[Vite Proxy]', req.method, req.url, '->', proxyReq.path);
            });
          },
        },
      },
    },
    build: {
      outDir: 'dist',
    },
  }
})


import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL

  return {
    base: '/',
    plugins: [react()],
    server: {
      proxy: apiBaseUrl
        ? undefined
        : [
            '^/api(?:/|$)',
            '^/user(?:/|$)',
            '^/brand/(?:signup|login|all|update|delete|analytics|campaign|campaigns|product|me)(?:/|$)',
            '^/product/(?:cId|explore|pId|like|search|media|pin|brands)(?:/|$)',
            '^/product/[^/]+/feature(?:/|$)',
            '^/wallet(?:/|$)',
            '^/youtube(?:/|$)',
            '^/subscription(?:/|$)',
            '^/c(?:/|$)',
          ].reduce((routes, path) => {
            routes[path] = {
              target: 'http://localhost:8000',
              changeOrigin: true,
              secure: false,
            }
            return routes
          }, {}),
    },
  }
})

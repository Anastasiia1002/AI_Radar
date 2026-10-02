import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// FreeSERP answers with two Access-Control-Allow-Origin headers, which browsers reject.
// Same-origin /freeserp is proxied to the public API in dev, preview, and the host configs.
const freeserpProxy: Record<string, ProxyOptions> = {
  '/freeserp': {
    target: 'https://freeserp.ai',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/freeserp\b/, '/api.php'),
  },
}

function siteBase(): string {
  if (process.env.GITHUB_PAGES !== 'true') return '/'
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'AI_Radar'
  return `/${repo}/`
}

export default defineConfig({
  base: siteBase(),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    // Dev tunnels (for example trycloudflare.com) are not localhost.
    allowedHosts: true,
    proxy: freeserpProxy,
  },
  preview: {
    proxy: freeserpProxy,
  },
})

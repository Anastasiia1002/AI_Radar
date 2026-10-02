import { renameSync } from 'node:fs'
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

function renamePagesHtml() {
  return {
    name: 'rename-pages-html',
    apply: 'build' as const,
    closeBundle() {
      const from = fileURLToPath(new URL('./dist/index.source.html', import.meta.url))
      const to = fileURLToPath(new URL('./dist/index.html', import.meta.url))
      try {
        renameSync(from, to)
      } catch {
        // The HTML output already uses index.html.
      }
    },
  }
}

function devSourceEntry() {
  return {
    name: 'dev-source-entry',
    apply: 'serve' as const,
    transformIndexHtml(html: string) {
      const withoutBuiltAssets = html
        .replace(/\s*<script type="module" crossorigin src="[^"]+"><\/script>/g, '')
        .replace(/\s*<link rel="stylesheet" crossorigin href="[^"]+">/g, '')
      if (withoutBuiltAssets.includes('/src/main.tsx')) return withoutBuiltAssets
      return withoutBuiltAssets.replace(
        '<div id="root"></div>',
        '<div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>',
      )
    },
  }
}

export default defineConfig({
  base: siteBase(),
  plugins: [react(), tailwindcss(), renamePagesHtml(), devSourceEntry()],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.source.html', import.meta.url)),
      },
    },
  },
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

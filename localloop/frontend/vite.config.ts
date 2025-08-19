import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // This is the crucial change:
        // Rewrite /api/feed to /feed for the backend
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
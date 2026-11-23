import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API = process.env.API_ORIGIN ?? 'http://localhost:3100'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': { target: API, changeOrigin: false },
      '/ws': { target: API, changeOrigin: false, ws: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})

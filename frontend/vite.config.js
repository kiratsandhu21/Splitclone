import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase'],
          'utils-vendor': ['xlsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB if needed
  },
})

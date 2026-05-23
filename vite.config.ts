import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/sql-practice-app/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@electric-sql/pglite']
  },
  server: {
    host: '127.0.0.1'
  }
})

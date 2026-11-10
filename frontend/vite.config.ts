import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Optional: proxy API calls during dev to avoid CORS issues
      // The frontend always uses VITE_API_URL (the API Gateway)
    }
  }
})

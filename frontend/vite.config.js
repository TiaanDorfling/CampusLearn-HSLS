import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' 


export default defineConfig({
  plugins: [react()],
   resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
        // ❌ remove the rewrite that stripped /api
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

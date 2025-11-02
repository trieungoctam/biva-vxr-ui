import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const backendTarget = (() => {
  if (process.env.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }

  if (process.env.NODE_ENV === 'production') {
    // Platform detection for Docker networking
    if (process.platform === 'linux') {
      return 'http://host-gateway:17498';
    }
    return 'http://host.docker.internal:17498';
  }

  return 'http://localhost:17498';
})();

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    sourcemap: false,
    minify: 'terser',
  },
  server: {
    port: 5173,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false
    },
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/chat': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/conversations': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});

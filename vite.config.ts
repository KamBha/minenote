import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr({
      svgrOptions: {
        icon: true,
      },
    })],
  server: { 
      proxy: {
        '/test': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          xfwd: true
        }
      }
    },
  });

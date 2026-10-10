import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@transit-triage/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@data': path.resolve(__dirname, '../../data')
    }
  },
  server: {
    port: 5173,
    host: true
  }
});

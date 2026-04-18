import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'preview' ? './' : '/',
  build: {
    sourcemap: process.env.VITE_SOURCEMAP === 'true',
  },
  plugins: [react()],
}));

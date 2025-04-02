import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // This is where Vite will output the built files
    assetsDir: 'assets', // Where to place your assets
    rollupOptions: {
      input: '/index.html', // This is your entry HTML file
    },
  },
});

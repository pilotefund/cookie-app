import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point 'cookie-app' to the library source for live development
      'cookie-app': path.resolve(__dirname, '../src/index.ts'),
    },
  },
});

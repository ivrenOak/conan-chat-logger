import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
    root: 'app',
    build: {
        outDir: '../.vite/renderer/main_window',
        rollupOptions: {
            input: 'app/index.html',
        },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './app'),
        },
    },
});

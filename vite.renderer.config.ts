import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    root: 'app',
    build: {
        rollupOptions: {
            input: 'app/index.html',
        },
    },
});

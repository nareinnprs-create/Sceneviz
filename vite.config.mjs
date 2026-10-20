import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    server: {
        proxy: {
            '/api': {
                // Keep in sync with src/lib/apiConfig.js DEFAULT_API_BASE_URL;
                // inlined here because Vite loads this config before app aliases resolve.
                target: process.env.NEXT_PUBLIC_SCENEVIZ_API_BASE_URL || 'https://api.muapi.ai',
                changeOrigin: true,
                secure: false
            }
        }
    }
});

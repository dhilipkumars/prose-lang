import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api/containers': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            },
            '/api/products': {
                target: 'http://localhost:8082',
                changeOrigin: true,
            },
        },
    },
});

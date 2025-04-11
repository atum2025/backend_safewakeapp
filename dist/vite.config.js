import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
    plugins: [],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        minify: true,
        target: 'es2020',
        ssr: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'server/index.ts'),
                routes: resolve(__dirname, 'server/routes.ts'),
            },
            external: [
                '@neondatabase/serverless',
                'zod-validation-error',
                'express'
            ],
            output: {
                format: 'es',
                entryFileNames: '[name].js',
            },
        },
    },
    resolve: {
        alias: {
            '@shared': resolve(__dirname, './shared'),
        },
    },
});
//# sourceMappingURL=vite.config.js.map
import path from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    plugins: [svelte(), viteSingleFile({ outputFileName: 'work-time.html', removeViteModuleLoader: true })],
    base: './',
    publicDir: false,
    resolve: {
        alias: {
            $lib: path.resolve('./src/lib'),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'esnext',
        cssCodeSplit: false,
        sourcemap: false,
        assetsInlineLimit: 100000000,
    },
});

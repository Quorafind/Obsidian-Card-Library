import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';

export default defineConfig(({mode}) => {
    return {
        plugins: [react()],
        build: {
            sourcemap: mode === 'development' ? 'inline' : false,
            minify: mode === 'development' ? false : true,
            // Use Vite lib mode https://vitejs.dev/guide/build.html#library-mode
            lib: {
                entry: path.resolve(__dirname, './src/cardLibraryIndex.tsx'),
                formats: ['cjs'],
            },
            rollupOptions: {
                plugins: [
                    mode === 'development'
                        ? ''
                        : terser({
                            compress: {
                                defaults: false,
                                drop_console: true,
                            },
                            mangle: {
                                eval: true,
                                module: true,
                                toplevel: true,
                                safari10: true,
                                properties: false,
                            },
                            output: {
                                comments: false,
                                ecma: '2020',
                            },
                        }),
                    resolve({
                        browser: false,
                    }),
                    replace({
                        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                    }),
                ],
                treeshake: true,
                output: {
                    // Overwrite default Vite output fileName
                    entryFileNames: 'main.js',
                    assetFileNames: 'styles.css',
                },
                external: ['obsidian'],
            },
            emptyOutDir: false,
            outDir: '.',
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
});

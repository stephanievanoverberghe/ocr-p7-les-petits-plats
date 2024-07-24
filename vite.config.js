import { defineConfig } from 'vite';
import json from '@rollup/plugin-json';

export default defineConfig({
    plugins: [json()]
});

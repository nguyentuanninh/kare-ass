import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    input: 'src/index.ts',
    output: {
        dir: 'build',
        format: 'es',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src',
    },
    external: [/node_modules/],
    plugins: [
        alias({
            entries: [
                { find: '@', replacement: path.resolve(__dirname, 'src') },
                // Workaround for tslib ESM/CJS detection issue
                // See: https://github.com/microsoft/tslib/issues/173
                // Using .mjs extension ensures proper ESM treatment
                { find: 'tslib', replacement: path.resolve(__dirname, 'src/lib/tslib.mjs') },
            ],
        }),
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: true,
            declaration: false,
            declarationMap: false,
        }),
        nodeResolve({
            extensions: ['.ts', '.js'],
            preferBuiltins: true,
        }),
    ],
};

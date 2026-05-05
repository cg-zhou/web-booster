import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const basePlugins = [
  replace({
    preventAssignment: true,
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  }),
  resolve(),
  commonjs()
];

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/web-booster.js',
      format: 'umd',
      name: 'WebBooster',
      sourcemap: true
    },
    plugins: basePlugins
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/web-booster.min.js',
      format: 'umd',
      name: 'WebBooster',
      sourcemap: true
    },
    plugins: [...basePlugins, terser()]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/web-booster.esm.js',
      format: 'esm',
      sourcemap: true
    },
    plugins: basePlugins
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/web-booster.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    plugins: basePlugins
  }
];
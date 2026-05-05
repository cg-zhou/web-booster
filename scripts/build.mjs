import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import rollupConfig from '../rollup.config.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, '..');
const distDir = path.join(rootDir, 'dist');
const configs = Array.isArray(rollupConfig) ? rollupConfig : [rollupConfig];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const config of configs) {
  const bundle = await rollup({
    input: config.input,
    plugins: config.plugins
  });

  const outputs = Array.isArray(config.output) ? config.output : [config.output];

  for (const output of outputs) {
    await bundle.write(output);
  }

  await bundle.close();
}

await import('./build-css.mjs');
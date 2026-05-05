import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, '..');
const distDir = path.join(rootDir, 'dist');

await mkdir(distDir, { recursive: true });
await cp(
  path.join(rootDir, 'src/styles/web-booster.css'),
  path.join(distDir, 'web-booster.css')
);

console.log('Copied web-booster.css to dist/.');
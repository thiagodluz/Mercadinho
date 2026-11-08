import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
const source = path => new URL(path, root);
const beta = process.argv.includes('--beta');
await mkdir(source('www/'), { recursive: true });

const index = await readFile(source(beta ? 'beta/index.html' : 'index.html'), 'utf8');
const entry = beta ? '<script>\n' : '<script src="fases.js"></script>';
if (!index.includes(entry)) throw new Error('Ponto de entrada das fases não encontrado.');

const files = [
  writeFile(source('www/index.html'), index.replace(entry, '<script src="android-bridge.js"></script>\n  ' + entry)),
  build({
    entryPoints: [fileURLToPath(source('tools/android-bridge.mjs'))],
    outfile: fileURLToPath(source('www/android-bridge.js')),
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'chrome111',
  }),
];
if (!beta) {
  files.push(
    cp(source('fases.js'), source('www/fases.js')),
    cp(source('assets/'), source('www/assets/'), { recursive: true }),
  );
}
await Promise.all(files);

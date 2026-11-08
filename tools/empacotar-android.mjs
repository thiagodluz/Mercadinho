import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
const source = path => new URL(path, root);
await mkdir(source('www/'), { recursive: true });

const index = await readFile(source('index.html'), 'utf8');
const gameScripts = '<script src="fases.js"></script>';
if (!index.includes(gameScripts)) throw new Error('Ponto de entrada das fases não encontrado.');

await Promise.all([
  writeFile(source('www/index.html'), index.replace(gameScripts, '<script src="android-haptics.js"></script>\n  ' + gameScripts)),
  cp(source('fases.js'), source('www/fases.js')),
  cp(source('assets/'), source('www/assets/'), { recursive: true }),
  build({
    entryPoints: [fileURLToPath(source('tools/android-haptics.mjs'))],
    outfile: fileURLToPath(source('www/android-haptics.js')),
    bundle: true,
    minify: true,
    format: 'iife',
    target: 'chrome111',
  }),
]);

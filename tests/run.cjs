const { spawnSync } = require('node:child_process');
const path = require('node:path');
const beta = spawnSync('python3', [path.join(__dirname, '../tools/empacotar-beta-web.py'), '--check'], { stdio: 'inherit' });
if (beta.error || beta.status !== 0) process.exit(beta.status || 1);
for (const name of ['armazenamento', 'persistencia', 'interrupcao', 'mecanicas', 'solucoes', 'infinitas', 'campanha', 'pausa', 'acessibilidade']) {
  const result = spawnSync(process.execPath, [path.join(__dirname, `${name}.cjs`)], { stdio: 'inherit' });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}

const { spawnSync } = require('node:child_process');
const path = require('node:path');
for (const name of ['persistencia', 'interrupcao', 'mecanicas', 'solucoes', 'pausa', 'acessibilidade']) {
  const result = spawnSync(process.execPath, [path.join(__dirname, `${name}.cjs`)], { stdio: 'inherit' });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}

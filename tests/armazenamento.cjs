const assert = require('node:assert/strict');

async function main() {
  const { createNativeStorage } = await import('../tools/native-storage.mjs');
  const data = { 'mercadinho-unlocked': '12', 'mercadinho-partida-v1': '{"level":11}' };
  const local = {
    getItem: key => data[key] ?? null,
    setItem: (key, value) => { data[key] = value; }
  };
  let native = null;
  const preferences = {
    async get() { return { value: native }; },
    async set({ value }) { native = value; }
  };
  const store = await createNativeStorage(preferences, local);
  assert.equal(store.getItem('mercadinho-unlocked'), '12');
  assert.equal(JSON.parse(native).values['mercadinho-partida-v1'], '{"level":11}');
  store.setItem('mercadinho-unlocked', '13');
  store.setItem('mercadinho-beta-audio', '{"music":true}');
  store.removeItem('mercadinho-partida-v1');
  // A reabertura antes de terminar a fila recupera o espelho mais recente.
  const recovered = await createNativeStorage(preferences, local);
  assert.equal(recovered.getItem('mercadinho-unlocked'), '13');
  assert.equal(recovered.getItem('mercadinho-partida-v1'), null);
  assert.equal(recovered.getItem('mercadinho-beta-audio'), '{"music":true}');
  // Aguarde a fila anterior antes de simular uma nova abertura do processo.
  await new Promise(resolve => setImmediate(resolve));
  const reopened = await createNativeStorage(preferences, local);
  assert.equal(reopened.getItem('mercadinho-unlocked'), '13');
  await assert.rejects(createNativeStorage({ async get() { throw new Error('falha'); } }, local));
  await assert.rejects(createNativeStorage({ async get() { return { value: 'inválido' }; } }, local));
  console.log('Migração, gravação ordenada, recuperação e erros do armazenamento nativo verificados.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });

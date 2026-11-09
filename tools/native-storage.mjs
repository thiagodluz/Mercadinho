const snapshotKey = 'mercadinho-native-storage-v1';
const suffixes = ['unlocked', 'layout-seed', 'partida-v1', 'reduced-motion', 'gesture-margin', 'audio'];
const keys = suffixes.flatMap(suffix => [`mercadinho-${suffix}`, `mercadinho-beta-${suffix}`]);

function parseSnapshot(raw) {
  try {
    const snapshot = JSON.parse(raw);
    if (!Number.isSafeInteger(snapshot.revision) || snapshot.revision < 0 || !snapshot.values ||
        typeof snapshot.values !== 'object' || Array.isArray(snapshot.values)) return null;
    if (Object.entries(snapshot.values).some(([key, value]) => !keys.includes(key) || typeof value !== 'string')) return null;
    return snapshot;
  } catch { return null; }
}

// O espelho local protege a última alteração enquanto a gravação nativa está pendente.
export async function createNativeStorage(preferences, local, reportError = console.error) {
  const native = await preferences.get({ key: snapshotKey });
  const nativeSnapshot = native.value === null ? null : parseSnapshot(native.value);
  if (native.value !== null && !nativeSnapshot) throw new Error('Dados nativos inválidos.');
  let backup = null;
  try { backup = parseSnapshot(local.getItem(snapshotKey)); } catch {}
  let snapshot = backup && (!nativeSnapshot || backup.revision > nativeSnapshot.revision) ? backup : nativeSnapshot;
  if (!snapshot) {
    const values = {};
    for (const key of keys) {
      const value = local.getItem(key);
      if (value !== null) values[key] = value;
    }
    snapshot = { revision: 0, values };
  }
  if (!nativeSnapshot || snapshot.revision > nativeSnapshot.revision) {
    await preferences.set({ key: snapshotKey, value: JSON.stringify(snapshot) });
  }
  let queue = Promise.resolve();
  function persist() {
    snapshot.revision += 1;
    const value = JSON.stringify(snapshot);
    try { local.setItem(snapshotKey, value); } catch (error) { reportError(error); }
    queue = queue.catch(() => {}).then(() => preferences.set({ key: snapshotKey, value }));
    queue.catch(reportError);
  }
  return {
    getItem(key) { return snapshot.values[key] ?? null; },
    setItem(key, value) {
      if (!keys.includes(key)) throw new Error('Chave de salvamento desconhecida.');
      snapshot.values[key] = String(value);
      persist();
    },
    removeItem(key) {
      if (!keys.includes(key)) throw new Error('Chave de salvamento desconhecida.');
      delete snapshot.values[key];
      persist();
    }
  };
}

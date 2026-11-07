const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const script = fs.readFileSync('index.html', 'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
const marker = '      updateAudioControls();\n\n      function itemMarkup';
assert(script.includes(marker));
const source = script.replace(marker, `
      globalThis.testGame = {
        level: levelAt,
        search: maxStates => findSolutionHint(shelves, ++hintRequest, maxStates),
        start(index) { unlocked = index; openLevel(index); },
        move: ({from, to}) => move(from, to),
        state: () => ({ currentLevel, completed, animating, shelves, history }),
        setBoard(state) {
          shelves = copy(state);
          history = [copy(state)];
          hintPlan = [];
          cancelHint();
          render();
        }
      };
${marker}`);

function setup(index, seed = 12345, shared) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      handlers: {}, classList: { toggle() {} }, setAttribute() {}, querySelector() { return null; },
      addEventListener(event, callback) { this.handlers[event] = callback; }
    });
    return elements.get(id);
  }
  const storage = shared || { 'mercadinho-unlocked': String(index), 'mercadinho-layout-seed': String(seed) };
  let advance;
  const context = vm.createContext({
    document: { documentElement: element('html'), getElementById: element, addEventListener() {} },
    window: { matchMedia: () => ({ matches: true }) },
    navigator: {},
    confirm: () => true,
    localStorage: {
      getItem: key => storage[key] ?? null,
      setItem: (key, value) => { storage[key] = value; },
      removeItem: key => { delete storage[key]; }
    },
    setTimeout(callback, delay) {
      if (delay !== 1800) return setTimeout(callback, delay);
      advance = callback;
      return 'advance';
    },
    clearTimeout(timer) {
      if (timer === 'advance') advance = null;
      else clearTimeout(timer);
    }
  });
  vm.runInContext(source, context);
  return { ...context.testGame, element, advance: () => advance() };
}

async function play(game, path, label) {
  for (const step of path) {
    assert(game.move(step), `Jogada inválida em ${label}`);
    while (game.state().animating) await new Promise(resolve => setTimeout(resolve, 2));
  }
}

async function main() {
  const legacy = JSON.parse(fs.readFileSync('tests/fixtures/legacy-level9.json', 'utf8'));
  const previous = JSON.parse(legacy['mercadinho-partida-v1']);
  assert.equal(JSON.stringify(setup(8, 12345, legacy).state().shelves), JSON.stringify(previous.shelves));
  const legacyV2 = JSON.parse(fs.readFileSync('tests/fixtures/legacy-generator-v2.json', 'utf8'));
  const previousV2 = JSON.parse(legacyV2['mercadinho-partida-v1']);
  const legacyGame = setup(8, 12345, legacyV2);
  assert.equal(JSON.stringify(legacyGame.state().shelves), JSON.stringify(previousV2.shelves));
  assert.equal((await legacyGame.search()).status, 'solved');
  legacyGame.element('restart').handlers.click();
  assert.equal(JSON.parse(legacyV2['mercadinho-partida-v1']).generator, 2);
  assert.equal(JSON.stringify(setup(8, 12345, legacyV2).state().shelves), JSON.stringify(legacyGame.state().shelves));
  const remaining = await legacyGame.search();
  assert.equal(remaining.status, 'solved');
  await play(legacyGame, remaining.path, 'fase antiga');
  legacyGame.advance();
  assert.equal(legacyGame.state().currentLevel, 9);
  assert.equal(JSON.parse(legacyV2['mercadinho-partida-v1']).generator, 3);
  assert(legacyGame.state().shelves.some(shelf => shelf.back.length === 2));

  const storage = { 'mercadinho-unlocked': '8', 'mercadinho-layout-seed': '12345' };
  const game = setup(8, 12345, storage);
  const start = await game.search();
  assert.equal(start.status, 'solved');
  await play(game, start.path.slice(0, 1), 'retomada');
  const resumed = setup(8, 12345, storage);
  assert.equal(JSON.stringify(resumed.state().shelves), JSON.stringify(game.state().shelves));
  assert.equal((await resumed.search()).status, 'solved');

  const tiers = [[8, 6], [11, 6], [12, 7], [19, 7], [20, 8], [29, 8], [30, 10], [59, 10], [60, 12], [99, 12], [100, 14], [999, 14]];
  const seeds = [0, 1, 12345, 54321, 2147483648, 4294967295];
  for (const seed of seeds) {
    const player = setup(8, seed);
    const again = setup(8, seed);
    for (const [index, expected] of tiers) {
      player.start(index);
      const label = `fase ${index + 1}, semente ${seed}`;
      const board = player.state().shelves;
      assert.equal(JSON.stringify(board), JSON.stringify(again.level(index).shelves), label);
      assert.equal(new Set(board.flatMap(shelf => shelf.front.filter(Boolean))).size, expected, label);
      const box = board.find(shelf => shelf.type === 'dispenser');
      const sequence = [box.front[1], ...box.queue];
      assert(sequence.every((item, position) => position === 0 || item !== sequence[position - 1]), `Fila repetida em ${label}`);
      const layers = board.flatMap(shelf => shelf.back);
      assert(layers.length >= 2 && layers.every(row => new Set(row.filter(Boolean)).size > 1), `Camadas sem variedade em ${label}`);
      if (index >= 20) {
        assert(board.filter(shelf => shelf.back.length > 0).length >= 2, `Poucas prateleiras com camadas em ${label}`);
      }
      const quantities = new Map();
      for (const shelf of board) {
        for (const item of [...shelf.front, ...shelf.back.flat(), ...(shelf.queue || [])]) {
          if (item) quantities.set(item, (quantities.get(item) || 0) + 1);
        }
      }
      assert([...quantities.values()].every(count => count % 3 === 0), `Quantidade inválida em ${label}`);
      const result = await player.search();
      assert.equal(result.status, 'solved', label);
      await play(player, result.path, label);
      assert(player.state().completed, `Sem vitória em ${label}`);
    }
  }

  game.start(7);
  await play(game, (await game.search()).path, 'transição da fase 8');
  game.advance();
  assert.equal(game.state().currentLevel, 8);
  assert.equal(game.state().completed, false);

  game.start(100);
  await game.element('hint').handlers.click();
  assert.match(game.element('message').textContent, /^Mova /);
  assert.equal((await game.search(1)).status, 'limit');

  game.start(8);
  const firstBoard = game.state().shelves;
  const dispenser = firstBoard.findIndex(shelf => shelf.type === 'dispenser');
  const vacancy = firstBoard.findIndex(shelf => shelf.type !== 'dispenser' && shelf.front.includes(null));
  const otherShelf = firstBoard.findIndex((shelf, index) => index !== dispenser && index !== vacancy);
  await play(game, [
    { from: { shelf: otherShelf, slot: 0 }, to: { shelf: vacancy, slot: firstBoard[vacancy].front.indexOf(null) } },
    { from: { shelf: dispenser, slot: 1 }, to: { shelf: otherShelf, slot: 0 } }
  ], 'impasse em fase gerada');
  assert.match(game.element('message').textContent, /Sem movimentos disponíveis/);
  game.element('undo').handlers.click();
  assert.equal((await game.search()).status, 'solved');

  game.setBoard([
    { front: ['milk', 'coffee', null], back: [] },
    { front: ['milk', 'coffee', null], back: [] },
    { front: ['milk', 'coffee', 'tea'], back: [['tea', 'tea', null]], lock: { remaining: 1, order: 0 } }
  ]);
  assert.equal((await game.search()).status, 'dead-end');
  await game.element('hint').handlers.click();
  assert.match(game.element('message').textContent, /ficou sem solução.*Desfaça/);

  game.setBoard([{ front: ['milk', 'coffee', 'tea'], back: [] }]);
  assert.match(game.element('message').textContent, /Sem movimentos disponíveis/);
  console.log(`${seeds.length * tiers.length} fases geradas concluídas. Retomada, dica, limite e impasses verificados.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });

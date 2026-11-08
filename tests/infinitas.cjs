const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const script = fs.readFileSync('index.html', 'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
const campaignScript = fs.readFileSync('fases.js', 'utf8');
const marker = '      updateAudioControls();\n\n      function itemMarkup';
assert(script.includes(marker));
const source = script.replace(marker, `
      globalThis.testGame = {
        level: levelAt,
        initialHintPath,
        search: maxStates => findSolutionHint(shelves, ++hintRequest, maxStates),
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

function setup(index, seed = 12345, shared, campaign = true) {
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
  if (campaign) vm.runInContext(campaignScript, context);
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
  const saveKey = 'mercadinho-partida-v1';
  const storage = { 'mercadinho-unlocked': '7', 'mercadinho-layout-seed': '12345' };
  const game = setup(7, 12345, storage);
  const tutorial = await game.search();
  assert.equal(tutorial.status, 'solved');
  await play(game, tutorial.path, 'transição da fase 8');
  game.advance();
  assert.equal(game.state().currentLevel, 8);
  assert.equal(game.state().completed, false);
  assert.equal(JSON.parse(storage[saveKey]).generator, 4);

  const firstBoard = JSON.stringify(game.state().shelves);
  assert.equal(firstBoard, JSON.stringify(setup(8, 1).state().shelves));
  const path = game.initialHintPath();
  assert(path.length);
  await game.element('hint').handlers.click();
  assert.match(game.element('message').textContent, /^Mova /);
  assert.equal((await game.search(1)).status, 'limit');
  await play(game, path.slice(0, 1), 'partida da campanha');

  const savedV4 = storage[saveKey];
  const resumed = setup(8, 12345, storage);
  assert.equal(JSON.stringify(resumed.state().shelves), JSON.stringify(game.state().shelves));
  assert.equal(JSON.stringify(resumed.state().history), JSON.stringify(game.state().history));
  assert.equal((await resumed.search()).status, 'solved');
  resumed.element('undo').handlers.click();
  assert.equal(JSON.stringify(resumed.state().shelves), firstBoard);

  for (const generator of [undefined, 2, 3]) {
    const legacy = { ...storage, [saveKey]: JSON.stringify({ ...JSON.parse(savedV4), generator }) };
    const upgraded = setup(8, 12345, legacy);
    assert.equal(upgraded.state().currentLevel, 8);
    assert.equal(JSON.stringify(upgraded.state().shelves), firstBoard);
    assert.equal(upgraded.state().history.length, 0);
    await play(upgraded, path.slice(0, 1), 'primeira jogada após a atualização');
    assert.equal(JSON.parse(legacy[saveKey]).generator, 4);
  }

  const unavailable = { ...storage, [saveKey]: savedV4 };
  assert.match(setup(8, 12345, unavailable, false).element('message').textContent, /Recarregue/);
  assert.equal(unavailable[saveKey], savedV4);
  const missingOnAdvance = { 'mercadinho-unlocked': '7', 'mercadinho-layout-seed': '12345' };
  const tutorialOnly = setup(7, 12345, missingOnAdvance, false);
  await play(tutorialOnly, tutorial.path, 'transição sem banco de fases');
  tutorialOnly.advance();
  assert.match(tutorialOnly.element('message').textContent, /Recarregue/);
  assert.equal(setup(8, 12345, missingOnAdvance).state().currentLevel, 8);

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

  const endless = setup(207, 12345);
  await play(endless, endless.initialHintPath(), 'fase 208');
  endless.advance();
  assert.equal(endless.state().currentLevel, 208);
  assert.equal(JSON.stringify(endless.state().shelves), JSON.stringify(setup(208, 12345).state().shelves));
  assert.notEqual(JSON.stringify(endless.state().shelves), JSON.stringify(setup(208, 1).state().shelves));
  assert.equal(JSON.stringify(endless.level(208).layout), JSON.stringify(endless.level(158).layout));
  await play(endless, endless.initialHintPath(), 'fase 209');
  assert(endless.state().completed);
  console.log('Transições das fases 8 e 208, reinício de tabuleiros antigos, retomada, dicas e impasses verificados.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });

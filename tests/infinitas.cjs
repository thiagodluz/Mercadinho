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
        moves: () => possibleMoves(shelves),
        hintPath: () => hintPlan,
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

function setup(index, seed = 12345, shared, campaign = true, search = '', forceRecoveryLimit = false) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      handlers: {}, classList: { toggle() {} }, setAttribute() {}, querySelector() { return null; }, focus() {},
      addEventListener(event, callback) { this.handlers[event] = callback; }
    });
    return elements.get(id);
  }
  const storage = shared || { 'mercadinho-unlocked': String(index), 'mercadinho-layout-seed': String(seed) };
  let advance;
  const context = vm.createContext({
    document: { documentElement: element('html'), getElementById: element, addEventListener() {} },
    window: { matchMedia: () => ({ matches: true }) },
    location: { search },
    URLSearchParams,
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
  const gameSource = forceRecoveryLimit
    ? source.replace('findSolutionHint(expanded, request);', 'findSolutionHint(expanded, request, 1);')
    : source;
  vm.runInContext(gameSource, context);
  return { ...context.testGame, element, advance: () => advance(), canAdvance: () => Boolean(advance) };
}

async function play(game, path, label) {
  for (const step of path) {
    assert(game.move(step), `Jogada inválida em ${label}`);
    while (game.state().animating) await new Promise(resolve => setTimeout(resolve, 2));
  }
}

async function checkTutorialCues() {
  const intro = setup(0);
  const instructions = intro.element('instructions');
  const milk = { from: { shelf: 1, slot: 2 }, to: { shelf: 0, slot: 2 } };
  const coffee = { from: { shelf: 0, slot: 0 }, to: { shelf: 1, slot: 2 } };
  const jam = { from: { shelf: 0, slot: 1 }, to: { shelf: 2, slot: 0 } };
  const finish = { from: jam.to, to: { shelf: 0, slot: 2 } };
  assert.match(instructions.textContent, /toque no leite e depois na vaga/);
  await play(intro, [milk, coffee], 'trios iniciais');
  assert.match(instructions.textContent, /Mova a última geleia/);
  assert.equal(intro.state().shelves[0].back.length, 1);
  await play(intro, [jam], 'revelação sem trio');
  assert.match(instructions.textContent, /As duas geleias apareceram/);
  assert.deepEqual(Array.from(intro.state().shelves[0].front), ['jam', 'jam', null]);
  intro.element('undo').handlers.click();
  assert.match(instructions.textContent, /Mova a última geleia/);
  await play(intro, [jam, finish], 'último trio do tutorial');
  assert.equal(intro.state().completed, true);

  const box = setup(4);
  const takeBoxItem = shelf => ({ from: { shelf: 3, slot: 1 }, to: { shelf, slot: 2 } });
  await play(box, [takeBoxItem(1), takeBoxItem(2)], 'última vaga sem trio');
  assert.match(box.element('instructions').textContent, /Antes de tirar da caixa/);
  assert.equal(box.element('recover-undo').hidden, true);
  box.element('undo').handlers.click();
  await play(box, [takeBoxItem(0)], 'última vaga com trio possível');
  assert.match(box.element('instructions').textContent, /O produto da caixa completa um trio/);
  await play(box, [takeBoxItem(2)], 'trio que devolve espaço');
  assert.doesNotMatch(box.element('instructions').textContent, /Resta uma vaga/);
}

async function checkCascade() {
  const game = setup(5);
  const before = JSON.stringify(game.state().shelves);
  const badge = game.element('cascade-note');
  await play(game, [{ from: { shelf: 3, slot: 1 }, to: { shelf: 0, slot: 2 } }], 'trio que revela outro trio');
  assert.equal(badge.hidden, false);
  assert.equal(badge.textContent, 'Cascata ×2');
  assert.equal(game.state().history.length, 1);
  assert.equal(game.state().shelves[4].lock.remaining, 0);
  game.element('undo').handlers.click();
  assert.equal(badge.hidden, true);
  assert.equal(JSON.stringify(game.state().shelves), before);
}

async function checkExtraShelf() {
  const limited = setup(28, 12345, undefined, true, '', true);
  await play(limited, [
    { from: { shelf: 3, slot: 1 }, to: { shelf: 2, slot: 2 } },
    { from: { shelf: 3, slot: 1 }, to: { shelf: 4, slot: 1 } }
  ], 'impasse com busca limitada');
  await limited.element('recover-shelf').handlers.click();
  assert.equal(limited.state().shelves.at(-1).type, 'extra');
  assert.match(limited.element('message').textContent, /não conseguiu confirmar/);
  const storage = { 'mercadinho-unlocked': '28', 'mercadinho-layout-seed': '12345' };
  const game = setup(28, 12345, storage);
  const take = (shelf, slot) => ({ from: { shelf: 3, slot: 1 }, to: { shelf, slot } });
  assert.equal(game.element('recover-shelf').hidden, true);
  await play(game, [take(2, 2)], 'primeira retirada da fase 29');
  const beforeStall = JSON.stringify(game.state().shelves);
  await play(game, [take(4, 1)], 'segunda retirada da fase 29');
  const stalled = JSON.stringify(game.state().shelves);
  assert.equal(game.element('recover-shelf').hidden, false);
  await game.element('recover-shelf').handlers.click();
  assert.equal(game.element('recover-shelf').hidden, true);
  assert.match(game.element('board').innerHTML, /Prateleira extra, posição 3: Vaga livre/);
  assert.equal(JSON.stringify(game.state().shelves.slice(0, -1)), stalled);
  assert.equal(game.state().shelves.at(-1).type, 'extra');
  assert.equal(game.state().history.length, 2);

  const resumed = setup(28, 12345, storage);
  assert.equal(JSON.stringify(resumed.state().shelves), JSON.stringify(game.state().shelves));
  await resumed.element('hint').handlers.click();
  assert.match(resumed.element('message').textContent, /prateleira extra/);
  const solution = resumed.hintPath().slice();
  assert(solution.length);
  await play(resumed, solution, 'fase 29 recuperada com a prateleira extra');
  assert.equal(resumed.state().completed, true);

  game.element('undo').handlers.click();
  assert.equal(JSON.stringify(game.state().shelves.slice(0, -1)), beforeStall);
  assert.equal(game.state().shelves.at(-1).type, 'extra');
  game.element('restart').handlers.click();
  assert.equal(game.state().shelves.some(shelf => shelf.type === 'extra'), false);

  const blocked = setup(2);
  blocked.setBoard([{ front: ['tea', 'tea', 'tea'], back: [], lock: { remaining: 1, order: 0 } }]);
  const impossible = JSON.stringify(blocked.state().shelves);
  await blocked.element('recover-shelf').handlers.click();
  assert.match(blocked.element('message').textContent, /ainda não resolvem/);
  assert.equal(JSON.stringify(blocked.state().shelves), impossible);
}

async function checkSoldOutShelf() {
  const storage = { 'mercadinho-unlocked': '19', 'mercadinho-layout-seed': '12345' };
  const campaignGame = setup(19, 12345, storage);
  await play(campaignGame, campaignGame.initialHintPath().slice(0, 1), 'partida da campanha antes do teste');
  const savedCampaign = { ...storage };
  const experiment = setup(19, 12345, storage, true, '?teste=esgotada');
  const board = experiment.element('board');
  const milk = { from: { shelf: 1, slot: 0 }, to: { shelf: 0, slot: 2 } };
  const lastCoffee = { from: { shelf: 0, slot: 0 }, to: { shelf: 3, slot: 0 } };
  assert.match(board.innerHTML, /Fecha ao esvaziar/);

  await play(experiment, [milk], 'revelação do café na prateleira que fecha');
  assert.equal(experiment.state().shelves[0].front[0], 'coffee');
  assert.match(board.innerHTML, /Fecha ao esvaziar/);
  const beforeClosing = JSON.stringify(experiment.state().shelves);
  await play(experiment, [lastCoffee], 'retirada do último produto');
  assert.match(board.innerHTML, /aria-label="Prateleira 1 esgotada"/);
  assert.match(experiment.element('message').textContent, /Prateleira esgotada/);
  assert.equal(experiment.move({ from: lastCoffee.to, to: lastCoffee.from }), false);
  assert.equal(experiment.moves().some(move => move.to.shelf === 0), false);

  experiment.element('undo').handlers.click();
  assert.equal(JSON.stringify(experiment.state().shelves), beforeClosing);
  assert.match(board.innerHTML, /Fecha ao esvaziar/);
  await play(experiment, [lastCoffee], 'fechamento após desfazer');
  await experiment.element('hint').handlers.click();
  const route = experiment.hintPath().slice();
  assert(route.length);
  await play(experiment, route, 'solução com a prateleira esgotada');
  assert.equal(experiment.state().completed, true);
  assert.equal(experiment.canAdvance(), false);

  experiment.element('restart').handlers.click();
  assert.match(board.innerHTML, /Fecha ao esvaziar/);
  await play(experiment, [
    milk,
    { from: { shelf: 1, slot: 1 }, to: { shelf: 0, slot: 1 } },
    { from: { shelf: 2, slot: 0 }, to: { shelf: 0, slot: 2 } }
  ], 'fechamento por um trio');
  assert.match(board.innerHTML, /aria-label="Prateleira 1 esgotada"/);
  assert.deepEqual(storage, savedCampaign);
}

async function main() {
  await checkTutorialCues();
  await checkCascade();
  await checkExtraShelf();
  await checkSoldOutShelf();
  const saveKey = 'mercadinho-partida-v1';
  const storage = { 'mercadinho-unlocked': '7', 'mercadinho-layout-seed': '12345' };
  const game = setup(7, 12345, storage);
  const tutorial = await game.search();
  assert.equal(tutorial.status, 'solved');
  await play(game, tutorial.path, 'transição da fase 8');
  game.advance();
  assert.equal(game.state().currentLevel, 8);
  assert.equal(game.state().completed, false);
  assert.equal(JSON.parse(storage[saveKey]).generator, 5);

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

  for (const generator of [undefined, 2, 3, 4]) {
    const legacy = { ...storage, [saveKey]: JSON.stringify({ ...JSON.parse(savedV4), generator }) };
    const upgraded = setup(8, 12345, legacy);
    assert.equal(upgraded.state().currentLevel, 8);
    assert.equal(JSON.stringify(upgraded.state().shelves), firstBoard);
    assert.equal(upgraded.state().history.length, 0);
    await play(upgraded, path.slice(0, 1), 'primeira jogada após a atualização');
    assert.equal(JSON.parse(legacy[saveKey]).generator, 5);
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

  game.setBoard([{ front: ['milk', 'coffee', null], back: [] }]);
  assert.match(game.element('message').textContent, /Sem movimentos disponíveis/);
  assert.equal(game.element('hint').disabled, true, 'Trocar de vaga na mesma prateleira não resolve o impasse');

  const originalPhase30 = [
    { front: ['coffee', 'water', 'coffee'], back: [] },
    { front: ['cookies', 'tea', 'water'], back: [], lock: { remaining: 2, order: 0 } },
    { front: ['flour', 'coffee', 'milk'], back: [['milk', 'coffee', null], ['coffee', 'coffee', 'tea']] },
    { front: ['coffee', 'tea', 'milk'], back: [['tea', 'sauce', 'sauce'], ['cookies', 'coffee', 'coffee']] },
    { front: ['tea', null, 'tea'], back: [['flour', 'cookies', 'coffee']] },
    { front: ['water', 'sauce', 'coffee'], back: [] },
    { front: ['cookies', 'tea', 'coffee'], back: [] },
    { front: ['flour', null, 'tea'], back: [], lock: { remaining: 1, order: 1 } },
    { type: 'dispenser', front: [null, 'cookies', null], back: [], queue: ['tea', 'cookies'] }
  ];
  const stalledStorage = {
    'mercadinho-unlocked': '29',
    'mercadinho-layout-seed': '12345',
    [saveKey]: JSON.stringify({ version: 1, generator: 5, level: 29, shelves: originalPhase30, history: [] })
  };
  const phase30 = setup(29, 12345, stalledStorage);
  const beforeStall = JSON.stringify(phase30.state().shelves);
  assert.equal(beforeStall, JSON.stringify(originalPhase30));
  assert.equal(phase30.initialHintPath().length, 0, 'A dica pré-calculada é exclusiva do tabuleiro novo');
  await phase30.element('hint').handlers.click();
  assert.match(phase30.element('message').textContent, /^Mova /);
  const stallMove = { from: { shelf: 8, slot: 1 }, to: { shelf: 4, slot: 1 } };
  assert.equal(phase30.element('recover-undo').hidden, true);
  await play(phase30, [stallMove], 'última vaga livre na fase 30');
  assert.equal(phase30.element('recover-undo').hidden, false);
  assert.equal(phase30.state().shelves[8].front[1], 'tea');
  const resumedStall = setup(29, 12345, stalledStorage);
  assert.match(resumedStall.element('message').textContent, /Desfaça a última jogada/);
  assert.equal(resumedStall.element('recover-undo').hidden, false);
  resumedStall.element('recover-undo').handlers.click();
  assert.equal(JSON.stringify(resumedStall.state().shelves), beforeStall);
  assert.equal(resumedStall.element('recover-undo').hidden, true);
  assert.equal(resumedStall.element('hint').disabled, false);
  resumedStall.element('restart').handlers.click();
  assert.notEqual(JSON.stringify(resumedStall.state().shelves), beforeStall);
  assert(resumedStall.initialHintPath().length, 'Reiniciar carrega o tabuleiro novo e sua dica');
  for (const opening of resumedStall.moves()) {
    const freshPhase30 = setup(29);
    await play(freshPhase30, [opening], 'primeiro lance na fase 30 revisada');
    assert.equal(freshPhase30.element('recover-undo').hidden, true, 'Nenhum primeiro lance fecha a fase 30');
  }

  const dispenserStalls = [
    { level: 20, dispenser: 1, destinations: [[4, 2], [5, 0]] },
    { level: 29, dispenser: 3, destinations: [[2, 2], [4, 1]] }
  ];
  for (const { level, dispenser, destinations } of dispenserStalls) {
    const trial = setup(level - 1);
    const path = destinations.map(([shelf, slot]) => ({
      from: { shelf: dispenser, slot: 1 }, to: { shelf, slot }
    }));
    await play(trial, path.slice(0, 1), `primeira retirada da fase ${level}`);
    assert.equal(trial.element('recover-undo').hidden, true);
    const beforeLastMove = JSON.stringify(trial.state().shelves);
    await play(trial, path.slice(1), `segunda retirada da fase ${level}`);
    assert.equal(trial.element('recover-undo').hidden, false);
    const recovery = trial.element('recover-shelf').handlers.click();
    trial.element('recover-undo').handlers.click();
    await recovery;
    assert.equal(JSON.stringify(trial.state().shelves), beforeLastMove);
    assert.equal(trial.element('recover-undo').hidden, true);
  }

  let shortened = false;
  for (const level of [9, 50, 80]) {
    const midGame = setup(level - 1);
    for (let turn = 0; turn < 8; turn++) {
      const moves = midGame.moves();
      await play(midGame, [moves[(turn * 17 + 3) % moves.length]], `preparação da fase ${level}`);
    }
    assert.equal(midGame.initialHintPath().length, 0);
    const original = await midGame.search();
    assert.equal(original.status, 'solved', `Busca no meio da fase ${level}`);
    await midGame.element('hint').handlers.click();
    assert.match(midGame.element('message').textContent, /^Mova /);
    const hint = midGame.hintPath().slice();
    assert(hint.length <= original.path.length, `Dica maior na fase ${level}`);
    if (hint.length < original.path.length) shortened = true;
    await play(midGame, hint, `dica encurtada da fase ${level}`);
    assert(midGame.state().completed, `Dica não concluiu a fase ${level}`);
    console.log(`Dica no meio da fase ${level}: ${original.path.length} → ${hint.length} jogadas.`);
  }
  assert(shortened, 'Ao menos uma dica deve ficar mais curta');

  const endless = setup(207, 12345);
  assert.equal(endless.element('win').hidden, true);
  await play(endless, endless.initialHintPath(), 'fase 208');
  assert.equal(endless.element('win').hidden, false);
  assert.equal(endless.element('win-title').textContent, 'Fase 208 concluída!');
  assert.match(endless.element('win-message').textContent, /fase 209 começa em instantes/);
  endless.advance();
  assert.equal(endless.element('win').hidden, true);
  assert.equal(endless.state().currentLevel, 208);
  assert.equal(JSON.stringify(endless.state().shelves), JSON.stringify(setup(208, 12345).state().shelves));
  assert.notEqual(JSON.stringify(endless.state().shelves), JSON.stringify(setup(208, 1).state().shelves));
  assert.equal(JSON.stringify(endless.level(208).layout), JSON.stringify(endless.level(158).layout));
  await play(endless, endless.initialHintPath(), 'fase 209');
  assert(endless.state().completed);
  console.log('Transições das fases 8 e 208, reinício de tabuleiros antigos, retomada, dicas e impasses verificados.');

  const testStorage = { 'mercadinho-unlocked': '19', 'mercadinho-layout-seed': '12345' };
  const normal = setup(19, 12345, testStorage);
  await play(normal, normal.initialHintPath().slice(0, 1), 'campanha antes do teste');
  const normalBoard = JSON.stringify(normal.state().shelves);
  const originalStorage = { ...testStorage };
  for (const number of [20, 29, 30]) {
    const trial = setup(19, 12345, testStorage, true, `?teste=${number}`);
    assert.equal(trial.state().currentLevel, number - 1);
    assert.equal(trial.state().history.length, 0);
    assert.equal(JSON.stringify(trial.state().shelves), JSON.stringify(trial.level(number - 1).shelves));
    await play(trial, trial.initialHintPath(), `teste da fase ${number}`);
    assert(trial.state().completed);
    assert(!trial.canAdvance());
    assert.equal(trial.element('win').hidden, false);
    assert.match(trial.element('win-message').textContent, /escolha outra fase de teste/);
    trial.element('restart').handlers.click();
    assert.equal(trial.state().currentLevel, number - 1);
    assert(!trial.state().completed);
    assert.equal(trial.element('win').hidden, true);
    trial.element('reset-progress').handlers.click();
    assert.deepEqual(testStorage, originalStorage);
  }
  const resumedCampaign = setup(19, 12345, testStorage, true, '?teste=999');
  assert.equal(JSON.stringify(resumedCampaign.state().shelves), normalBoard);
  console.log('Fases de teste abertas, concluídas e reiniciadas sem alterar o progresso salvo.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });

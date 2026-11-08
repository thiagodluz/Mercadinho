// Mede uma fase usando as regras reais do jogo.
const { criarAleatorio } = require('./gerador.cjs');

// Mesma busca da dica do jogo (DFS), porém síncrona e com limite de estados.
function resolver(R, inicial, maxEstados = 20000) {
  if (R.isSolved(inicial)) return { ok: true, caminho: [], estados: 1 };
  const pilha = [{ estado: inicial, jogadas: R.possibleMoves(inicial) }];
  const vistos = new Set([R.searchKey(inicial)]);
  const caminho = [];
  while (pilha.length) {
    const no = pilha[pilha.length - 1];
    const jogada = no.jogadas.pop();
    if (!jogada) { pilha.pop(); caminho.pop(); continue; }
    const prox = R.solveMove(no.estado, jogada.from, jogada.to);
    const chave = R.searchKey(prox);
    if (vistos.has(chave)) continue;
    if (R.isSolved(prox)) return { ok: true, caminho: [...caminho, jogada], estados: vistos.size };
    if (vistos.size >= maxEstados) return { ok: false, motivo: 'limite', estados: vistos.size };
    vistos.add(chave);
    caminho.push(jogada);
    pilha.push({ estado: prox, jogadas: R.possibleMoves(prox) });
  }
  return { ok: false, motivo: 'sem-solucao', estados: vistos.size };
}

// "Jogador casual" simulado: prefere jogadas que formam pares/trios
// (a pontuação de possibleMoves), mas erra com alguma frequência.
// temperatura alta = joga mais ao acaso.
function partidaSimulada(R, inicial, aleatorio, temperatura, limite = 120) {
  let estado = inicial;
  for (let passo = 0; passo < limite; passo++) {
    if (R.isSolved(estado)) return true;
    const jogadas = R.possibleMoves(estado);
    if (!jogadas.length) return false;
    const pesos = jogadas.map(j => Math.exp(j.score / temperatura));
    let sorteio = aleatorio() * pesos.reduce((a, b) => a + b, 0);
    let escolhida = jogadas[jogadas.length - 1];
    for (let i = 0; i < jogadas.length; i++) { sorteio -= pesos[i]; if (sorteio <= 0) { escolhida = jogadas[i]; break; } }
    estado = R.solveMove(estado, escolhida.from, escolhida.to);
  }
  return false;
}

// Dificuldade = 1 - taxa de vitória do jogador casual simulado (0 = trivial, 1 = impossível p/ ele).
function dificuldade(R, fase, partidas = 60, temperatura = 4, semente = 7) {
  const aleatorio = criarAleatorio(semente);
  let vitorias = 0;
  for (let i = 0; i < partidas; i++) if (partidaSimulada(R, R.copy(fase.shelves), aleatorio, temperatura)) vitorias++;
  return 1 - vitorias / partidas;
}

// Impressão digital que NÃO muda ao trocar nomes de produtos, ordem das vagas
// ou ordem das prateleiras. Se duas fases têm impressões diferentes, com certeza
// são quebra-cabeças diferentes (o contrário não é garantido: é um limite inferior).
function assinatura(fase) {
  const padrao = l => { const c = {}; let vazio = 0; for (const x of l) x ? c[x] = (c[x] || 0) + 1 : vazio++; return Object.values(c).sort().join('') + '_' + vazio; };
  const contagem = {};
  for (const s of fase.shelves) for (const x of [...s.front, ...s.back.flat(), ...(s.queue || [])]) if (x) contagem[x] = (contagem[x] || 0) + 1;
  const partes = fase.shelves.map(s => [s.type || 'n', padrao(s.front), s.back.map(padrao).join('|'), (s.queue || []).length, s.lock ? s.lock.remaining : 0].join(':'));
  return partes.sort().join('/') + '#' + Object.values(contagem).sort().join(',');
}

module.exports = { resolver, dificuldade, partidaSimulada, assinatura };

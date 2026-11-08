// Monta a campanha (fases 9 em diante) escolhendo, para cada fase, o candidato
// cuja dificuldade medida fica mais perto da curva-alvo.
const R = require('./regras.cjs')(process.argv[2]);
const { gerarFase, criarAleatorio } = require('./gerador.cjs');
const { resolver, dificuldade, assinatura } = require('./avaliar.cjs');
const fs = require('node:fs');
const { encurtar } = require('./encurtar.cjs');

const base = process.argv[5] ? JSON.parse(fs.readFileSync(process.argv[5], 'utf8')) : [];
const porNumero = new Map(base.map(fase => [fase.numero, fase]));
const temRepeticaoNaCaixa = ({ shelves }) => shelves.some(shelf =>
  shelf.queue?.some((item, i) => item === (i ? shelf.queue[i - 1] : shelf.front[1]))
);

const catalogo = Object.keys(R.products);
const PRIMEIRA = 9, ULTIMA = Number(process.argv[3] || 208), CANDIDATOS = Number(process.argv[4] || 16);

// Curva-alvo: sobe rápido no começo e depois devagar; a cada 10 fases um
// "desafio" (mais difícil) e no meio de cada dezena um "descanso" (mais fácil).
function alvo(n) {
  const base = 0.10 + 0.55 * (1 - Math.exp(-(n - PRIMEIRA) / 40));
  if (n % 10 === 0) return Math.min(0.85, base + 0.15);
  if (n % 10 === 5) return base * 0.5;
  return base;
}

// Faixas de progressão: quais mecânicas e tamanhos podem aparecer.
const sortear = (r, a, b) => a + Math.floor(r() * (b - a + 1));
// Converte a dificuldade-alvo na "fase equivalente" da curva base, para que um
// descanso na fase 185 use parâmetros de uma fase ~30 e um desafio use os de uma fase mais adiante.
function faseEquivalente(meta) {
  const x = Math.min(0.999, Math.max(0, (meta - 0.10) / 0.55));
  return Math.round(PRIMEIRA - 40 * Math.log(1 - x));
}
function parametros(n, r) {
  let p;
  if (n <= 20) p = { prateleiras: sortear(r, 4, 6), fundos: sortear(r, 2, 4), fila: sortear(r, 0, 4), correntes: 0, folgas: sortear(r, 2, 4) };
  else if (n <= 40) p = { prateleiras: sortear(r, 4, 7), fundos: sortear(r, 2, 5), fila: sortear(r, 0, 5), correntes: sortear(r, 0, 1), folgas: sortear(r, 2, 4) };
  else if (n <= 80) p = { prateleiras: sortear(r, 5, 8), fundos: sortear(r, 3, 8), fila: sortear(r, 3, 6), correntes: sortear(r, 0, 2), folgas: sortear(r, 2, 4) };
  else p = { prateleiras: sortear(r, 5, 9), fundos: sortear(r, 4, 10), fila: sortear(r, 4, 8), correntes: sortear(r, 1, 2), folgas: sortear(r, 2, 3) };
  p.fundos = Math.min(p.fundos, 2 * p.prateleiras);
  p.tipos = Math.min(14, 3 + Math.floor((n - PRIMEIRA) / 12) + sortear(r, 0, 2));
  return p;
}

const fases = [];
const reservadas = new Set(base.filter(fase => !temRepeticaoNaCaixa(fase)).map(assinatura));
const vistas = new Set();
let anterior = null;
const inicio = Date.now();
let alteradas = 0;
for (let n = PRIMEIRA; n <= ULTIMA; n++) {
  const r = criarAleatorio(n * 2654435761);
  const meta = alvo(n);
  const original = porNumero.get(n);
  const candidatos = [];
  function avaliar(fase, preservar = false) {
    if (!fase) return;
    const sig = assinatura(fase);
    if (vistas.has(sig) || (!preservar && reservadas.has(sig))) return;
    const sol = resolver(R, fase.shelves, 8000);
    if (!sol.ok) return;
    const formato = fase.layout.join('-');
    const erro = preservar ? 0 : Math.abs(dificuldade(R, fase, 40, 4, 7) - meta) + (formato === anterior ? 0.05 : 0);
    candidatos.push({ fase, sig, formato, sol, erro });
  }
  if (original && !temRepeticaoNaCaixa(original)) avaliar(original, true);
  if (!candidatos.length) {
    for (let k = 0; k < CANDIDATOS; k++) {
      const p = parametros(Math.max(PRIMEIRA, Math.min(faseEquivalente(meta), n + 60)), r);
      avaliar(gerarFase(p, (n * 1000 + k) >>> 0, catalogo));
    }
    alteradas++;
  }
  candidatos.sort((a, b) => a.erro - b.erro);
  const melhor = candidatos[0];
  if (!melhor) throw new Error(`Nenhum candidato válido para a fase ${n}`);
  vistas.add(melhor.sig);
  anterior = melhor.formato;
  const { shelves, layout } = melhor.fase;
  const caminho = encurtar(R, shelves, melhor.sol.caminho) || melhor.sol.caminho;
  const codificar = ({ shelf, slot }) => (shelf * 3 + slot).toString(36);
  const hint = caminho.map(({ from, to }) => codificar(from) + codificar(to)).join('');
  fases.push({ layout, shelves, hint });
}
fs.writeFileSync('fases.js', '// Gerado por tools/fases/campanha.cjs.\nglobalThis.mercadinhoCampanha = [\n' + fases.map(fase => JSON.stringify(fase)).join(',\n') + '\n];\n');
console.log(`${fases.length} fases, ${alteradas} geradas novamente, ${Math.round((Date.now() - inicio) / 1000)} s.`);

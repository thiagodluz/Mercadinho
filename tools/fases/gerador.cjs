// Protótipo de gerador de fases parametrizado para o Mercadinho.
// Produz fases no MESMO formato de `levels` do index.html.

function criarAleatorio(semente) {
  let valor = semente >>> 0;
  return function aleatorio() {
    valor = (valor + 0x6d2b79f5) >>> 0;
    let n = valor;
    n = Math.imul(n ^ n >>> 15, n | 1);
    n ^= n + Math.imul(n ^ n >>> 7, n | 61);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}

function embaralhar(lista, aleatorio) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

const trioIgual = linha => linha[0] && linha.every(item => item === linha[0]);

// p = { prateleiras, tipos, folgas, fundos, fila, correntes }
//   prateleiras: compartimentos comuns (sem contar a caixa)
//   tipos:       quantidade de produtos diferentes
//   folgas:      vagas vazias na frente no início (menos folga = mais difícil)
//   fundos:      total de fileiras de trás espalhadas pelas prateleiras
//   fila:        produtos na caixa (0 = sem caixa)
//   correntes:   prateleiras com corrente
function gerarFase(p, semente, catalogo) {
  const aleatorio = criarAleatorio(semente);
  const S = p.prateleiras;
  const fila = p.fila || 0;
  const folgas = Math.min(p.folgas, 3 * S - 3);
  // O total de produtos precisa ser múltiplo de 3. Se sobrar 1 ou 2,
  // esses viram vagas vazias em fileiras de trás (ou folga extra na frente).
  const capacidade = 3 * S - folgas + 3 * p.fundos + fila;
  const buracos = capacidade % 3;
  const buracosNoFundo = p.fundos >= buracos ? buracos : 0;
  const folgasFinais = folgas + (buracos - buracosNoFundo);
  const total = capacidade - buracos;
  const trios = total / 3;
  const tipos = Math.min(p.tipos, trios, catalogo.length);
  const ids = embaralhar(catalogo.slice(), aleatorio).slice(0, tipos);

  // Cada tipo recebe pelo menos um trio; os trios extras são sorteados.
  const quantidade = ids.map(() => 1);
  for (let i = tipos; i < trios; i++) quantidade[Math.floor(aleatorio() * tipos)]++;
  const monte = embaralhar(ids.flatMap((id, i) => Array(3 * quantidade[i]).fill(id)), aleatorio);

  // Distribui as fileiras de trás (no máximo 2 por prateleira).
  const fundosPorPrateleira = Array(S).fill(0);
  for (let f = 0; f < p.fundos; f++) {
    const livres = fundosPorPrateleira.map((n, i) => n < 2 ? i : -1).filter(i => i >= 0);
    fundosPorPrateleira[livres[Math.floor(aleatorio() * livres.length)]]++;
  }

  // Escolhe as vagas vazias da frente.
  const vagas = embaralhar([...Array(3 * S).keys()], aleatorio).slice(0, folgasFinais);
  const vazia = new Set(vagas);

  const linhaComBuraco = new Set(embaralhar([...Array(p.fundos).keys()], aleatorio).slice(0, buracosNoFundo));
  let contadorFundo = 0;
  const tirar = () => monte.pop();
  const prateleiras = [];
  for (let s = 0; s < S; s++) {
    const back = [];
    for (let f = 0; f < fundosPorPrateleira[s]; f++) {
      const buraco = linhaComBuraco.has(contadorFundo++) ? Math.floor(aleatorio() * 3) : -1;
      back.push([0, 1, 2].map(slot => slot === buraco ? null : tirar()));
    }
    const front = [0, 1, 2].map(slot => vazia.has(3 * s + slot) ? null : tirar());
    prateleiras.push({ front, back });
  }
  const produtosCaixa = monte.splice(0, fila);
  const caixa = fila ? intercalarCaixa(produtosCaixa, aleatorio) : null;
  if (fila && !caixa) return null;
  if (monte.length) throw new Error('sobrou produto no monte');

  // Desfaz trios prontos (na frente ou no fundo) trocando produtos de lugar.
  const linhas = prateleiras.flatMap(pr => [pr.front, ...pr.back]);
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const ruim = linhas.find(trioIgual);
    if (!ruim) break;
    const outra = linhas[Math.floor(aleatorio() * linhas.length)];
    const a = Math.floor(aleatorio() * 3), b = Math.floor(aleatorio() * 3);
    if (outra[b] && outra[b] !== ruim[a]) [ruim[a], outra[b]] = [outra[b], ruim[a]];
  }
  if (linhas.some(trioIgual)) return null;

  // Correntes em prateleiras sorteadas, abrindo em sequência.
  const comCorrente = embaralhar([...Array(S).keys()], aleatorio).slice(0, p.correntes || 0);
  comCorrente.forEach((indice, ordem) => {
    prateleiras[indice].lock = { remaining: 1 + Math.floor(aleatorio() * 2), order: ordem };
  });

  const shelves = prateleiras.slice();
  if (caixa) shelves.splice(Math.floor(aleatorio() * (S + 1)), 0, caixa);
  return { shelves, layout: escolherFormato(shelves.length, aleatorio) };
}

// Coloca primeiro os tipos mais frequentes, evitando dois iguais seguidos.
function intercalarCaixa(itens, aleatorio) {
  const contagem = new Map();
  for (const item of embaralhar(itens.slice(), aleatorio)) {
    contagem.set(item, (contagem.get(item) || 0) + 1);
  }
  const fila = [];
  while (fila.length < itens.length) {
    const ultimo = fila.at(-1);
    const candidatos = [...contagem].filter(([item, n]) => n > 0 && item !== ultimo);
    candidatos.sort((a, b) => b[1] - a[1]);
    if (!candidatos.length) return null;
    const [item, n] = candidatos[0];
    contagem.set(item, n - 1);
    fila.push(item);
  }
  return { type: 'dispenser', front: [null, fila[0], null], back: [], queue: fila.slice(1) };
}

// Formato visual: lista de quantas prateleiras ficam em cada linha (máx. 3 por linha).
// Ex.: [3, 2, 3] = 3 em cima, 2 centralizadas no meio, 3 embaixo.
function escolherFormato(total, aleatorio) {
  const opcoes = [];
  (function montar(resto, linhas) {
    if (linhas.length > 4) return;
    if (resto === 0) { opcoes.push(linhas); return; }
    for (let n = 1; n <= Math.min(3, resto); n++) montar(resto - n, [...linhas, n]);
  })(total, []);
  // Evita linhas de 1 só, exceto no meio de formatos simétricos.
  const boas = opcoes.filter(f => f.filter(n => n === 1).length <= 1 && f[0] !== 1 && f[f.length - 1] !== 1 || (f.length === 3 && f[1] === 1 && f[0] === f[2]));
  const lista = boas.length ? boas : opcoes;
  return lista[Math.floor(aleatorio() * lista.length)];
}

module.exports = { gerarFase, criarAleatorio, embaralhar, escolherFormato };

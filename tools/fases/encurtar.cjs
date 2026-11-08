// Encurta o caminho achado pela dica: de cada posição do caminho, procura uma
// única jogada que pule direto para uma posição mais adiante do mesmo caminho.
// Repete até não melhorar. As jogadas são "concretizadas" de novo no fim, porque
// a comparação de posições ignora a ordem das vagas dentro da prateleira.
function encurtar(R, inicial, caminho) {
  const aplicar = (estado, jogada) => R.solveMove(estado, jogada.from, jogada.to);
  let atual = caminho.slice();
  for (let rodada = 0; rodada < 20; rodada++) {
    const estados = [inicial];
    for (const j of atual) estados.push(aplicar(estados[estados.length - 1], j));
    const indice = new Map();
    estados.forEach((e, i) => indice.set(R.searchKey(e), i)); // guarda a ÚLTIMA ocorrência
    const novo = [];
    let i = 0, estado = inicial;
    while (!R.isSolved(estado)) {
      const chaveAqui = indice.get(R.searchKey(estado));
      const base = chaveAqui === undefined ? i : chaveAqui;
      let melhor = null, destino = base;
      for (const j of R.possibleMoves(estado)) {
        const k = indice.get(R.searchKey(aplicar(estado, j)));
        if (k !== undefined && k > destino) { destino = k; melhor = j; }
      }
      if (!melhor) return null; // não deveria acontecer
      novo.push(melhor);
      estado = aplicar(estado, melhor);
      i = destino;
    }
    if (novo.length >= atual.length) return atual;
    atual = novo;
  }
  return atual;
}
module.exports = { encurtar };

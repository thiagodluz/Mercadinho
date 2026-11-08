const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const R = require('../tools/fases/regras.cjs')('index.html');
const { assinatura, dificuldade } = require('../tools/fases/avaliar.cjs');
const { mercadinhoCampanha: fases } = vm.runInNewContext(
  fs.readFileSync('fases.js', 'utf8') + '\n({ mercadinhoCampanha })'
);

async function main() {
  assert.equal(fases.length, 200);
  assert.equal(new Set(fases.map(assinatura)).size, fases.length);
  const formatos = new Set();
  const comprimentos = [];
  let formatoAnterior, repeticoes = 0;
  for (const [i, fase] of fases.entries()) {
    const label = `Fase ${i + 9}`;
    const { layout, shelves, hint } = fase;
    assert(layout.length <= 4 && layout.every(n => Number.isInteger(n) && n >= 1 && n <= 3), label);
    assert.equal(layout.reduce((a, b) => a + b, 0), shelves.length, label);
    const formato = layout.join('-');
    formatos.add(formato);
    repeticoes = formato === formatoAnterior ? repeticoes + 1 : 1;
    formatoAnterior = formato;
    assert(repeticoes <= 2, `Formato repetido em ${label}`);

    const contagem = new Map();
    for (const shelf of shelves) {
      assert(shelf.back.length <= 2, label);
      if (shelf.type === 'dispenser') {
        const fila = [shelf.front[1], ...shelf.queue];
        assert(fila.every((item, j) => item && item !== fila[j - 1]), `Fila repetida em ${label}`);
      }
      for (const item of [...shelf.front, ...shelf.back.flat(), ...(shelf.queue || [])]) {
        if (item === null) continue;
        assert(Object.hasOwn(R.products, item), label);
        contagem.set(item, (contagem.get(item) || 0) + 1);
      }
    }
    assert([...contagem.values()].every(n => n % 3 === 0), label);
    const dica = await R.findSolutionHint(shelves, R.novoPedido());
    assert.equal(dica.status, 'solved', label);
    assert.match(hint, /^(?:[0-9a-z]{2})+$/, label);
    const position = digit => {
      const index = parseInt(digit, 36);
      return { shelf: Math.floor(index / 3), slot: index % 3 };
    };
    let estado = shelves;
    for (const [origem, destino] of hint.match(/../g)) {
      const from = position(origem);
      const to = position(destino);
      const source = estado[from.shelf];
      const target = estado[to.shelf];
      assert(source.front[from.slot] && !source.lock?.remaining && !target.lock?.remaining &&
        target.type !== 'dispenser' && target.front[to.slot] === null, `Dica inválida em ${label}`);
      estado = R.solveMove(estado, from, to);
    }
    assert(R.isSolved(estado), label);
    assert(hint.length / 2 <= dica.path.length, label);
    comprimentos.push(hint.length / 2);
  }

  if (process.argv.includes('--dificuldade')) {
    const blocos = [];
    for (let i = 0; i < fases.length; i += 20) {
      const amostra = fases.slice(i, i + 20);
      const media = amostra.reduce((total, fase) => total + dificuldade(R, fase, 150, 4, 99), 0) / amostra.length;
      if (blocos.length) assert(media >= blocos.at(-1) - 0.03, `Queda na dificuldade das fases ${i + 9}–${i + 28}`);
      blocos.push(media);
      console.log(`Fases ${i + 9}–${i + 28}: ${media.toFixed(3)}`);
    }
  }

  comprimentos.sort((a, b) => a - b);
  console.log(`${fases.length} fases distintas, ${formatos.size} formatos, todas as dicas validadas. Dicas com mediana de ${(comprimentos[99] + comprimentos[100]) / 2} jogadas e máximo de ${comprimentos.at(-1)}.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });

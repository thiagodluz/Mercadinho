// Carrega as funções de regra REAIS do index.html (sem reescrever nada),
// para que o protótipo use exatamente as mesmas regras do jogo.
const fs = require('fs'), vm = require('vm');
module.exports = function carregarRegras(caminho) {
  const script = fs.readFileSync(caminho, 'utf8').match(/<script>([\s\S]*)<\/script>/)[1];
  const marker = '      updateAudioControls();\n\n      function itemMarkup';
  const src = script.replace(marker, `globalThis.R={products,levels,solveMove,possibleMoves,isSolved,searchKey,copy,findSolutionHint,novoPedido:()=>++hintRequest};\n${marker}`);
  const els = new Map();
  const el = id => { if (!els.has(id)) els.set(id, { handlers:{}, classList:{toggle(){}}, setAttribute(){}, querySelector(){return null}, addEventListener(e,c){this.handlers[e]=c} }); return els.get(id); };
  const st = { 'mercadinho-unlocked':'0', 'mercadinho-layout-seed':'1' };
  const ctx = vm.createContext({ document:{documentElement:el('h'),getElementById:el,addEventListener(){}}, window:{matchMedia:()=>({matches:true})}, navigator:{}, confirm:()=>true,
    localStorage:{getItem:k=>st[k]??null,setItem:(k,v)=>st[k]=v,removeItem:k=>delete st[k]}, setTimeout, clearTimeout, Date });
  vm.runInContext(src, ctx);
  return ctx.R;
};

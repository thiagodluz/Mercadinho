const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const R = require('../tools/fases/regras.cjs')('index.html');
const database = fs.readFileSync('fases.js', 'utf8');
const data = {}; vm.runInNewContext(database, data);
const count = level => level.shelves.reduce((n,s) => n + [...s.front, ...s.back.flat(), ...(s.queue || [])].filter(Boolean).length, 0);
for (const level of data.mercadinhoCorrida) {
  assert(count(level) >= 60 && count(level) <= 75);
  assert(level.shelves.length <= 11);
  assert(level.seconds >= 150 && level.seconds <= 300);
  let state = level.shelves;
  for (const pair of level.hint.match(/../g)) {
    const [a,b] = [...pair].map(d => parseInt(d,36));
    const from = {shelf:Math.floor(a/3),slot:a%3}, to = {shelf:Math.floor(b/3),slot:b%3};
    assert(state[from.shelf].front[from.slot] && !state[from.shelf].lock?.remaining);
    assert(!state[to.shelf].lock?.remaining && state[to.shelf].type !== 'dispenser' && state[to.shelf].front[to.slot] === null);
    state = R.solveMove(state,from,to);
  }
  assert(R.isSolved(state));
}
assert.equal(data.mercadinhoCorrida.length,24);
const script=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*)<\/script>/)[1];
const marker='      updateAudioControls();\n\n      function itemMarkup';
const instrumented=script.replace(marker,`globalThis.game={move,levelAt,openLevel,saveGame,shelfCells,updateClock,openGameDialog,state:()=>({clock,paused,timeOver,completed,animating,shelves,currentLevel}),first:()=>initialHintPath()[0]};\n${marker}`);
function setup(storage={}, search='?modo=corrida') {
  let now=1000,interval; const listeners={}, elements={};
  const el=id=>elements[id]??=( {hidden:false,open:false,handlers:{},classList:{toggle(){}},focus(){},setAttribute(){},querySelector(){return null;},addEventListener(e,fn){this.handlers[e]=fn;},showModal(){this.open=true;},close(){this.open=false;this.handlers.close?.();}} );
  const ctx=vm.createContext({document:{getElementById:el,documentElement:el('root'),hidden:false,addEventListener(e,fn){(listeners[e]??=[]).push(fn);}}, window:{matchMedia:()=>({matches:true}),addEventListener(){}}, location:{search},URLSearchParams,Date:{now:()=>now},navigator:{},confirm:()=>true,localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]},setInterval(fn){interval=fn;},setTimeout(fn,ms){if(ms===1800)return 0;return setTimeout(fn,0);},clearTimeout,console});
  vm.runInContext(database,ctx);vm.runInContext(instrumented,ctx);
  return {game:ctx.game,el,storage,advance(ms){now+=ms;interval?.();},hide(){ctx.document.hidden=true;for(const f of listeners.visibilitychange||[])f();},show(){ctx.document.hidden=false;for(const f of listeners.visibilitychange||[])f();}};
}
const delay=()=>new Promise(r=>setTimeout(r,5));
(async()=>{
 const storage={'mercadinho-unlocked':'19','mercadinho-partida-v1':'ZEN-INTOCADO'};
 const g=setup(storage), initial=g.game.state().clock.remaining;
 g.advance(5000);assert.equal(g.game.state().clock.remaining,initial,'não começa antes da primeira jogada');
 const first=g.game.first();assert(g.game.move(first.from,first.to));while(g.game.state().animating)await delay();
 g.advance(1300);assert.equal(g.game.state().clock.remaining,initial-1300);
 g.game.openGameDialog(g.el('pause-dialog'),g.el('resume'));g.advance(20000);assert.equal(g.game.state().clock.remaining,initial-1300,'pausa congela relógio');g.el('pause-dialog').close();
 g.advance(700);assert.equal(g.game.state().clock.remaining,initial-2000);
 g.hide();g.advance(50000);g.show();assert(g.game.state().paused);assert.equal(g.game.state().clock.remaining,initial-2000,'tempo fora do app não conta');g.el('pause-dialog').close();
 g.game.saveGame();const resumed=setup(storage);assert(resumed.game.state().paused,'retoma pausado');assert.equal(resumed.game.state().clock.remaining,initial-2000);
 resumed.el('pause-dialog').close();resumed.advance(initial);assert(resumed.game.state().timeOver);assert.equal(resumed.game.state().clock.remaining,0);assert(!resumed.game.move(first.from,first.to),'bloqueia jogada após expirar');
 const reopened=setup(storage);assert(reopened.game.state().timeOver,'reabrir não reinicia tempo expirado');
 reopened.el('retry-race').handlers.click();assert(!reopened.game.state().timeOver);assert(!reopened.game.state().clock.started);assert.equal(reopened.game.state().clock.remaining,initial);
 assert.equal(storage['mercadinho-unlocked'],'19');assert.equal(storage['mercadinho-partida-v1'],'ZEN-INTOCADO');
 for(let count=4;count<=11;count++)for(let variant=0;variant<2;variant++){const cells=g.game.shelfCells(count,variant);assert.equal(cells.length,count);assert.equal(new Set(cells).size,count);assert(cells.every(n=>n>=0&&n<11),'posição 11 sempre reservada');}
 console.log('24 fases Corrida resolvidas; relógio, pausa, suspensão, retomada, expiração, nova tentativa, isolamento do Zen e reserva fixa verificados.');
})().catch(e=>{console.error(e);process.exitCode=1;});

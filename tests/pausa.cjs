const fs=require('fs'),vm=require('vm'),assert=require('assert');let src=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*)<\/script>/)[1];src=src.replace('      updateAudioControls();\n\n      function itemMarkup',`      globalThis.game={move:(a,b,c,d)=>move({shelf:a,slot:b},{shelf:c,slot:d}),state:()=>JSON.parse(JSON.stringify({currentLevel,completed,shelves,history,paused}))};\n      updateAudioControls();\n\n      function itemMarkup`);const mem={};function setup(exitApp){const els={};const documentHandlers={};const el=id=>els[id]??=({handlers:{},focus(){},showModal(){this.open=true},close(){this.open=false;this.handlers.close()},classList:{toggle(){}},addEventListener(k,f){this.handlers[k]=f},setAttribute(){},textContent:'',hidden:false});const ctx={document:{documentElement:{classList:{toggle(){}}},getElementById:el,addEventListener(name,callback){documentHandlers[name]=callback},hidden:false},mercadinhoExit:exitApp,window:{matchMedia:()=>({matches:true})},navigator:{},localStorage:{getItem:k=>mem[k]??null,setItem:(k,v)=>mem[k]=String(v),removeItem:k=>delete mem[k]},setTimeout,clearTimeout,setInterval,clearInterval,console,confirm:()=>true,Math};vm.createContext(ctx);vm.runInContext(src,ctx);return {game:ctx.game,els,documentHandlers}} ;(async()=>{let {game,els}=setup();assert(game.move(1,0,3,0));await new Promise(r=>setTimeout(r,25));const before=game.state();els.pause.handlers.click();assert.equal(game.state().paused,true);assert.equal(els['pause-dialog'].open,true);els.resume.handlers.click();assert.equal(game.state().paused,false);assert.deepEqual(game.state().shelves,before.shelves);assert.equal(game.state().history.length,before.history.length);console.log('Pausa, retomada e preservação da partida verificadas.');})().catch(e=>{console.error(e);process.exitCode=1});
(async () => {
  let exits = 0;
  const { game, els, documentHandlers } = setup(async () => { exits++; });
  const before = game.state();
  assert.equal(els['exit-app'].hidden, false);
  assert.equal(documentHandlers['mercadinho-android-back'], undefined);
  assert.equal(game.state().paused, false);
  assert.equal(exits, 0);
  assert.deepEqual(game.state().shelves, before.shelves);
  els.pause.handlers.click();
  assert.equal(game.state().paused, true);
  await els['exit-app'].handlers.click();
  assert.equal(exits, 1);
  console.log('No Android, pausa e saída são acionadas pelos controles do jogo.');
})().catch(error => { console.error(error); process.exitCode = 1; });

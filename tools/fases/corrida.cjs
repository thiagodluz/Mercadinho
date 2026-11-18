// Gera 24 fases próprias com mais camadas, soluções verificadas e tempo inicial calibrável.
const root=require('node:path').resolve(__dirname,'../..')+'/';
const R=require(root+'tools/fases/regras.cjs')(root+'index.html');
const {gerarFase}=require(root+'tools/fases/gerador.cjs');
const {resolver,assinatura}=require(root+'tools/fases/avaliar.cjs');
const {encurtar}=require(root+'tools/fases/encurtar.cjs');
const fs=require('fs');const fases=[],seen=new Set();
for(let seed=1;fases.length<24&&seed<1500;seed++){
 const n=fases.length;
 const p={prateleiras:9,tipos:6+Math.min(4,Math.floor(n/5)),folgas: n<6?4:3,fundos:11+Math.min(4,Math.floor(n/5)),fila:6,correntes:n<4?0:1};
 const f=gerarFase(p,71820+seed,Object.keys(R.products));if(!f)continue;
 const sol=resolver(R,f.shelves,6000);if(!sol.ok||seen.has(assinatura(f)))continue;
 const path=encurtar(R,f.shelves,sol.caminho)||sol.caminho;
 if(path.length>160)continue;
 const encode=p=>(p.shelf*3+p.slot).toString(36);
 const hint=path.map(m=>encode(m.from)+encode(m.to)).join('');
 const products=f.shelves.reduce((n,s)=>n+[...s.front,...s.back.flat(),...(s.queue||[])].filter(Boolean).length,0);
 fases.push({...f,hint,seconds:Math.max(150,Math.min(300,Math.ceil(path.length*2.8))),products});seen.add(assinatura(f));console.log('Corrida',fases.length,products,'produtos',path.length,'jogadas',fases.at(-1).seconds,'segundos');

}
if(fases.length!==24)throw Error('Banco incompleto');

const file=root+'fases.js'; const base=fs.readFileSync(file,'utf8').split('// Corrida:')[0].trimEnd();
fs.writeFileSync(file,base+'\n\n// Corrida: 24 fases próprias, com soluções completas verificadas.\nglobalThis.mercadinhoCorrida = '+JSON.stringify(fases)+';\n');

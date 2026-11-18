const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),http=require('node:http'),path=require('node:path');
const data={};vm.runInNewContext(fs.readFileSync('fases.js','utf8'),data);
const server=http.createServer((req,res)=>{const file=path.join(process.cwd(),decodeURIComponent(new URL(req.url,'http://localhost').pathname));fs.readFile(file,(err,bytes)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream');res.end(bytes);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});const url=`http://127.0.0.1:${server.address().port}/index.html`;
 fs.mkdirSync('qa',{recursive:true});
 try{
 for(const [width,height] of [[360,640],[390,844],[768,1024]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Largest shelf count + rescue: no reflow, no moved shelves, no extra row.
  const index=data.mercadinhoCampanha.findIndex(l=>l.shelves.length===11),level=index+8,original=data.mercadinhoCampanha[index];
  await context.addInitScript(({level,original})=>{localStorage.setItem('mercadinho-unlocked',String(level));if(sessionStorage.getItem('extra'))localStorage.setItem('mercadinho-partida-v1',JSON.stringify({version:1,generator:6,level,shelves:[...original.shelves,{type:'extra',front:[null,null,null],back:[]}],history:[]}));},{level,original});
  await page.goto(url);const before=await page.locator('#board').boundingBox();const slots=await page.locator('.slot[data-slot="0"]').evaluateAll(els=>els.map(e=>({id:e.dataset.shelf,x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y})));
  await page.evaluate(()=>sessionStorage.setItem('extra','1'));await page.reload();const after=await page.locator('#board').boundingBox();assert.deepEqual(after,before);
  const slotsAfter=await page.locator('.slot[data-slot="0"]').evaluateAll(els=>els.map(e=>({id:e.dataset.shelf,x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y})));
  for(const s of slots){const t=slotsAfter.find(t=>t.id===s.id);assert(Math.abs(t.x-s.x)<0.1&&Math.abs(t.y-s.y)<0.1,'resgate não desloca nichos além do arredondamento subpixel');}
  const extra=await page.locator('[data-shelf="11"][data-slot="0"]').boundingBox();assert(extra.y+extra.height<=after.y+after.height+1);
  await page.screenshot({path:`qa/zen-extra-${width}.png`,fullPage:true});
  await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
  await page.getByRole('button',{name:/^Corrida/}).click();await page.waitForURL(/modo=corrida/);
  assert(await page.locator('#race-clock').isVisible());assert.equal(await page.locator('#mode-corrida').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('.slot img').count()>0,true);
  const controls=await page.locator('.controls').boundingBox();assert(controls.y+controls.height<=height,`controles corrida fora da tela ${width}x${height}`);
  const [a,b]=[...data.mercadinhoCorrida[0].hint.slice(0,2)].map(d=>parseInt(d,36));
  const select=i=>`[data-shelf="${Math.floor(i/3)}"][data-slot="${i%3}"]`;
  await page.locator(select(a)).click();await page.locator(select(b)).click();await page.waitForFunction(()=>document.querySelector('#board').getAttribute('aria-busy')==='false');
  assert.equal(await page.locator('#clock-label').textContent(),'Tempo restante');
  await page.locator('#pause').click();const clock=await page.locator('#clock-value').textContent();await page.waitForTimeout(1200);assert.equal(await page.locator('#clock-value').textContent(),clock);await page.locator('#resume').click();
  await page.screenshot({path:`qa/corrida-${width}.png`,fullPage:true});
  // Reload with 1 second left: resumes paused, then expires and blocks moves.
  await page.evaluate(()=>{const k='mercadinho-corrida-partida-v1';const s=JSON.parse(localStorage.getItem(k));s.clock.remaining=1000;s.clock.started=true;localStorage.setItem(k,JSON.stringify(s));});await page.reload();assert(await page.locator('#pause-dialog').isVisible());await page.locator('#resume').click();
  await page.locator('#retry-race').waitFor({state:'visible',timeout:5000});assert.equal(await page.locator('#win-title').textContent(),'Tempo esgotado!');
  await page.locator('#retry-race').click();assert(!(await page.locator('#retry-race').isVisible()));assert.equal(await page.locator('#clock-label').textContent(),'Começa na primeira jogada');
  await page.getByRole('button',{name:/^Zen/}).click();await page.waitForURL(u=>!u.searchParams.has('modo'));assert(!(await page.locator('#race-clock').isVisible()));
  assert.deepEqual(errors,[]);await context.close();console.log(`Corrida, pausa, expiração, reinício e reserva fixa: ${width}x${height} OK`);
 }
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});

const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const html = fs.readFileSync('experimentos/prateleiras-zen/index.html');
const server = http.createServer((req,res) => res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}).end(html));
(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({headless:true});
  try {
    for (const mobile of [true,false]) {
      const context = await browser.newContext({viewport:{width:390,height:844},isMobile:mobile,hasTouch:mobile});
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${server.address().port}/?teste=20`);
      const from = await page.locator('[data-shelf="10"][data-slot="0"]').boundingBox();
      const occupied = await page.locator('[data-shelf="9"][data-slot="0"]').boundingBox();
      const center = b => [b.x+b.width/2,b.y+b.height/2];
      await page.mouse.move(...center(from)); await page.mouse.down();
      await page.mouse.move(...center(occupied)); await page.mouse.up();
      await page.waitForFunction(() => document.querySelector('#board').getAttribute('aria-busy') === 'false');
      assert.match(await page.locator('[data-shelf="9"][data-slot="0"]').getAttribute('aria-label'), /Café/);
      assert(await page.locator('#undo').isEnabled());
      console.log(`Arraste rápido sobre produto existente: ${mobile?'celular':'mouse'} OK`);
      await context.close();
    }
  } finally { await browser.close(); server.close(); }
})().catch(e => {console.error(e);process.exitCode=1;server.close()});

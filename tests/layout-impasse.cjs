const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const http = require('node:http');
const path = require('node:path');
const campaign = {};
vm.runInNewContext(fs.readFileSync('fases.js', 'utf8'), campaign);
const server = http.createServer((request, response) => {
  const file = path.join(process.cwd(), decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  fs.readFile(file, (error, bytes) => {
    if (error) return response.writeHead(404).end();
    if (file.endsWith('.js')) response.setHeader('Content-Type', 'text/javascript');
    if (file.endsWith('.html')) response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(bytes);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    for (const level of [62, 70]) {
      const original = campaign.mercadinhoCampanha[level - 9];
      assert.equal(original.layout.length, 4);
      const shelves = JSON.parse(JSON.stringify(original.shelves));
      for (const shelf of shelves) {
        if (shelf.type !== 'dispenser') shelf.front = ['milk', 'coffee', 'jam'];
      }
      const snapshot = JSON.stringify({ version: 1, generator: 5, level: level - 1, shelves, history: [shelves] });
      for (const [width, height] of [[360, 640], [390, 844]]) {
        for (const android of [false, true]) {
          const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
          await context.addInitScript(({ snapshot, level, android }) => {
            localStorage.setItem('mercadinho-unlocked', String(level - 1));
            localStorage.setItem('mercadinho-partida-v1', snapshot);
            if (android) document.documentElement.classList.add('android-game', 'android-immersive');
          }, { snapshot, level, android });
          const page = await context.newPage();
          await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
          await page.locator('#turn-status.stalled').waitFor();
          const notice = await page.locator('#turn-status').boundingBox();
          const recovery = await page.locator('#recover-shelf').boundingBox();
          const undo = await page.locator('#undo').boundingBox();
          assert(notice.y >= 0 && notice.y + notice.height <= height, `aviso fora da tela: fase ${level}, ${width}x${height}`);
          assert(recovery.y >= 0 && recovery.y + recovery.height <= height, `resgate fora da tela: fase ${level}, ${width}x${height}`);
          assert(undo.y >= 0 && undo.y + undo.height <= height, `desfazer fora da tela: fase ${level}, ${width}x${height}`);
          assert(await page.locator('#hint').isHidden());
          assert(await page.locator('#recover-undo').isHidden());
          await page.locator('#pause').click();
          assert(await page.locator('#pause-dialog #progress').isVisible());
          assert(await page.locator('#pause-dialog').getByText('Som e vibração').isVisible());
          assert(await page.locator('#pause-dialog').getByText('Acessibilidade').isVisible());
          await page.locator('#resume').click();
          assert(await page.locator('#recover-shelf').isVisible());
          console.log(`Fase ${level}, ${width}x${height}, ${android ? 'Android' : 'web'}: impasse e pausa visíveis.`);
          await context.close();
        }
      }
    }
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });

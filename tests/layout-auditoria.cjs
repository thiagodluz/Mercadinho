const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const http = require('node:http');
const path = require('node:path');

const campaign = {};
vm.runInNewContext(fs.readFileSync('fases.js', 'utf8'), campaign);
const phase = campaign.mercadinhoCampanha[61];
assert.equal(phase.layout.length, 4);
const shelves = JSON.parse(JSON.stringify(phase.shelves));
shelves.push({ type: 'extra', front: [null, null, null], back: [] });
const snapshot = JSON.stringify({ version: 1, generator: 5, level: 69, shelves, history: [] });
const server = http.createServer((request, response) => {
  const file = path.join(process.cwd(), decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  fs.readFile(file, (error, bytes) => {
    if (error) { response.writeHead(404).end(); return; }
    if (file.endsWith('.js')) response.setHeader('Content-Type', 'text/javascript');
    if (file.endsWith('.html')) response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(bytes);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, height] of [[360, 640], [360, 740], [390, 844]]) {
      for (const android of [false, true]) {
        const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
        await context.addInitScript(({ snapshot, android }) => {
          localStorage.setItem('mercadinho-unlocked', '69');
          localStorage.setItem('mercadinho-partida-v1', snapshot);
          if (android) document.documentElement.classList.add('android-game', 'android-immersive');
        }, { snapshot, android });
        const page = await context.newPage();
        await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
        await page.locator('.board-four-rows.has-extra').waitFor();
        const buttons = await page.locator('.controls').boundingBox();
        console.log(`${width}x${height} ${android ? 'Android' : 'web'}: botões até ${buttons.y + buttons.height}px`);
        assert(buttons.y >= 0 && buttons.y + buttons.height <= height, 'Controles fora da tela');
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });

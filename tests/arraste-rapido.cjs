const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const server = http.createServer((req, res) => {
  const file = path.join(process.cwd(), decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  fs.readFile(file, (error, bytes) => {
    if (error) return res.writeHead(404).end();
    if (file.endsWith('.js')) res.setHeader('Content-Type', 'text/javascript');
    if (file.endsWith('.html')) res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(bytes);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await context.addInitScript(() => { Element.prototype.setPointerCapture = function () {}; });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}/index.html`;
    await page.goto(url);
    const source = page.locator('[data-shelf="1"][data-slot="2"]');
    const target = page.locator('[data-shelf="0"][data-slot="2"]');
    const from = await source.boundingBox();
    const to = await target.boundingBox();
    await source.dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'touch', button: 0, clientX: from.x + from.width / 2, clientY: from.y + from.height / 2 });
    await page.locator('#board').dispatchEvent('pointerup', { pointerId: 1, pointerType: 'touch', button: 0, clientX: to.x + to.width / 2, clientY: to.y + to.height / 2 });
    await page.waitForFunction(() => document.querySelector('#board').getAttribute('aria-busy') === 'false');
    assert(await page.locator('#undo').isEnabled(), 'arraste sem pointermove deve registrar jogada');
    await page.locator('#settings-toggle').click();
    await page.locator('#settings-dialog').getByText('Acessibilidade').click();
    const option = page.locator('#gesture-margin');
    assert(await option.isVisible(), 'opção de bordas deve estar visível');
    await option.check();
    await page.locator('#settings-close').click();
    const bounds = await page.locator('.board-stage').boundingBox();
    assert(bounds.x >= 23, `margem esperada, obtido ${bounds.x}`);
    await page.reload();
    await page.locator('#settings-toggle').click();
    await page.locator('#settings-dialog').getByText('Acessibilidade').click();
    assert(await option.isChecked(), 'preferência deve ser mantida');
    assert.deepEqual(errors, []);
    console.log('Arraste rápido sem pointermove, engrenagem e preferência de bordas verificados.');
    await context.close();
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });

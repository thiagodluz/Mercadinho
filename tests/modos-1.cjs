const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
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
    for (const [width, height] of [[360, 640], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, isMobile: true, hasTouch: true });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
      const zen = page.getByRole('button', { name: 'Zen', exact: true });
      const soon = page.getByRole('button', { name: 'Em breve', exact: true });
      assert.equal(await zen.getAttribute('aria-pressed'), 'true');
      assert.equal(await soon.isDisabled(), true);
      const a = await zen.boundingBox();
      const b = await soon.boundingBox();
      assert(Math.abs(a.width - a.height) < 1 && Math.abs(b.width - b.height) < 1);
      assert(b.x > a.x + a.width && Math.abs(a.y - b.y) < 1);
      await zen.click();
      assert.equal(await zen.getAttribute('aria-pressed'), 'true');
      await page.locator('[data-shelf="1"][data-slot="2"]').click();
      await page.locator('[data-shelf="0"][data-slot="2"]').click();
      await page.waitForFunction(() => document.querySelector('#board').getAttribute('aria-busy') === 'false');
      assert(await page.locator('#undo').isEnabled());
      assert.deepEqual(errors, []);
      console.log(`Modos e jogada verificadas em ${width}x${height}.`);
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });

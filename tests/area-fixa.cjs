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
    for (const [width, height] of [[360, 640], [360, 740], [390, 844]]) {
      let stageHeight, stageTop;
      for (const level of [1, 4, 6, 8, 9, 20, 62, 70]) {
        const page = await browser.newPage({ viewport: { width, height }, isMobile: true, hasTouch: true });
        await page.goto(`http://127.0.0.1:${server.address().port}/index.html?teste=${level}`);
        const stage = await page.locator('.board-stage').boundingBox();
        const board = await page.locator('#board').boundingBox();
        const controls = await page.locator('.controls').boundingBox();
        stageHeight ??= stage.height;
        stageTop ??= stage.y;
        assert(Math.abs(stage.height - stageHeight) < 1, `Área mudou na fase ${level}`);
        assert(Math.abs(stage.y - stageTop) < 1, `Área mudou de posição na fase ${level}`);
        assert(board.y >= stage.y - 1 && board.y + board.height <= stage.y + stage.height + 1, `Tabuleiro fora da área na fase ${level}`);
        assert(controls.y + controls.height <= height, `Botões fora da tela na fase ${level} (${width}x${height})`);
        console.log(`${width}x${height}, fase ${level}: área y=${stage.y}, altura=${stage.height}; botões y=${controls.y}`);
        await page.close();
      }
    }
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });

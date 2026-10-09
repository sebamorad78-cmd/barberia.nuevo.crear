// Exporta la tarjeta personal (90 x 50 mm, frente y dorso) a entrega/tarjeta/.
// Uso: servir el proyecto en http://localhost:8765 y correr  node marketing/tarjeta/render.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', '..', 'entrega', 'tarjeta');
const URL = 'http://localhost:8765/marketing/tarjeta/tarjeta.html';
const mmPx = mm => mm * 96 / 25.4;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  async function abrir(q, dsf) {
    const p = await b.newPage({ viewport: { width: 500, height: 600 }, deviceScaleFactor: dsf || 1 });
    await p.goto(URL + q); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400); return p;
  }
  let p = await abrir('');
  await p.pdf({ path: path.join(OUT, 'tarjeta-90x50.pdf'), width: '90mm', height: '50mm', printBackground: true });
  await p.close(); p = await abrir('?bleed=1');
  await p.pdf({ path: path.join(OUT, 'tarjeta-imprenta-sangrado3mm.pdf'), width: '96mm', height: '56mm', printBackground: true });
  // Vista previa en PNG a 600 dpi
  await p.close(); p = await abrir('', 600 / 96);
  const cards = await p.$$('.card');
  for (const [i, n] of [[0, 'frente'], [1, 'dorso']]) {
    const r = await cards[i].boundingBox();
    await p.screenshot({ path: path.join(OUT, `tarjeta-${n}.png`), clip: { x: r.x, y: r.y, width: mmPx(90) - .5, height: mmPx(50) - .5 } });
  }
  await b.close(); console.log('listo');
})();

// Exporta las 5 placas del carrusel (1080 x 1350, 4:5) a entrega/carrusel/.
// Uso: servir el proyecto en http://localhost:8765 y correr  node marketing/carrusel/render.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', '..', 'entrega', 'carrusel');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1 });
  await p.goto('http://localhost:8765/marketing/carrusel/carrusel.html');
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  for (let i = 1; i <= 5; i++) await (await p.$('#s' + i)).screenshot({ path: path.join(OUT, `placa-${i}.png`) });
  await b.close(); console.log('listo');
})();
